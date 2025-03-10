from channels.generic.websocket import AsyncWebsocketConsumer
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
        self.room_group_name = f'chat_{self.room_name}'
        self.username = self.scope['user'].username
        self.redis = self.scope['redis_pool']
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        key_user_count = f'chat:{self.room_group_name}:user_count'
        await self.redis.incr(key_user_count)
        key_messages = f'chat:{self.room_group_name}:messages'
        messages = await self.redis.lrange(key_messages, 0, -1)
        for msg in messages:
            await self.send_message(json.loads(msg))

    async def disconnect(self, close_code):
        if self.scope['user'].is_anonymous:
            return
        key_user_count = f'chat:{self.room_group_name}:user_count'
        user_count = await self.redis.decr(key_user_count)
        if user_count <= 0:
            await self.redis.delete(key_user_count)
            await self.redis.delete(f'chat:{self.room_group_name}:messages')
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
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
