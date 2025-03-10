from rest_framework import serializers

from games.models import Tournament, TournamentPlayer
from .games import GameDetailSerializer

class TournamentCreateSerializer(serializers.ModelSerializer):
	alias = serializers.CharField(max_length=50, required=False, allow_blank=True)
	class Meta:
		model = Tournament
		fields = ['name', 'min_players', 'max_players', 'winning_score', 'alias']
	
	def validate(self, data):
		if data.get('min_players', 4) > data.get('max_players', 8):
			raise serializers.ValidationError("Minimum players cannot be greater than minimum players")
		if data.get('min_players', 3) <= 2:
			raise serializers.ValidationError("Minimum 3 players required for a tournament")
		return data

class TournamentJoinSerializer(serializers.Serializer):
	tournament_id = serializers.IntegerField()
	alias = serializers.CharField(max_length=50, required=False, allow_blank=True)

class TournamentPlayerSerialier(serializers.ModelSerializer):
	class Meta:
		model = TournamentPlayer
		fields = ['player', 'alias']

class TournamentDetailSerializer(serializers.ModelSerializer):
	players = TournamentPlayerSerialier(many=True)
	matches = GameDetailSerializer(many=True)
	class Meta:
		model = Tournament
		fields = ['id', 'name', 'status', 'created_at', 'modified_at', 'creator', 'winning_score',
				'min_players', 'max_players', 'players', 'matches']

class TournamentActionSerializer(serializers.Serializer):
	tournament_id = serializers.IntegerField()