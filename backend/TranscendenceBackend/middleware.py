from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework.exceptions import AuthenticationFailed



class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser

        query_string = scope.get('query_string', b'').decode()
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
        from rest_framework_simplejwt.exceptions import TokenError

        User = get_user_model()
        try:
            valid_token = UntypedToken(token)
            user_id = valid_token['user_id']
            return User.objects.get(id=user_id)
        except (TokenError, AuthenticationFailed, User.DoesNotExist):
            return AnonymousUser()
