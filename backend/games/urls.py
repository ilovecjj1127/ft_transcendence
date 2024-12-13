from django.urls import path
from .views import GameCreateView, GameStartView, GameInterruptView, GameUpdateView, GameEndView

urlpatterns = [
	path('games/create/', GameCreateView.as_view(), name='create_end'),
	path('games/<uuid:game_id>/start/', GameStartView.as_view(), name='game_end'),
	path('games/<uuid:game_id>/interrupt/', GameInterruptView.as_view(), name='game_end'),
	path('games/<uuid:game_id>/update/', GameUpdateView.as_view(), name='game_end'),
	path('games/<uuid:game_id>/end/', GameEndView.as_view(), name='game_end'),
]