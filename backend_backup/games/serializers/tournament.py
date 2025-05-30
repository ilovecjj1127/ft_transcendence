from rest_framework import serializers

from games.models import Tournament, TournamentPlayer
from .games import GameDetailSerializer

class TournamentCreateSerializer(serializers.ModelSerializer):
    alias = serializers.CharField(max_length=50, required=False, allow_blank=True)
    class Meta:
        model = Tournament
        fields = ['name', 'min_players', 'max_players', 'winning_score', 'alias']
    
    def validate(self, data):
        if data.get('min_players', 3) > data.get('max_players', 5):
            raise serializers.ValidationError("Minimum players cannot be greater than minimum players")
        if data.get('min_players', 3) <= 2 or data.get('max_players', 5) > 10:
            raise serializers.ValidationError("Minimum 3 Maximum 10 players required for a tournament")
        if not (0 < data.get('winning_score', 10) <= 20):
            raise serializers.ValidationError("Winning score must be between 1 and 20")
        return data

class TournamentJoinSerializer(serializers.Serializer):
    tournament_id = serializers.IntegerField()
    alias = serializers.CharField(max_length=50, required=False, allow_blank=True)

class TournamentPlayerSerialier(serializers.ModelSerializer):
    player_username = serializers.CharField(source='player.username')
    class Meta:
        model = TournamentPlayer
        fields = ['player', 'player_username', 'alias']

class TournamentDetailSerializer(serializers.ModelSerializer):
    players = TournamentPlayerSerialier(many=True)
    matches = GameDetailSerializer(many=True)
    creator_username = serializers.CharField(source='creator.username')
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'status', 'created_at', 'modified_at', 'creator', 'creator_username',
                'winning_score', 'min_players', 'max_players', 'players', 'matches']

class TournamentActionSerializer(serializers.Serializer):
    tournament_id = serializers.IntegerField()