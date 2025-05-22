from django.urls import path

from chat.views import room


urlpatterns = [
    path('room/<int:room_id>/', room, name='room'),
]