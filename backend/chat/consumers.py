from datetime import timezone
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist

from .utils import notify_about_unread_chats


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_id: int = 0
        self.room_group_name: str = ""
        self.room = None
        self.interlocutor = None

    async def connect(self):
        user = self.scope['user']
        if user.is_anonymous:
            await self.close(code=1006)
            return
        self.room_id = int(self.scope['url_route']['kwargs']['room_id'])
        is_valid_user, error_code = await self.is_user_in_room(self.scope['user'])
        if not is_valid_user:
            await self.accept()
            await self.close(code=error_code)
            return
        self.room_group_name = f'chat_{self.room_id}'
        self.username = self.scope['user'].username
        self.redis = self.scope['redis_pool']
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        key_user_count = f'chat:{self.room_group_name}:user_count'
        await self.redis.incr(key_user_count)
        await self.load_previous_messages()
    
    async def is_user_in_room(self, user):
        from .models import ChatRoom

        try:
            self.room = await ChatRoom.objects.select_related('user1', 'user2', 'unread_by') \
                .aget(id=self.room_id)
            if user == self.room.user1:
                self.interlocutor = self.room.user2
            elif user == self.room.user2:
                self.interlocutor = self.room.user1
            else:
                return False, 4001
            return True, 0
        except ObjectDoesNotExist:
            return False, 4000

    async def load_previous_messages(self):
        for msg in self.room.history:
            await self.send_message(msg)
        key_messages = f'chat:{self.room_group_name}:messages'
        redis_messages = await self.redis.lrange(key_messages, 0, -1)
        for msg in redis_messages:
            await self.send_message(json.loads(msg))
        await self.update_unread_by(None)

    async def disconnect(self, close_code):
        if self.scope['user'].is_anonymous:
            return
        if not self.room:
            return
        key_user_count = f'chat:{self.room_group_name}:user_count'
        user_count = await self.redis.decr(key_user_count)
        if user_count <= 0:
            await self.save_messages()
            await self.redis.delete(key_user_count)
            await self.redis.delete(f'chat:{self.room_group_name}:messages')
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        from .models import ChatRoom
        
        data = json.loads(text_data)

        self.room = await ChatRoom.objects.select_related('blocked_by', 'unread_by') \
            .aget(id=self.room_id)
        if self.room.blocked_by:
            await self.send(text_data=json.dumps({
                'message': "This chatroom is blocked. You cannot send messages."
            }))
            return

        key_user_count = f'chat:{self.room_group_name}:user_count'
        user_count = int(await self.redis.get(key_user_count) or 0)
        if user_count == 1:
            await self.update_unread_by(self.interlocutor)

        chat_message = {
            'username': self.username,
            'message': data['message']
        }
        redis_key = f'chat:{self.room_group_name}:messages'
        await self.redis.rpush(redis_key, json.dumps(chat_message))
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_message',
                'username': self.username,
                'message': data['message']
            }
        )

    async def update_unread_by(self, user):
        if user == None and self.room.unread_by == self.scope['user']:
            self.room.unread_by = None
        elif user == self.interlocutor and self.room.unread_by != self.interlocutor:
            self.room.unread_by = self.interlocutor
        else:
            return
        await database_sync_to_async(self.room.save)()
        notified_user = user if self.room.unread_by is not None else self.scope['user']
        await notify_about_unread_chats(notified_user)

    async def send_message(self, event):
        message = f"{event['username']}: {event['message']}"
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def save_messages(self):
        from .models import ChatRoom

        messages = await self.redis.lrange(f'chat:{self.room_group_name}:messages', 0, -1)
        messages = [json.loads(msg) for msg in messages]
        self.room = await ChatRoom.objects.aget(id=self.room_id)
        self.room.history.extend(messages)
        await database_sync_to_async(self.room.save)()
