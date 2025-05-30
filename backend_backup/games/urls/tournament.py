from django.urls import path
from games.views.tournament import TournamentCreateView, TournamentCancelView, TournamentStartView, \
                                TournamentJoinView, RegistrationTournamentListView, TournamentLeaderboardView, \
                                UpcomingTournamentListView, OngoingTournamentListView, CompletedTournamentListView, \
                                TournamentGamesListView, TournamentUserReadyGamesListView

urlpatterns = [
    path('create/', TournamentCreateView.as_view(), name='create_tournament'),
    path('join/', TournamentJoinView.as_view(), name='join_tournament'),
    path('start/', TournamentStartView.as_view(), name='start_tournament'),
    path('cancel/', TournamentCancelView.as_view(), name='cancel_tournament'),
    path('show/registration/', RegistrationTournamentListView.as_view(), name='registraion_tournament'),
    path('show/upcoming/', UpcomingTournamentListView.as_view(), name='user_upcoming_tournament'),
    path('show/ongoing/', OngoingTournamentListView.as_view(), name='user_ongoing_tournament'),
    path('show/completed/', CompletedTournamentListView.as_view(), name='user_completed_tournament'),
    path('show/games/', TournamentGamesListView.as_view(), name='games_in_tournament'),
    path('show/ready/games/', TournamentUserReadyGamesListView.as_view(), name='ready_games_in_tournament'),
    path('leaderboard/', TournamentLeaderboardView.as_view(), name='tournament_leaderboard'),
]
