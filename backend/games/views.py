from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .serializers import GameCreateSerializer, GameDetailSerializer, GameActionSerializer
from .models import Game
from .services import GameService

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