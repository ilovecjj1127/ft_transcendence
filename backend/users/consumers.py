import asyncio
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.users_statuses = {}
        self.unread_chats = set()
        self.task_check_users_statuses = None

    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return
        self.redis = self.scope['redis_pool']
        await self.channel_layer.group_add(
            f"user_{self.user.username}",
            self.channel_name
        )
        await self.accept()
        user_connections = await self.redis.incr(f"user:{self.user.username}:online")
        await self._check_unread_chats()
        if user_connections == 1:
            self.task_check_users_statuses = asyncio.create_task(self.check_users_statuses())

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            return
        user_connections = await self.redis.decr(f"user:{self.user.username}:online")
        if user_connections == 0:
            await self.redis.delete(f"user:{self.user.username}:online")
            if self.task_check_users_statuses:
                self.task_check_users_statuses.cancel()
                await self.task_check_users_statuses
        await self.channel_layer.group_discard(
            f"user_{self.user.username}",
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")
        if msg_type == "user_status_update":
            usernames = data.get("usernames", [])
            statuses = await self._get_users_statuses(usernames)
            await self.channel_layer.group_send(
                f"user_{self.user.username}",
                {
                    "type": "send_user_status_updates",
                    "update": statuses
                }
            )
        elif msg_type == "unread_chats":
            await self._check_unread_chats()

    async def send_user_status_updates(self, event: dict):
        status_updates = event["update"] # {username: status, ...}
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

    async def send_player_waiting_notification(self, event: dict):
        await self.send(text_data=json.dumps({
            'type': 'player_is_waiting',
            'game_id': event['game_id'],
            'opponent': event['opponent']
        }))

    async def _get_users_statuses(self, usernames: list[str]) -> dict[str, bool]:
        users_statuses = {}
        for username in usernames:
            if username == self.user.username:
                continue
            users_statuses[username] = await self.redis.exists(f"user:{username}:online")
        self.users_statuses = users_statuses
        return users_statuses

    async def check_users_statuses(self):
        try:
            while True:
                status_update = {}
                for username, old_status in self.users_statuses.items():
                    new_status = await self.redis.exists(f"user:{username}:online")
                    if old_status != new_status:
                        self.users_statuses[username] = new_status
                        status_update[username] = new_status
                if status_update:
                    await self.channel_layer.group_send(
                        f"user_{self.user.username}",
                        {
                            "type": "send_user_status_updates",
                            "update": status_update
                        }
                    )
                await asyncio.sleep(30)
        except asyncio.CancelledError:
            pass

    async def _check_unread_chats(self):
        from chat.services import ChatRoomService

        unread_chats = await database_sync_to_async(ChatRoomService.get_unread_chats)(self.user)
        await self.channel_layer.group_send(
            f"user_{self.user.username}",
            {
                "type": "send_unread_chats_notification",
                "unread_chats": unread_chats
            }
        )
