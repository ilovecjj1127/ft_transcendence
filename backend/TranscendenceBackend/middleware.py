from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken


User = get_user_model()


@database_sync_to_async
def get_user_from_token(token):
    try:
        valid_token = UntypedToken(token)
        user_id = valid_token['user_id']
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope['headers'])
        if b'authorization' in headers:
            token = headers[b'authorization'].decode().split('Bearer ')[-1]
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)
