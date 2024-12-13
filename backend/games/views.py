from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .serializers import GameCreateSerializer, GameUpdateSerializer, GameCompletionSerializer
from .models import Game

class GameCreateView(APIView):

	@extend_schema(
		summary="Create a new game",
		request=GameCreateSerializer,
		# responses={201: SuccessResponseSerializer},
		tags=['Games'],
	)
	def post(self, request: Request) -> Response:
		serializer = GameCreateSerializer(data=request.data)
		if serializer.is_valid():
			game = serializer.save()
			return Response({'message': 'Game created successfully'},
				   			status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GameStartView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Start the game",
		tags=['Games'],
	)
	def patch(self, request, game_id):
		game = get_object_or_404(Game, id=game_id)
		if game.status != 'pending':
			return Response({'error': 'Game cannot be started'}, status=status.HTTP_400_BAD_REQUEST)
		game.status = 'in_progress'
		game.save()
		return Response({'message': 'Game started', 'status': game.status}, status=status.HTTP_200_OK)

class GameUpdateView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Update game scores",
		request=GameUpdateSerializer,
		# responses={200: GameListSerializer(many=True)},
		tags=['Games'],
	)
	def patch(self, request: Request, game_id) -> Response:
		game = get_object_or_404(Game, id=game_id)
		serializer = GameUpdateSerializer(game, data=request.data, partial=True)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		updated_game = serializer.save()


class GameInterruptView(APIView):
	permission_classes = [IsAuthenticated]
	@extend_schema(
		summary="Interrupt the game",
		# responses={200: GameListSerializer(many=True)},
		tags=['Games'],
	)
	def patch(self, request, game_id):
		game = get_object_or_404(Game, id=game_id)
		if game.status != 'in_progress': # is this necessary?
			return Response({'error': 'Only games in progress can be interrupted'}, status=status.HTTP_400_BAD_REQUEST)
		game.status = 'interrupted'
		game.save()
		return Response({'message': 'Game interrupted'})

class GameEndView(APIView):
	permission_classe = [IsAuthenticated]

	@extend_schema(
		summary="End the game",
		request=GameCompletionSerializer,
		responses={200: GameCompletionSerializer}
	)
	def post(self, request, game_id):
		game = get_object_or_404(Game, id=game_id)
		if request.user != game.player1 and request.user != game.player2:
			return Response({'error': 'Not authorized to end game'}, status=status.HTTP_403_FORBIDDEN)
		serializer = GameCompletionSerializer(data=request.data, )

# class GameListView(APIView):
# 	permission_classes = [IsAuthenticated]

# 	@extend_schema(
# 		summary="List all games",
# 		responses={200: GameListSerializer(many=True)},
# 		tags=['Games'],
# 	)
# 	def get(self, request: Request) -> Response:

