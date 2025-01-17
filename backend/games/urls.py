from django.urls import path
from .views import GameCreateView, GameDetailView, GameStartView, \
					GameJoinView, GameCancelView, GameListView, \
					PendingGameListView, ReadyGameListView, GameStatisticsView, \
					TournamentCreateView, TournamentCancelView, TournamentStartView, TournamentJoinView, \
					RegistrationTournamentListView, TournamentLeaderboardView

urlpatterns = [
	path('create/', GameCreateView.as_view(), name='create_game'),
	path('', GameDetailView.as_view(), name='game_detail'),
	path('show/', GameListView.as_view(), name='game_list'),
	path('show/pending/', PendingGameListView.as_view(), name='pending_games'),
	path('show/ready/', ReadyGameListView.as_view(), name='ready_games'),
	path('statistics/', GameStatisticsView.as_view(), name='game_statistics'),
	path('join/', GameJoinView.as_view(), name='join_game'),
	path('cancel/', GameCancelView.as_view(), name='cancel_game'),
	path('start/', GameStartView.as_view(), name='start_game'),
	path('tournament/create/', TournamentCreateView.as_view(), name='create_tournament'),
	path('tournament/join/', TournamentJoinView.as_view(), name='join_tournament'),
	path('tournament/start/', TournamentStartView.as_view(), name='start_tournament'),
	path('tournament/cancel/', TournamentCancelView.as_view(), name='cancel_tournament'),
	path('tournament/show/registration/', RegistrationTournamentListView.as_view(), name='registraion_tournament'),
	path('tournament/leaderboard/', TournamentLeaderboardView.as_view(), name='tournament_leaderboard'),
]