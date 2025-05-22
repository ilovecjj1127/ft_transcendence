from rest_framework import serializers

from games.models import Game, TournamentPlayer


class GameCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'player1', 'player2', 'winning_score', 'status']
        read_only_fields = ['player1', 'status']

    def validate(self, data):
        request = self.context.get('request')
        if not (0 < data.get('winning_score', 10) <= 20):
            raise serializers.ValidationError("Winning score must be between 1 and 20")
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


class GameCreateResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    game = GameCreateSerializer()


class GameDetailSerializer(serializers.ModelSerializer):
    player1_username = serializers.CharField(source='player1.username')
    player2_username = serializers.CharField(source='player2.username', allow_null=True)
    tournament = serializers.CharField(source='tournament.name', allow_null=True)
    player1_alias = serializers.SerializerMethodField()
    player2_alias = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            'id', 'player1', 'player1_username', 'player1_alias', 'player2', 'player2_username', 'player2_alias',
            'score_player1', 'score_player2', 'winning_score', 'status', 'winner',
            'tournament', 'created_at', 'modified_at'
        ]

    def get_player1_alias(self, obj):
        return self.get_player_alias(obj, obj.player1)

    def get_player2_alias(self, obj):
        return self.get_player_alias(obj, obj.player2)

    def get_player_alias(self, obj, player):
        if obj.tournament and player:
            alias = TournamentPlayer.objects.filter(
                tournament=obj.tournament, player=player
            ).values_list('alias', flat=True).first()
            return alias if alias else None
        return None


class GameActionSerializer(serializers.Serializer):
    game_id = serializers.IntegerField()


class GameUpdateSerializer(serializers.Serializer):
    game_id = serializers.IntegerField(required=True)
    new_score_player1 = serializers.IntegerField(required=True)
    new_score_player2 = serializers.IntegerField(required=True)


class GameHistorySerializer(serializers.Serializer):
    is_winner = serializers.BooleanField()
    opponent_name = serializers.CharField()
    score_own = serializers.IntegerField()
    score_opponent = serializers.IntegerField()
    tournament_name = serializers.CharField()
    finished_at = serializers.IntegerField()
