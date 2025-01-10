from django.db import models
from users.models import UserProfile


class Game(models.Model):
	player1 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="player1_games")
	player2 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="player2_games", null=True, blank=True)
	score_player1 = models.PositiveIntegerField(default=0)
	score_player2 = models.PositiveIntegerField(default=0)
	winner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
								related_name="won_games")
	winning_score = models.PositiveIntegerField(default=10)
	created_at = models.DateTimeField(auto_now_add=True)
	modified_at = models.DateTimeField(auto_now=True)
	status = models.CharField(
		max_length=20,
		choices=[ 
			('pending', 'Pending'),
			('ready', 'Ready'),
			('in_progress', 'In Progress'),
			('interrupted', 'Interrupted'), 
			('completed', 'Completed'),
			('canceled', 'Canceled')
		],
		default='pending'
	)

	def __str__(self):
		if self.player2:
			return f"{self.player1.username} VS {self.player2.username}"
		else:
			return f"{self.player1.username} VS [Waiting for player]"
		
class Tournament(models.Model):
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True)
	modified_at = models.DateTimeField(auto_now=True)
	winner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, 
								related_name="won_tournament")
	status = models.CharField(
		max_length=20,
		choices=[
			('registration', 'Registration Open'),
			('in_progress', 'In Progress'),
			('completed', 'Completed'),
			('canceled', 'Canceled'),
		],
		default='registration'
	)

class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="players")
	player = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
	alias = models.CharField(max_length=50)
	registered_at = models.DateTimeField(auto_now_add=True)

class TournamentMatch(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="matches")
	game = models.OneToOneField(Game, on_delete=models.CASCADE)