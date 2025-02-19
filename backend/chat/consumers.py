from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom
import json


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name: str = ""
        self.room_group_name: str = ""

    async def connect(self):
        if self.scope['user'].is_anonymous:
            await self.close()
            return
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room = await database_sync_to_async(ChatRoom.objects.get)(name=self.room_name)
        self.room_group_name = f'chat_{self.room_name}'
        self.username = self.scope['user'].username
        self.redis = self.scope['redis_pool']
        if self.room.is_blocked:
            await self.close()
            return
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        key_user_count = f'chat:{self.room_group_name}:user_count'
        await self.redis.incr(key_user_count)
        self.load_previous_messages()

    async def load_previous_messages(self):
        history_messages = await database_sync_to_async(lambda: self.room.history)()
        for msg in history_messages:
            await self.send_message(json.loads(msg))
        key_messages = f'chat:{self.room_group_name}:messages'
        redis_messages = await self.redis.lrange(key_messages, 0, -1)
        for msg in redis_messages:
            await self.send_message(json.loads(msg))

    async def disconnect(self, close_code):
        if self.scope['user'].is_anonymous:
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
        data = json.loads(text_data)

        self.room = await database_sync_to_async(ChatRoom.objects.get)(name=self.room_name)
        if self.room.is_blocked:
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

    @database_sync_to_async
    def save_messages(self):
        messages = self.redis.lrange(f'chat:{self.room_group_name}:messages', 0, -1)
        messages = [json.loads(msg) for msg in messages]
        self.room.history.extend(messages)
        self.room.save()
