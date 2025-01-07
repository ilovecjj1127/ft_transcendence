from .models import Game
from users.models import UserProfile
from django.db import transaction
from django.shortcuts import get_object_or_404

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
	def start_game(game_id: int) -> Game:
		game = get_object_or_404(Game, id=game_id)
		if game.status not in ['interrupted', 'ready']:
			raise ValueError('Game cannot be started')
		game.status = 'in_progress'
		game.save()
		return game
	
	@staticmethod
	@transaction.atomic
	def interrupt_game(game_id: int) -> Game:
		game = get_object_or_404(Game, id=game_id)
		if game.status != 'in_progress':
			raise ValueError('Game cannot be interrupted')
		game.status = 'interrupted'
		game.save()
		return game
	
	@staticmethod
	@transaction.atomic
	def update_game(game_id: int, new_score_player1: int, new_score_player2: int) -> Game:
		game = get_object_or_404(Game, id=game_id)
		if game.status != 'in_progress':
			raise ValueError('Game can not be updated')
		if game.score_player1 != new_score_player1:
			game.score_player1 = new_score_player1
		if game.score_player2 != new_score_player2:
			game.score_player2 = new_score_player2
		if game.score_player1 >= game.winning_score:
			game.winner = game.player1
			game.status = 'completed'
		elif game.score_player2 >= game.winning_score:
			game.winner = game.player2
			game.status = 'completed'
		game.save()
		return game
		
	