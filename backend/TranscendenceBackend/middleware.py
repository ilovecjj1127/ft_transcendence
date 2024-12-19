import aioredis
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError



class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser

        query_string = scope.get('query_string', b'').decode()
        params = {}
        if query_string:
            params = dict(pair.split('=') for pair in query_string.split('&'))
        token = params.get('token', None)
        if token is None:
            scope['user'] = AnonymousUser()
        else:
            scope['user'] = await self.get_user_from_token(token)
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import UntypedToken

        User = get_user_model()
        try:
            valid_token = UntypedToken(token)
            user_id = valid_token['user_id']
            return User.objects.get(id=user_id)
        except (TokenError, AuthenticationFailed, User.DoesNotExist):
            return AnonymousUser()


class RedisPoolMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)
        self.redis_pool = aioredis.from_url(
            "redis://redis:6379", encoding="utf-8", decode_responses=True
        )

    async def __call__(self, scope, receive, send):
        scope['redis_pool'] = self.redis_pool
        return await super().__call__(scope, receive, send)
