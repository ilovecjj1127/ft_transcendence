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

class GameDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['id', 'player1', 'player2', 'score_player1', 'score_player2', 'status', 'winner', 'created_at']

class GameStartSerializer(serializers.Serializer):
    game_id = serializers.IntegerField()
	
class GameUpdateSerializer(serializers.Serializer):
	game_id = serializers.IntegerField(required=True)
	new_score_player1 = serializers.IntegerField(required=True)
	new_score_player2 = serializers.IntegerField(required=True)

class GameInterruptSerializer(serializers.Serializer):
    game_id = serializers.IntegerField()

class GameEndSerializer(serializers.Serializer):
    game_id = serializers.IntegerField()

