from django.urls import path
from .views import GameCreateView, GameDetailView, GameStartView, GameInterruptView, GameUpdateView, GameEndView

urlpatterns = [
	path('games/create/', GameCreateView.as_view(), name='create_game'),
	path('games/', GameDetailView.as_view(), name='game_detail'),
	path('games/start/', GameStartView.as_view(), name='start_game'),
	path('games/interrupt/', GameInterruptView.as_view(), name='interrupt_game'),
	path('games/update/', GameUpdateView.as_view(), name='update_game'),
]