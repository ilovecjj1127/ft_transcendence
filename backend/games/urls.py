from django.urls import path
from .views import GameCreateView, GameDetailView, GameStartView, \
					GameInterruptView, GameUpdateView, GameListView

urlpatterns = [
	path('create/', GameCreateView.as_view(), name='create_game'),
	path('', GameDetailView.as_view(), name='game_detail'),
	path('show/', GameListView.as_view(), name='game_list'),
	path('start/', GameStartView.as_view(), name='start_game'),
	path('interrupt/', GameInterruptView.as_view(), name='interrupt_game'),
	path('update/', GameUpdateView.as_view(), name='update_game'),
]