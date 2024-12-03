from django.db import transaction

from .models import FriendshipRequest, UserProfile


class UserProfileService:

    @staticmethod
    def get_user_profile(username: str) -> UserProfile | None:
        try:
            return UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            return None

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

    def is_friend(user: UserProfile, friend: UserProfile) -> bool:
        return user.friends.filter(id=friend.id).exists()


class FriendshipRequestService:
    @staticmethod
    @transaction.atomic
    def accept(request: FriendshipRequest):
        if request.status != 'pending':
            raise ValueError('Cannot accept not pending friendship request')
        UserProfileService.add_friend(request.from_user, request.to_user)
        request.status = 'accepted'
        request.save()
