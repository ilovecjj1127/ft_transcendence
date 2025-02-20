from .models import ChatRoom
from users.models import UserProfile
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q

class ChatRoomService:
	@staticmethod
	@transaction.atomic
	def get_or_create_chat(name: str, user1: UserProfile, username: str):
		user2 = UserProfile.objects.get(username=username)
		chatroom = ChatRoom.objects.filter(
			(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1))
		).first()
		if chatroom:
			return chatroom, False
		if not name:
			raise ValueError('chat room cannot be empty when creating a new one')
		chatroom = ChatRoom.objects.create(user1=user1, user2=user2, name=name)
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
			chatroom.save
			return chatroom