from rest_framework import serializers

from .models import Game

class GameCreateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['id', 'player1', 'player2', 'status']
		read_only_fields = ['status']
	def validate(self, data):
		if data['player1'] == data.get('player2'):
			raise serializers.ValidationError("Player 1 and Player 2 cannot be the same.")
		if data.get('player2'):
			data['status'] = 'ready'
		else:
			data['status'] = 'pending'
		return data

class GameDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['id', 'player1', 'player2', 'score_player1', 'score_player2', 'status', 'winner', 'created_at']

class GameJoinSerializer(serializers.Serializer):
	game_id = serializers.IntegerField()

class GameCancelSerializer(serializers.Serializer):
	game_id = serializers.IntegerField()

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

