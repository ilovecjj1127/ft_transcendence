from rest_framework import serializers

from .models import Game

class GameCreateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['id', 'player1', 'player2', 'status']
		read_only_fields = ['player1', 'status']
	def validate(self, data):
		request = self.context.get('request')
		if not request or not request.user:
			raise serializers.ValidationError("User info is required to create a game.")
		data['player1'] = request.user
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
		fields = ['id', 'player1', 'player2', 'score_player1', 'score_player2', 'status', 'winner', 'created_at', 'modified_at']

class GameActionSerializer(serializers.Serializer):
	game_id = serializers.IntegerField()
	
class GameUpdateSerializer(serializers.Serializer):
	game_id = serializers.IntegerField(required=True)
	new_score_player1 = serializers.IntegerField(required=True)
	new_score_player2 = serializers.IntegerField(required=True)

