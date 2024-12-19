from .models import Game
from django.db import transaction

class GameService:
	@staticmethod
	@transaction.atomic
	def start_game(game_id: int):
		game = Game.objects.get(id=game_id)
		if game.DoesNotExist:
			raise ValueError('Game not found')
		if game.status != 'pending':
			raise ValueError('Game cannot be started')
		game.status = 'in_progress'
		game.save()
		return game
	
	@staticmethod
	@transaction.atomic
	def interrupt_game(game_id: int):
		game = Game.objects.get(id=game_id)
		if game.DoesNotExist:
			raise ValueError('Game not found')
		if game.status != 'in_progress':
			raise ValueError('Game cannot be interrupted')
		game.status = 'in_progress'
		game.save()
		return game
	
	@staticmethod
	@transaction.atomic
	def update_game(game_id: int, new_score_player1: int, new_score_player2: int):
		game = Game.objects.get(id=game_id)
		if game.DoesNotExist:
			raise ValueError('Game not found')
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
		
	