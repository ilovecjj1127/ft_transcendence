from django.urls import path
from django.urls import re_path
from .. import consumers
from chat.views import room


urlpatterns = [
    path('room/<int:room_id>/', room, name='room'),
]

websocket_urlpatterns = [
    re_path(r"ws/chat/general_social_data_socket_on_backend/?$", consumers.GeneralSocialConsumer.as_asgi()),
]