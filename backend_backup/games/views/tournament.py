from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from games.serializers.tournament import TournamentCreateSerializer, TournamentJoinSerializer, \
                            TournamentActionSerializer, TournamentDetailSerializer
from games.serializers.games import GameDetailSerializer
from users.serializers.UserProfile import SuccessResponseSerializer
from games.models import Tournament, Game
from games.services.tournament import TournamentService
from django.db.models import Q

class TournamentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Propose a new tournament",
        request=TournamentCreateSerializer,
        responses={201: SuccessResponseSerializer},
        tags=['Tournaments'],
    )
    def post(self, request: Request) -> Response:
        serializer = TournamentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        name = serializer.validated_data['name']
        alias = serializer.validated_data.get('alias', None)
        user = request.user
        min_players = serializer.validated_data.get('min_players', 3)
        max_players = serializer.validated_data.get('max_players', 5)
        winning_score = serializer.validated_data.get('winning_score', 10)
        try:
            tournament = TournamentService.create_tournament(
                name=name,
                alias=alias,
                user=user,
                min_players=min_players,
                max_players=max_players,
                winning_score=winning_score
            )
            return Response(
                {
                    'message': 'Tournament created successfully',
                    'tournament_name': tournament.name,
                    'status': tournament.status,
                }, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TournamentJoinView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Join an existing tournament",
        request=TournamentJoinSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Tournaments'],
    )
    def post(self, request: Request) -> Response:
        serializer = TournamentJoinSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        tournament_id = serializer.validated_data['tournament_id']
        alias = serializer.validated_data.get('alias', None)
        user = request.user
        try:
            tournament_player = TournamentService.join_tournament(tournament_id, alias, user)
            return Response(
                {
                    'message': f'{tournament_player.alias} joined Tournament {tournament_player.tournament.name}',
                    'tournament_name': tournament_player.tournament.name,
                    'status': tournament_player.tournament.status,
                }, status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TournamentStartView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Start a tournament",
        request=TournamentActionSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Tournaments'],
    )
    def post(self, request: Request) -> Response:
        serializer = TournamentActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        tournament_id = serializer.validated_data['tournament_id']
        try:
            tournament = TournamentService.start_tournament(tournament_id, request.user)
            return Response({'message': f'Tournament {tournament.name} started'}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

class TournamentCancelView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Cancel a tournament",
        request=TournamentActionSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Tournaments'],
    )
    def patch(self, request: Request) -> Response:
        serializer = TournamentActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        tournament_id = serializer.validated_data['tournament_id']
        try:
            tournament = TournamentService.cancel_tournament(tournament_id, request.user)
            return Response({'message': f'Tournament {tournament.name} is canceled'}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

class RegistrationTournamentListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all the tournaments with registration open",
        request=TournamentDetailSerializer,
        responses={200: TournamentDetailSerializer(many=True)},
        tags=['Tournaments'],
    )
    def get(self, request: Request) -> Response:
        user = request.user
        tournaments = Tournament.objects.filter(status='registration').exclude(
            players__player=user
        )
        serializer = TournamentDetailSerializer(tournaments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UpcomingTournamentListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List User's upcoming tournaments",
        request=TournamentDetailSerializer,
        responses={200: TournamentDetailSerializer(many=True)},
        tags=['Tournaments'],
    )
    def get(self, request: Request) -> Response:
        user = request.user
        tournaments = Tournament.objects.filter(
            status='registration',
            players__player=user
        )
        serializer = TournamentDetailSerializer(tournaments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class OngoingTournamentListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List User's ongoing tournaments",
        request=TournamentDetailSerializer,
        responses={200: TournamentDetailSerializer(many=True)},
        tags=['Tournaments'],
    )
    def get(self, request: Request) -> Response:
        user = request.user
        tournaments = Tournament.objects.filter(
            status='in_progress',
            players__player=user
        )
        serializer = TournamentDetailSerializer(tournaments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CompletedTournamentListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List User's completed games",
        request=TournamentDetailSerializer,
        responses={200: TournamentDetailSerializer(many=True)},
        tags=['Tournaments'],
    )
    def get(self, request: Request) -> Response:
        user = request.user
        tournaments = Tournament.objects.filter(
            status='completed',
            players__player=user
        )
        serializer = TournamentDetailSerializer(tournaments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TournamentGamesListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter(name='tournament_id', required=True, type=int)],
        summary="Show all the games in a in_progress or completed tournament",
        responses={200: GameDetailSerializer(many=True)},
        tags=['Tournaments'],
    )
    def get(self, request: Request) -> Response:
        tournament_id = request.query_params.get('tournament_id')
        if not tournament_id:
            return Response({'error': 'Tournament ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            tournament = TournamentService.get_tournament_check_status(tournament_id, ['in_progress', 'completed'])
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        games = Game.objects.filter(tournament=tournament)
        serializer = GameDetailSerializer(games, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TournamentUserReadyGamesListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Show all the 'ready' games for the user in a in_progress tournament",
        responses={200: GameDetailSerializer(many=True)},
        tags=['Tournaments'],
    )
    def get(self, request: Request) -> Response:
        user = request.user
        games = Game.objects.filter(
            Q(player1=user) | Q(player2=user),
            status="ready",
            tournament__status="in_progress"
        ).select_related('tournament', 'player1', 'player2')
        serializer = GameDetailSerializer(games, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TournamentLeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter(name='tournament_id', required=True, type=int)],
        summary="Show the current situation of tournament",
        responses={200: SuccessResponseSerializer},
        tags=['Tournaments'],
    )
    def get(self, request: Request):
        tournament_id = request.query_params.get('tournament_id')
        if not tournament_id:
            return Response({'error': 'Tournament ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            leaderboard = TournamentService.calculate_leaderboard(tournament_id)
            return Response(leaderboard, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
