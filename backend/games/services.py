from .models import Game, Tournament, TournamentPlayer
from users.models import UserProfile
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Case, When, F

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
		game.score_player1 = new_score_player1
		game.score_player2 = new_score_player2
		if game.score_player1 >= game.winning_score:
			game.winner = game.player1
			game.status = 'completed'
		elif game.score_player2 >= game.winning_score:
			game.winner = game.player2
			game.status = 'completed'
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

class TournamentService:
	@staticmethod
	@transaction.atomic
	def create_tournament(name: str, alias: str, user: UserProfile, min_players=4, 
					   max_players=8, winning_score=10) -> Tournament:
		if not name:
			raise ValueError('tournament name must be provided.')
		if not alias:
			alias = user.username
		tournament = Tournament.objects.create(
			name=name,
			creator=user,
			min_players=min_players,
			max_players=max_players,
			winning_score=winning_score
		)
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
			alias = user.username
		tournament = get_object_or_404(Tournament, id=tournament_id)
		if tournament.status != 'registration':
			raise ValueError('Tournament is not open for registration.')
		if TournamentPlayer.objects.filter(tournament=tournament, player=user).exists():
			raise ValueError('User is already registered in this tournament.')
		if TournamentPlayer.objects.filter(tournament=tournament, alias=alias).first():
			raise ValueError(f"The alias '{alias}' is already taken in this tournament.")
		tournament_player = TournamentPlayer.objects.create(
			tournament=tournament,
			player=user,
			alias=alias
		)
		if tournament.players.count() == tournament.max_players:
			TournamentService.start_tournament(tournament_id, tournament.creator)
		return tournament_player
	
	@staticmethod
	@transaction.atomic
	def start_tournament(tournament_id: int, user: UserProfile) -> Tournament:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		if tournament.status != 'registration':
			raise ValueError('Tournament cannot be started')
		if user != tournament.creator:
			raise PermissionError('Only the creator can start the tournament.')
		players = list(tournament.players.all())
		if len(players) < tournament.min_players:
			raise ValueError(f'Tournament cannot be started with less than {tournament.min_players}players')
		
		for i in range(len(players)):
			for j in range(i + 1, len(players)):
				Game.objects.create(
					tournament=tournament,
					player1=players[i].player,
					player2=players[j].player,
					winning_score=tournament.winning_score,
					status='ready',
				)
		tournament.status = 'in_progress'
		tournament.save()
		return tournament
	
	@staticmethod
	@transaction.atomic
	def cancel_tournament(tournament_id: int, user: UserProfile) -> Tournament:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		if tournament.status != 'registration':
			raise ValueError('Tournament cannot be canceled.')
		if user != tournament.creator:
			raise PermissionError('Only the creator can cancel the tournament.')
		tournament.status = 'canceled'
		tournament.save()
		return tournament
	
	@staticmethod
	def find_game_winner(player1: TournamentPlayer, player2: TournamentPlayer, tournament: Tournament) -> TournamentPlayer:
		if not player1:
			return player2
		match = tournament.matches.filter(
			(Q(player1=player1.player, player2=player2.player) |
			 Q(player2=player1.player, player1=player2.player))
		).first()
		if not match or not match.winner:
			return None
		return get_object_or_404(TournamentPlayer, tournament=tournament, player=match.winner)

	@staticmethod
	def determine_tournament_winner(tournament: Tournament) -> TournamentPlayer:
		leaderboard = TournamentService.calculate_leaderboard(tournament)
		winners = []
		for player_alias, player_data in leaderboard.items():
			if player_data.get('ranking') == 1:
				winners.append(get_object_or_404(TournamentPlayer, tournament=tournament, alias=player_alias))
			if player_data.get('ranking') > 1:
				break
		if len(winners) == 1:
			return winners[0]
		winner = TournamentService.find_game_winner(winners[0], winners[1], tournament)
		for i in range(2, len(winners)):
			winner = TournamentService.find_game_winner(winner, winners[i], tournament)
		if not winner:
			return winners[0]
		return winner

	@staticmethod
	@transaction.atomic
	def finish_tournament(tournament_id: int) -> Tournament:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		unfinished_games = tournament.matches.filter(game__status__in=['in_progress', 'ready']).exists()
		if unfinished_games:
			raise ValueError('Cannot finish tournament: some games are not finished yet.')
		tournament.winner = TournamentService.determine_tournament_winner(tournament)
		tournament.status = 'completed'
		tournament.save()
		return tournament
	
	@staticmethod
	@transaction.atomic
	def calculate_leaderboard(tournament_id: int) -> dict:
		tournament = get_object_or_404(Tournament, id=tournament_id)
		if tournament.status not in ['in_progress', 'completed']:
			raise ValueError("Leaderboard only for a in-progress or completed tournament")
		tournament_players = TournamentPlayer.objects.filter(tournament=tournament)
		leaderboard_data = {}
		player_stats = []
		for t_player in tournament_players:
			completed_games = Game.objects.filter(
				Q(player1=t_player.player) | Q(player2=t_player.player),
				status='completed',
				tournament=tournament
			)

			game_total = completed_games.count()
			game_win = completed_games.filter(winner=t_player.player).count()
			total_score = completed_games.annotate(
				score=Case(
					When(player1=t_player.player, then=F('score_player1') - F('score_player2')),
					When(player2=t_player.player, then=F('score_player2') - F('score_player1'))
				)
			).aggregate(total=Sum('score'))['total'] or 0

			player_stats.append({
				'alias': t_player.alias,
				'stats': {
					'game_count': game_total,
					'game_win': game_win,
					'total_score': total_score,
				}
			})
		sorted_stats = sorted(
			player_stats,
			key=lambda x: (-x['stats']['game_win'], -x['stats']['total_score'])
		)
		curr_pos = 1
		previous_scores = None
		previous_wins = None
		
		for idx, player_data in enumerate(sorted_stats):
			if (previous_scores != player_data['stats']['total_score'] or
	   			previous_wins != player_data['stats']['game_win']):
				curr_pos = idx + 1
			previous_scores = player_data['stats']['total_score']
			previous_wins = player_data['stats']['game_win']
			player_data['stats']['ranking'] = curr_pos
			leaderboard_data[player_data['alias']] = player_data['stats']

		return leaderboard_data
		