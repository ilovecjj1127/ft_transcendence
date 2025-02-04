from django.urls import path
from games.views.tournament import TournamentCreateView, TournamentCancelView, TournamentStartView, \
								TournamentJoinView, RegistrationTournamentListView, TournamentLeaderboardView

urlpatterns = [
	path('create/', TournamentCreateView.as_view(), name='create_tournament'),
	path('join/', TournamentJoinView.as_view(), name='join_tournament'),
	path('start/', TournamentStartView.as_view(), name='start_tournament'),
	path('cancel/', TournamentCancelView.as_view(), name='cancel_tournament'),
	path('show/registration/', RegistrationTournamentListView.as_view(), name='registraion_tournament'),
	path('leaderboard/', TournamentLeaderboardView.as_view(), name='tournament_leaderboard'),
]
