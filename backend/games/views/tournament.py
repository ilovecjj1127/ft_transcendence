from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from games.serializers.tournament import TournamentCreateSerializer, TournamentJoinSerializer, \
							TournamentActionSerializer, TournamentDetailSerializer
from games.models import Tournament
from games.services import TournamentService

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
		winning_score = serializer.validated_data.get('winning_score', 10)
		try:
			tournament = TournamentService.create_tournament(name, alias, user, max_players, min_players, winning_score)
			return Response(
				{
					'message': 'Tournament created successfully',
					'status': tournament.status,
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
					'message': f'{tournament_player.alias} joined Tournament {tournament_player.tournament.name}',
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
		user = request.user
		tournaments = Tournament.objects.filter(status='registration').exclude(
			players__player=user
		)
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
		try:
			leaderboard = TournamentService.calculate_leaderboard(tournament_id)
			return Response(leaderboard, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
