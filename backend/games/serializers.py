from rest_framework import serializers

from .models import Game

class GameCreateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['player1', 'player2']
	def validate(self, data):
		if data['player1'] == data['player2']:
			raise serializers.ValidationError("Player 1 and Player 2 cannot be the same.")
		return data
	
class GameUpdateSerializer(serializers.ModelSerializer):
	class Mera:
		model = Game
		fields = ['score_player1', 'score_player2', 'winner']

