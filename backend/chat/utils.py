import aioredis
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.conf import settings


async def notify_about_unread_chats(user):
    from .services import ChatRoomService

    redis_pool = await aioredis.from_url(
        settings.REDIS_URL, encoding="utf-8", decode_responses=True
    )
    if await redis_pool.exists(f"user:{user.username}:online"):
        chats = await database_sync_to_async(ChatRoomService.get_unread_chats)(user)
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"user_{user.username}",
            {
                "type": "send_unread_chats_notification",
                "unread_chats": chats
            }
        )
    await redis_pool.close()
