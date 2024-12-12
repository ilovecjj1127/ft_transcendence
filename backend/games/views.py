from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from .serializers import GameCreateSerializer, GameUpdateSerializer
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

class GameUpdateView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		summary="Update game info",
		# responses={200: GameListSerializer(many=True)},
		tags=['Games'],
	)
	def patch(self, request: Request, game_id) -> Response:
		try:
			game = Game.objects.get(id=game_id)
		except Game.DoesNotExist:
			return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)
		serializer = GameUpdateSerializer(game, data=request.data, partial=True)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		

# class GameListView(APIView):
# 	permission_classes = [IsAuthenticated]

# 	@extend_schema(
# 		summary="List all games",
# 		responses={200: GameListSerializer(many=True)},
# 		tags=['Games'],
# 	)
# 	def get(self, request: Request) -> Response:

