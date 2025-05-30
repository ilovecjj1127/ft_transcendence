from django.urls import path
from games.views.games import GameCreateView, GameDetailView, \
                    GameJoinView, GameCancelView, GameListView, \
                    PendingGameListView, ReadyGameListView, GameStatisticsView, \
                    GameHistoryView

urlpatterns = [
    path('create/', GameCreateView.as_view(), name='create_game'),
    path('', GameDetailView.as_view(), name='game_detail'),
    path('show/', GameListView.as_view(), name='game_list'),
    path('show/pending/', PendingGameListView.as_view(), name='pending_games'),
    path('show/ready/', ReadyGameListView.as_view(), name='ready_games'),
    path('statistics/', GameStatisticsView.as_view(), name='game_statistics'),
    path('join/', GameJoinView.as_view(), name='join_game'),
    path('cancel/', GameCancelView.as_view(), name='cancel_game'),
    path('history/', GameHistoryView.as_view(), name='history'),
]