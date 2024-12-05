from django.db import transaction

from .models import FriendshipRequest, UserProfile


class UserProfileService:

    @staticmethod
    def get_user_profile(username: str) -> UserProfile:
        try:
            return UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            raise ValueError(f'User "{username}" not found')

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
    def accept(request: FriendshipRequest):
        if request.status != 'pending':
            raise ValueError('Cannot accept not pending friendship request')
        UserProfileService.add_friend(request.from_user, request.to_user)
        request.status = 'accepted'
        request.save()
