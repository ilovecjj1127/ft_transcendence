from games.models import Game
from users.models import UserProfile
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .tournament import TournamentService

class GameService:
    @staticmethod
    @transaction.atomic
    def join_game(game_id: int, user: UserProfile) -> Game:
        game = get_object_or_404(Game, id=game_id)
        if game.status != 'pending' or game.player2 or game.player1 == user:
            raise ValueError('Game cannot be joined')
        game.player2 = user
        game.status = 'ready'
        game.save()
        return game
    
    @staticmethod
    @transaction.atomic
    def cancel_game(game_id: int, user: UserProfile) -> Game:
        game = get_object_or_404(Game, id=game_id)
        if game.status != 'pending' or game.player2 or game.player1 != user:
            raise ValueError('Game cannot be canceled')
        game.status = 'canceled'
        game.save()
        return game

    @staticmethod
    @transaction.atomic
    def finish_game(game_id: int, new_score_player1: int, new_score_player2: int) -> Game:
        game = get_object_or_404(Game, id=game_id)
        if game.status != 'in_progress':
            raise ValueError('Game can not be updated')
        game.status = 'completed'
        game.score_player1 = new_score_player1
        game.score_player2 = new_score_player2
        if game.score_player1 >= game.winning_score:
            game.winner = game.player1
        elif game.score_player2 >= game.winning_score:
            game.winner = game.player2
        elif game.tournament:
            game.status = 'ready'
            game.score_player1 = 0
            game.score_player2 = 0
        else:
            game.status = 'interrupted'
        game.save()
        tournament = game.tournament
        if tournament:
            try:
                TournamentService.finish_tournament(tournament.id)
            except ValueError:
                pass
        return game

    @staticmethod
    def calculate_user_statistics(user: UserProfile):
        completed_games = Game.objects.filter(status='completed').filter(Q(player1=user) | Q(player2=user))
        total_games = completed_games.count()
        games_won = completed_games.filter(winner=user).count()
        games_lost = total_games - games_won
        win_percentage = (games_won / total_games) * 100 if total_games > 0 else 0
        total_points = sum(
            game.score_player1 if game.player1 == user else game.score_player2
            for game in completed_games
        )
        avg_points_per_game = total_points / total_games if total_games > 0 else 0

        return {
            'total_games': total_games,
            'games_won': games_won,
            'games_lost': games_lost,
            'win_percentage': round(win_percentage, 2),
            'avgerage_points_per_game': round(avg_points_per_game, 2),
        }

    @staticmethod
    def get_game_history(username: str) -> list[dict]:
        try:
            user = UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            return []
        completed_games = Game.objects.filter(Q(player1=user) | Q(player2=user)) \
            .filter(status='completed').select_related('player1', 'player2', 'tournament') \
            .order_by('-modified_at')
        game_history = [
            {
                'is_winner': True if game.winner == user else False,
                'opponent_name': game.player2.username \
                    if game.player1 == user else game.player1.username,
                'score_own': game.score_player1 \
                    if game.player1 == user else game.score_player2,
                'score_opponent': game.score_player2 \
                    if game.player1 == user else game.score_player1,
                'tournament_name': game.tournament.name \
                    if game.tournament else "",
                'finished_at': int(game.modified_at.timestamp())
            } for game in completed_games
        ]
        return game_history
