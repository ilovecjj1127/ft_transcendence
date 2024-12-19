"""
ASGI config for TranscendenceBackend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from chat.routing import websocket_urlpatterns
from .middleware import JWTAuthMiddleware, RedisPoolMiddleware


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TranscendenceBackend.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': JWTAuthMiddleware(
        RedisPoolMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    )
})

# application = ProtocolTypeRouter({
#     'http': get_asgi_application(),
#     'websocket': AuthMiddlewareStack(
#         URLRouter(websocket_urlpatterns)
#     )
# })