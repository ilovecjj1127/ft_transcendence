from .models import *
from users.models import UserProfile
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q

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
	def start_game(game_id: int, user: UserProfile) -> Game:
		game = get_object_or_404(Game, id=game_id)
		if game.status != 'ready' or game.player1 != user or game.player2 != user:
			raise ValueError('Game cannot be started')
		game.status = 'in_progress'
		game.save()
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


	# @staticmethod
	# @transaction.atomic
	# def interrupt_game(game_id: int) -> Game:
	# 	game = get_object_or_404(Game, id=game_id)
	# 	if game.status != 'in_progress':
	# 		raise ValueError('Game cannot be interrupted')
	# 	game.status = 'interrupted'
	# 	game.save()
	# 	return game
	
	# @staticmethod
	# @transaction.atomic
	# def update_game(game_id: int, new_score_player1: int, new_score_player2: int) -> Game:
	# 	game = get_object_or_404(Game, id=game_id)
	# 	if game.status != 'in_progress':
	# 		raise ValueError('Game can not be updated')
	# 	if game.score_player1 != new_score_player1:
	# 		game.score_player1 = new_score_player1
	# 	if game.score_player2 != new_score_player2:
	# 		game.score_player2 = new_score_player2
	# 	if game.score_player1 >= game.winning_score:
	# 		game.winner = game.player1
	# 		game.status = 'completed'
	# 	elif game.score_player2 >= game.winning_score:
	# 		game.winner = game.player2
	# 		game.status = 'completed'
	# 	game.save()
	# 	return game


class TournamentService:
	@staticmethod
	def create_tournament(name: str) -> Tournament:
		return Tournament.objects.create(
			name=name
		)
	
	@staticmethod
	def register_player(tournament_id: int, user: UserProfile, alias: str) -> TournamentPlayer:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		if tournament.status != 'registration':
			raise ValueError('Tournament is not open for registration.')
		return TournamentPlayer.objects.create(
			tournament=tournament,
			player=user,
			alias=alias
		)
	
	@staticmethod
	@transaction.atomic
	def start_tournament(tournament_id: int, user: UserProfile) -> Tournament:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		is_participant = tournament.players.filter(player=user).exists()
		if not is_participant:
			raise PermissionError('User is not the participant in this tournament.')
		players = list(tournament.players.all())
		if len(players) <= 2:
			raise ValueError('A tournament must have more than two player to start.')
		
		matches = []
		for i in range(len(players)):
			for j in range(i + 1, len(players)):
				game = Game.objects.create(
					player1=players[i].player,
					player2=players[j].player,
					status='ready',
				)
				matches.append(TournamentMatch(tournament=tournament, game=game))
		TournamentMatch.objects.bulk_create(matches)
		tournament.status = 'in_progress'
		tournament.save()
		return tournament
	
	@staticmethod
	@transaction.atomic
	def cancel_tournament(tournament_id: int, user: UserProfile) -> Tournament:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		is_participant = tournament.players.filter(player=user).exists()
		if tournament.status != 'registration':
			raise ValueError('Tournament cannot be canceled.')
		if not is_participant:
			raise PermissionError('User is not the participant in this tournament.')

		tournament.status = 'canceled'
		tournament.save()
		return tournament
	
	
		