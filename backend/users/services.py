from django.contrib.auth import authenticate
from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
import jwt
import pyotp
import qrcode
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, \
    OutstandingToken
from rest_framework_simplejwt.exceptions import TokenError

import base64
import datetime
from io import BytesIO
from uuid import UUID

from .models import FriendshipRequest, UserProfile


class UserProfileService:

    @staticmethod
    def get_user_profile(username: str) -> UserProfile:
        try:
            return UserProfile.objects.prefetch_related('friends').get(username=username)
        except UserProfile.DoesNotExist:
            raise ValueError(f'User "{username}" not found')

    @staticmethod
    def get_my_profile(user: UserProfile) -> UserProfile:
        return UserProfile.objects.prefetch_related(
            'friends',
            Prefetch(
                'received_requests',
                queryset=FriendshipRequest.objects.filter(status='pending') \
                    .select_related('from_user').only('from_user__username')
            ),
            Prefetch(
                'sent_requests',
                queryset=FriendshipRequest.objects.filter(status='pending') \
                    .select_related('to_user').only('to_user__username')
            )
        ).get(id=user.id)

    @staticmethod
    @transaction.atomic
    def logout(refresh_token: str):
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            raise ValueError(str(e))

    @staticmethod
    @transaction.atomic
    def invalidate_all_tokens(user: UserProfile):
        tokens = OutstandingToken.objects.filter(user=user)
        tokens = [BlacklistedToken(token=token) for token in tokens]
        BlacklistedToken.objects.bulk_create(tokens, ignore_conflicts=True)

    @staticmethod
    @transaction.atomic
    def change_password(user: UserProfile, old_password: str, new_password: str):
        user_check = authenticate(username=user.username, password=old_password)
        if user_check is None:
            raise ValueError('Invalid credentials')
        if old_password == new_password:
            raise ValueError('New password should not be the same')
        user.set_password(new_password)
        user.save()
        UserProfileService.invalidate_all_tokens(user)

    @staticmethod
    @transaction.atomic
    def add_friend(user: UserProfile, friend: UserProfile):
        if user == friend:
            raise ValueError('User cannot add themself as freind')
        if user.friends.filter(id=friend.id).exists():
            raise ValueError('These users are already friends')
        user.friends.add(friend)

    @staticmethod
    @transaction.atomic
    def remove_friend(user: UserProfile, friend: UserProfile):
        if user == friend:
            raise ValueError('User cannot remove themself from friends')
        if not user.friends.filter(id=friend.id).exists():
            raise ValueError('These users are not friends')
        user.friends.remove(friend)

    @staticmethod
    def are_friends(user: UserProfile, friend: UserProfile) -> bool:
        if user.pk == friend.pk:
            raise ValueError('Both arguments are the same user')
        return user.friends.filter(id=friend.id).exists()


    @staticmethod
    @transaction.atomic
    def update_avatar(user: UserProfile, avatar):
        user.avatar = avatar
        user.save()


class FriendshipRequestService:
    @staticmethod
    @transaction.atomic
    def create(from_user: UserProfile, to_user: UserProfile):
        if UserProfileService.are_friends(from_user, to_user):
            raise ValueError('Users are friends already')
        try:
            request = FriendshipRequest.objects.get(from_user=to_user, to_user=from_user)
            if request.status == 'pending':
                raise ValueError('Incoming pending request already exist')
        except FriendshipRequest.DoesNotExist:
            pass
        try:
            request = FriendshipRequest.objects.get(from_user=from_user, to_user=to_user)
            if request.status == 'pending':
                raise ValueError('Outgoing pending request already exist')
            request.status = 'pending'
            request.save()
        except FriendshipRequest.DoesNotExist:
            FriendshipRequest.objects.create(from_user=from_user, to_user=to_user)

    @staticmethod
    @transaction.atomic
    def accept(request_id: int, to_user: UserProfile):
        try:
            request = FriendshipRequest.objects.select_related('from_user').get(id=request_id)
        except FriendshipRequest.DoesNotExist:
            raise ValueError('Friendship request not found')
        if request.to_user_id != to_user.id:
            raise ValueError('It is not an incoming friendship request to this user')
        if request.status != 'pending':
            raise ValueError('Cannot accept not pending friendship request')
        UserProfileService.add_friend(request.from_user, to_user)
        request.status = 'accepted'
        request.save()

    @staticmethod
    @transaction.atomic
    def reject(request_id: int, to_user: UserProfile):
        try:
            request = FriendshipRequest.objects.get(id=request_id)
        except FriendshipRequest.DoesNotExist:
            raise ValueError('Friendship request not found')
        if request.to_user_id != to_user.id:
            raise ValueError('It is not an incoming friendship request to this user')
        if request.status != 'pending':
            raise ValueError('Cannot reject not pending friendship request')
        request.status = 'rejected'
        request.save()

    @staticmethod
    @transaction.atomic
    def cancel(request_id: int, from_user: UserProfile):
        try:
            request = FriendshipRequest.objects.get(id=request_id)
        except FriendshipRequest.DoesNotExist:
            raise ValueError('Friendship request not found')
        if request.from_user_id != from_user.id:
            raise ValueError('It is not an outgoing friendship request from this user')
        if request.status != 'pending':
            raise ValueError('Cannot cancel not pending friendship request')
        request.status = 'canceled'
        request.save()

    @staticmethod
    @transaction.atomic
    def break_off_friendship(user: UserProfile, friend_name: str):
        if user.username == friend_name:
            raise ValueError('User cannot remove themself from friends')
        friend_queryset = UserProfile.objects.prefetch_related(
            'friends',
            Prefetch(
                'received_requests',
                queryset=FriendshipRequest.objects.filter(from_user=user, status='accepted')
            ),
            Prefetch(
                'sent_requests',
                queryset=FriendshipRequest.objects.filter(to_user=user, status='accepted')
            )
        )
        try:
            friend = friend_queryset.get(username=friend_name)
        except UserProfile.DoesNotExist:
            raise ValueError(f'User "{friend_name}" not found')
        if user not in friend.friends.all():
            raise ValueError('These users are not friends')
        received_requests = friend.received_requests.all()
        sent_requests = friend.sent_requests.all()
        if received_requests:
            request = received_requests[0]
            request.status = "canceled"
        elif sent_requests:
            request = sent_requests[0]
            request.status = "rejected"
        else:
            raise ValueError('No accepted friendship request found')
        request.save()
        user.friends.remove(friend)


class User2FAService:
    @staticmethod
    def generate_otp_secret() -> str:
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(secret: str, username: str) -> str:
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=username, issuer_name="FT_TRANSCENDENCE")

    @staticmethod
    def generate_qr_code(provisioning_uri) -> bytes:
        # <img src="data:image/png;base64,{{ qr_code_data }}" alt="QR code"/> to display QR code
        qr = qrcode.QRCode(box_size=10, border=4)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return img_str

    @staticmethod
    def verify_otp_code(secret: str, user_input_code: str) -> bool:
        totp = pyotp.TOTP(secret)
        return totp.verify(user_input_code)

    @staticmethod
    @transaction.atomic
    def connect_with_2fa_app(user: UserProfile):
        if user.is_2fa_enabled:
            raise ValueError('2FA is already enabled')
        user.otp_secret = User2FAService.generate_otp_secret()
        user.save()
        provisioning_uri = User2FAService.get_provisioning_uri(
            secret=user.otp_secret,
            username=user.username
        )
        return User2FAService.generate_qr_code(provisioning_uri)

    @staticmethod
    @transaction.atomic
    def setup_2fa(user: UserProfile, user_code: str):
        if user.is_2fa_enabled:
            raise ValueError('2FA is already enabled')
        otp_secret = user.otp_secret
        if not otp_secret:
            raise ValueError('OTP secret was not set')
        if not User2FAService.verify_otp_code(otp_secret, user_code):
            raise ValueError('Invalid code. Try again')
        user.is_2fa_enabled = True
        user.save()

    @staticmethod
    def create_partial_token(user_id: UUID) -> str:
        """
        Creates a short-lived JWT indicating the user passed the password check
        but still needs to pass 2FA.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        exp = now + datetime.timedelta(minutes=5)
        payload = {
            "user_id": str(user_id),
            "type": "pending_2fa",
            "iat": now,
            "exp": exp
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    @staticmethod
    def decode_partial_token(token: str) -> dict:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
