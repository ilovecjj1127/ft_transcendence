from django.db import models
from users.models import UserProfile
from django.core.exceptions import ValidationError

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    creator = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='created_tournaments')
    winner = models.ForeignKey('TournamentPlayer', on_delete=models.SET_NULL, null=True, blank=True, 
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
    min_players = models.PositiveIntegerField(default=3)
    max_players = models.PositiveIntegerField(default=5)
    winning_score = models.PositiveIntegerField(default=10)

    def clean(self):
        if self.min_players < 3:
            raise ValidationError("Minimum 3 players required for a tournament")
        if self.max_players > 10:
            raise ValidationError("Maximum 10 players is allowed for a tournament")
        if not (1 <= self.winning_score <= 20):
            raise ValidationError("Winning score must be between 1 and 20")
        if self.max_players < self.min_players:
            raise ValidationError("Maximum players must be greater than minimum players")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Game(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.SET_NULL, related_name="matches", null=True, blank=True)
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
        if self.tournament:
            return f"Tournament {self.tournament.name}: {self.player1.username} VS {self.player2.username}"
        if self.player2:
            return f"{self.player1.username} VS {self.player2.username}"
        else:
            return f"{self.player1.username} VS [Waiting for player]"
        

class TournamentPlayer(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="players")
    player = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    alias = models.CharField(max_length=50)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alias} in Tournament '{self.tournament.name}'"
