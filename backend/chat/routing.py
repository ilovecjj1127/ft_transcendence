from django.urls import path

from .consumers import ChatConsumer
from django.urls import path
from django.urls import re_path
from . import consumers

chat_websocket_urlpatterns = [
    path('ws/chat/<int:room_id>/', ChatConsumer.as_asgi()),
]
