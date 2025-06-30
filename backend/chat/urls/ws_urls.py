from django.urls import path
from django.urls import re_path
from .. import consumers
from chat.views import room


urlpatterns = [
    path('room/<int:room_id>/', room, name='room'),
]
