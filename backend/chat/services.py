from .models import ChatRoom
from users.models import UserProfile
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.exceptions import ValidationError


class ChatRoomService:
    @staticmethod
    @transaction.atomic
    def get_or_create_chat(user1: UserProfile, username: str):
        if user1.username == username:
            raise ValidationError("You cannot create a chat with yourself.")
        user2 = UserProfile.objects.get(username=username)
        chatroom = ChatRoom.objects.filter(
            (Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1))
        ).select_related('blocked_by').only('blocked_by__username').first()
        if chatroom:
            return chatroom, False
        chatroom = ChatRoom.objects.create(user1=user1, user2=user2)
        return chatroom, True

    @staticmethod
    @transaction.atomic
    def block_action(user: UserProfile, chatroom_id: int) -> ChatRoom:
        chatroom = get_object_or_404(ChatRoom, id=chatroom_id)
        if user not in [chatroom.user1, chatroom.user2]:
            raise PermissionError('No permission to block or unblock this chatroom')
        if not chatroom.blocked_by:
            chatroom.blocked_by = user
            chatroom.save()
            return chatroom
        elif chatroom.blocked_by != user:
            raise PermissionError('You are blocked by another user already.')
        else:
            chatroom.blocked_by = None
            chatroom.save()
            return chatroom

    @staticmethod
    def get_unread_chats(user: UserProfile) -> list[str]:
        chats = ChatRoom.objects.filter(unread_by=user).select_related('user1', 'user2') \
            .only('user1__username', 'user2__username')
        return [chat.user1.username if chat.user1 != user else chat.user2.username for chat in chats]
