from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ChatConsumer(AsyncWebsocketConsumer):
    MAX_USERS_PER_ROOM = 2

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
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
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

    # async def get_connected_users(self):
    #     count = await self.channel_layer.get(f'{self.}')