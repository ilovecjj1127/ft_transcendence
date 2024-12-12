from django.db import models
from users.models import UserProfile


class Game(models.Model):
	player1 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="player1_games")
	player2 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="player2_games")
	score_player1 = models.PositiveIntegerField(default=0)
	score_player2 = models.PositiveIntegerField(default=0)
	winner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True,
								related_name="won_games")
	created_at = models.DateTimeField(auto_now_add=True)
	status = models.CharField(
        max_length = 10,
        choices=[ 
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('interrupted', 'Interrupted'), 
            ('completed', 'Completed')
        ],
        default = 'pending'
    )

	def __str__(self):
		return f"{self.player1.username} VS {self.player2.username}"
	
	def set_winner(self):
		self.game_finished = True
		if self.score_player1 > self.score_player2:
			winner = self.player1

# class Score(models.Model):

# class Tournament(models.Model):
# 	name = models.CharField(max_length=100)
# 	players = models.ManyToManyField(UserProfile, related_name="tournaments")
# 	created_at = models.DateTimeField(auto_now_add=True)