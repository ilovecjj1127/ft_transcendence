from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
import json


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_id: int = 0
        self.room_group_name: str = ""
        self.room = None

    async def connect(self):
        from .models import ChatRoom

        if self.scope['user'].is_anonymous:
            await self.close(code=1006)
            return
        self.room_id = int(self.scope['url_route']['kwargs']['room_id'])
        try:
            self.room = await database_sync_to_async(ChatRoom.objects.get)(id=self.room_id)
        except ObjectDoesNotExist:
            await self.accept()
            await self.close(code=4000)
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

    async def load_previous_messages(self):
        history_messages = await database_sync_to_async(lambda: self.room.history)()
        for msg in history_messages:
            await self.send_message(msg)
        key_messages = f'chat:{self.room_group_name}:messages'
        redis_messages = await self.redis.lrange(key_messages, 0, -1)
        for msg in redis_messages:
            await self.send_message(json.loads(msg))

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

        self.room = await database_sync_to_async(ChatRoom.objects.get)(id=self.room_id)
        blocked_by = await database_sync_to_async(lambda: self.room.blocked_by)()
        if blocked_by:
            await self.send(text_data=json.dumps({
                'message': "This chatroom is blocked. You cannot send messages."
            }))
            return

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

    async def send_message(self, event):
        message = f"{event['username']}: {event['message']}"
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def save_messages(self):
        messages = await self.redis.lrange(f'chat:{self.room_group_name}:messages', 0, -1)
        messages = [json.loads(msg) for msg in messages]
        self.room.history.extend(messages)
        await database_sync_to_async(self.room.save)()

