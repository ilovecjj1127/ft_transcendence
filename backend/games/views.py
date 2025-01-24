from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .serializers import GameCreateSerializer, GameDetailSerializer, GameActionSerializer, \
							TournamentCreateSerializer, TournamentJoinSerializer, \
							TournamentActionSerializer, TournamentDetailSerializer
from .models import Game, Tournament
from .services import GameService, TournamentService

class GameCreateView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Create a new game",
		request=GameCreateSerializer,
		tags=['Games'],
	)
	def post(self, request: Request) -> Response:
		serializer = GameCreateSerializer(data=request.data, context={'request': request})
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		game = serializer.save()
		return Response(
			{
				'message': 'Game created successfully',
				'game': GameCreateSerializer(game).data,
			}, status=status.HTTP_201_CREATED)

class GameDetailView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		parameters=[OpenApiParameter(name='game_id', required=True, type=int)],
		summary="Retrieve game details",
		request=GameDetailSerializer,
		tags=['Games'],
	)
	def get(self, request: Request) -> Response:
		game_id = request.query_params.get('game_id')
		if not game_id:
			return Response({'error': 'Game ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		game = get_object_or_404(Game, id=game_id)
		serializer = GameDetailSerializer(game)
		return Response(serializer.data, status=status.HTTP_200_OK)
	
class GameJoinView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Join the game",
		request=GameActionSerializer,
		tags=['Games'],
	)
	def patch(self, request: Request) -> Response:
		serializer = GameActionSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		game_id = serializer.validated_data['game_id']
		try:
			game = GameService.join_game(game_id, request.user)
			return Response({'message': 'Game joined', 'status': game.status}, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
		
class GameCancelView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Cancel the game",
		request=GameActionSerializer,
		tags=['Games'],
	)
	def patch(self, request: Request) -> Response:
		serializer = GameActionSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		game_id = serializer.validated_data['game_id']
		try:
			game = GameService.cancel_game(game_id, request.user)
			return Response({'message': 'Game canceled', 'status': game.status}, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
	
class GameStartView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Start the game",
		request=GameActionSerializer,
		tags=['Games'],
	)
	def patch(self, request: Request) -> Response:
		serializer = GameActionSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		game_id = serializer.validated_data['game_id']
		try:
			game = GameService.start_game(game_id, request.user)
			return Response({'message': 'Game started', 'status': game.status}, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GameListView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="List all games",
		request=GameDetailSerializer,
		responses={200: GameDetailSerializer(many=True)},
		tags=['Games'],
	)
	def get(self, request: Request) -> Response:
		games = Game.objects.all()
		serializer = GameDetailSerializer(games, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	
class PendingGameListView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="List all the pending games",
		request=GameDetailSerializer,
		responses={200: GameDetailSerializer(many=True)},
		tags=['Games'],
	)
	def get(self, request: Request) -> Response:
		games = Game.objects.filter(status='pending')
		serializer = GameDetailSerializer(games, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
		
class ReadyGameListView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="List all the ready games",
		request=GameDetailSerializer,
		responses={200: GameDetailSerializer(many=True)},
		tags=['Games'],
	)
	def get(self, request: Request) -> Response:
		user = request.user
		games = Game.objects.filter(status='ready').filter(Q(player1=user) | Q(player2=user))
		serializer = GameDetailSerializer(games, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	
class GameStatisticsView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Get analysis result of user's games",
		tags=['Games'],
	)
	def get(self, request: Request) -> Response:
		stats = GameService.calculate_user_statistics(request.user)
		return Response(stats, status=status.HTTP_200_OK)


class TournamentCreateView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Propose a new tournament",
		request=TournamentCreateSerializer,
		tags=['Tournaments'],
	)
	def post(self, request: Request) -> Response:
		serializer = TournamentCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		name = serializer.validated_data['name']
		alias = serializer.validated_data.get('alias', None)
		user = request.user
		max_players = serializer.validated_data.get('max_players', 4)
		min_players = serializer.validated_data.get('min_players', 8)
		winning_score = serializer.validated_data.get('winnint_score', 10)
		try:
			TournamentService.create_tournament(name, alias, user, max_players, min_players, winning_score)
			return Response(
				{
					'message': 'Tournament created successfully',
					'status': serializer.data,
				}, status=status.HTTP_201_CREATED)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TournamentJoinView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Join an existing tournament",
		request=TournamentJoinSerializer,
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
					'message': f'{alias} joined Tournament {tournament_player.tournament.name}',
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

class TournamentCancelView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Cancel a tournament",
		request=TournamentActionSerializer,
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

class RegistrationTournamentListView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="List all the pending games",
		request=TournamentDetailSerializer,
		responses={200: TournamentDetailSerializer(many=True)},
		tags=['Tournaments'],
	)
	def get(self, request: Request) -> Response:
		tournaments = Tournament.objects.filter(status='registration')
		serializer = TournamentDetailSerializer(tournaments, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)

class TournamentLeaderboardView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		parameters=[OpenApiParameter(name='tournament_id', required=True, type=int)],
		summary="Show the current situation of tournament",
		tags=['Tournaments'],
	)
	def get(self, request: Request):
		tournament_id = request.query_params.get('tournament_id')
		if not tournament_id:
			return Response({'error': 'Tournament ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		tournament = get_object_or_404(Tournament, id=tournament_id)
		leaderboard = TournamentService.calculate_leaderboard(tournament)
		return Response(leaderboard, status=status.HTTP_200_OK)
	