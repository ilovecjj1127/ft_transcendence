from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Prefetch
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, \
    OutstandingToken
from rest_framework_simplejwt.exceptions import TokenError

from ..models import FriendshipRequest, UserProfile


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
    def refresh_token(token: str) -> dict:
        try:
            new_token = RefreshToken(token)
            return {
                "access": str(new_token.access_token),
                "refresh": str(new_token)
            }
        except TokenError as e:
            raise ValueError(str(e))

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
