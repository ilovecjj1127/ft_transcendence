from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .serializers import GameCreateSerializer, GameDetailSerializer, GameUpdateSerializer, \
							GameStartSerializer, GameInterruptSerializer
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
		serializer = GameCreateSerializer(data=request.data)
		if serializer.is_valid():
			game = serializer.save()
			return Response({'message': 'Game created successfully'},
				   			status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GameDetailView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Retrieve game details",
		request=GameDetailSerializer,
		tags=['Games'],
	)
	def get(self, request: Request) -> Response:
		game_id = request.query_params.get('game_id')
		if not game_id:
			return Response({'error': 'Game ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			game = get_object_or_404(Game, id=game_id)
		except Game.DoesNotExist:
			return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)
		serializer = GameDetailSerializer(game)
		return Response(serializer.data, status=status.HTTP_200_OK)

class GameStartView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Start the game",
		request=GameStartSerializer,
		tags=['Games'],
	)
	def patch(self, request: Request) -> Response:
		serializer = GameStartSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		try:
			game_id = serializer.validated_data['game_id']
			game = GameService.start_game(game_id)
			return Response({'message': 'Game started', 'status': game.status}, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GameUpdateView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Update game scores",
		request=GameUpdateSerializer,
		tags=['Games'],
	)
	def patch(self, request: Request) -> Response:
		serializer = GameUpdateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		try:
			game_id = serializer.validated_data['game_id']
			new_score_player1 = serializer.validated_data['new_score_player1']
			new_score_player2 = serializer.validated_data['new_score_player2']
			GameService.update_game(game_id, new_score_player1, new_score_player2)
			return Response({'message': 'Game updated'}, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GameInterruptView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Interrupt the game",
		request=GameInterruptSerializer,
		tags=['Games'],
	)
	def patch(self, request: Request) -> Response:
		serializer = GameInterruptSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		try:
			game_id = serializer.validated_data['game_id']
			game = GameService.interrupt_game(game_id)
			return Response({'message': 'Game interrupted', 'status': game.status}, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class GameListView(APIView):
# 	permission_classes = [IsAuthenticated]

# 	@extend_schema(
# 		summary="List all games",
# 		responses={200: GameListSerializer(many=True)},
# 		tags=['Games'],
# 	)
# 	def get(self, request: Request) -> Response:

