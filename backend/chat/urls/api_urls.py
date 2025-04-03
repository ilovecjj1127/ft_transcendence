from django.urls import path

from chat.views import room, ChatGetOrCreateView, ChatBlockorUnblockView
from chat.models import ChatRoom

urlpatterns = [
	path('get_or_create/', ChatGetOrCreateView.as_view(), name='get_or_create_chatroom'),
 	# path('get_rooms_data/', ChatRoom.objects.all()),
	path('block_or_unblock/', ChatBlockorUnblockView.as_view(), name='block_or_unblock_action'),
]
