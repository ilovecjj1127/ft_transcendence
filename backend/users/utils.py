import os
import uuid

import aioredis
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.exceptions import ValidationError

from .constants import AVATAR_DEFAULT, AVATAR_UPLOAD_DIR, AVATAR_MAX_SIZE_MB


def avatar_upload_to(instance, filename):
    if filename:
        ext = filename.split('.')[-1]
        new_filename = f"{uuid.uuid4()}.{ext}"
        return os.path.join(AVATAR_UPLOAD_DIR, new_filename)
    return AVATAR_DEFAULT


def validate_avatar_size(file):
    if file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024:
        raise ValidationError(f"File size should not exceed {AVATAR_MAX_SIZE_MB} MB.")


async def notify_about_friendship_requests(request_id: str, request_status: str,
                                           username: str, friend_name: str):
    redis_pool = await aioredis.from_url(
        settings.REDIS_URL, encoding="utf-8", decode_responses=True
    )
    if await redis_pool.exists(f"user:{username}:online"):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"user_{username}",
            {
                "type": "send_friendship_request_notification",
                "request_id": request_id,
                "username": friend_name,
                "request_status": request_status
            }
        )
    await redis_pool.close()
