from django.urls import path
from .views import GameCreateView, GameDetailView, GameStartView, \
					GameJoinView, GameInterruptView, GameUpdateView, \
						GameCancelView, GameListView

urlpatterns = [
	path('create/', GameCreateView.as_view(), name='create_game'),
	path('', GameDetailView.as_view(), name='game_detail'),
	path('show/', GameListView.as_view(), name='game_list'),
	path('join/', GameJoinView.as_view(), name='join_game'),
	path('cancel/', GameCancelView.as_view(), name='cancel_game'),
	path('start/', GameStartView.as_view(), name='start_game'),
	path('interrupt/', GameInterruptView.as_view(), name='interrupt_game'),
	path('update/', GameUpdateView.as_view(), name='update_game'),
]