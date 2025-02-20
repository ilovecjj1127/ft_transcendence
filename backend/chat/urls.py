from django.urls import path

from .views import room, BlockChatRoomView, ChatCreateView


urlpatterns = [
    path('<str:room_name>/', room, name='room'),
	path('create/', ChatCreateView.as_view(), name='create_chatroom'),
	path('block/', BlockChatRoomView.as_view(), name='block_action'),
]
