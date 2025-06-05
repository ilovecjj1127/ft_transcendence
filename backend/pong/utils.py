import aioredis
from channels.layers import get_channel_layer
from django.conf import settings


async def notify_about_player_waiting_in_game(game_id: str, username: str, opponent: str):
    if not username:
        return
    redis_pool = await aioredis.from_url(
        settings.REDIS_URL, encoding="utf-8", decode_responses=True
    )
    if await redis_pool.exists(f"user:{username}:online"):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"user_{username}",
            {
                "type": "send_player_waiting_notification",
                "game_id": game_id,
                "opponent": opponent
            }
        )
    await redis_pool.close()
