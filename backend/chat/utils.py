import aioredis
from channels.layers import get_channel_layer


async def notify_about_unread_chats(username: str, chats: list[str]):
    redis_pool = await aioredis.from_url(
        "redis://redis:6379", encoding="utf-8", decode_responses=True
    )
    if await redis_pool.exists(f"user:{username}:online"):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"user_{username}",
            {
                "type": "send_unread_chats_notification",
                "unread_chats": chats
            }
        )
    await redis_pool.close()
