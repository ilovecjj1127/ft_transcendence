from .models import Game, Tournament, TournamentMatch, TournamentPlayer
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
		if game.status != 'ready' or (game.player1 != user and game.player2 != user):
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

class TournamentService:
	@staticmethod
	@transaction.atomic
	def create_tournament(name: str, alias: str, user: UserProfile) -> Tournament:
		if not name or not alias:
			raise ValueError('Both name and alias must be provided.')
		tournament = Tournament.objects.create(name=name)
		TournamentPlayer.objects.create(
			tournament=tournament,
			player=user,
			alias=alias
		)
		return tournament
	
	@staticmethod
	@transaction.atomic
	def join_tournament(tournament_id: int, alias: str, user: UserProfile) -> TournamentPlayer:
		if not alias:
			raise ValueError('alias must be provided.')
		tournament = get_object_or_404(Tournament, id=tournament_id)
		if tournament.status != 'registration':
			raise ValueError('Tournament is not open for registration.')
		if TournamentPlayer.objects.filter(tournament=tournament, player=user).exists():
			raise ValueError('User is already registered in this tournament.')
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
	
	@staticmethod
	@transaction.atomic
	def finish_tournament(tournament_id: int) -> Tournament:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		unfinished_games = tournament.matches.filter(game__status__in=['in_progress', 'ready']).exists()
		if unfinished_games:
			raise ValueError('Cannot finish tournament: some games are not finished yet.')
		points = {}
		for tournament_player in tournament.players.all():
			points[tournament_player.player] = 0
		matches = tournament.matches.all()
		for match in matches:
			game = match.game
			if game.status == 'completed' and game.winner:
				points[game.winner] += 1
		max_points = max(points.values())
		winners = [player for player, score in points.items() if score == max_points]
		if len(winners) > 1:
			winner_scores = {player: 0 for player in winners}
			for match in matches:
				game = match.game
				if game.status == 'completed':
					if game.player1 in winners:
						winner_scores[game.player1] += game.score_player1
					if game.player2 in winners:
						winner_scores[game.player2] += game.score_player2
			max_score = max(winner_scores.values())
			final_winner = [player for player, score in winner_scores.items() if score == max_score]
			tournament.winner = final_winner[0]
		else:
			tournament.winner = winners[0]
		tournament.status = 'completed'
		tournament.save()
		return tournament
	
	
		