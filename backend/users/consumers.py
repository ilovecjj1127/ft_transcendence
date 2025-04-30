import asyncio
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.users_statuses = {}
        self.unread_chats = set()

    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return
        self.redis = self.scope['redis_pool']
        await self.accept()
        self.redis.set(f"user:{self.user.id}:online", 1)
        # check unread messages

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            return
        self.redis.delete(f"user:{self.user.id}:online")

    async def send_user_status_updates(self, event: dict):
        status_updates = event # {username: status, ...}
        await self.send(text_data=json.dumps({
            'type': 'user_status_update',
            'update': status_updates
        }))

    async def send_unread_chats_notification(self, event: dict):
        unread_chats = event["unread_chats"] # list of usernames
        await self.send(text_data=json.dumps({
            'type': 'unread_chats',
            'unread_chats': unread_chats
        }))

# send notifications about user statuses from the list and when they change
# check new messages in chats and receive notifications
# update chats with sending notification about unread messages