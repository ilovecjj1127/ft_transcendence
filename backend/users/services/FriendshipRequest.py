from django.db import transaction
from django.db.models import Prefetch

from .UserProfile import UserProfileService
from ..models import FriendshipRequest, UserProfile


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
