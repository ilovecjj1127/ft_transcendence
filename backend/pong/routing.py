from django.urls import path

from .consumers import PongConsumer


pong_websocket_urlpatterns = [
    path('ws/pong/<str:game_id>/', PongConsumer.as_asgi()),
]
