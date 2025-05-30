from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from ..serializers.FriendshipRequest import RequestIdSerializer
from ..serializers.UserProfile import SuccessResponseSerializer, UsernameSerializer
from ..services.FriendshipRequest import FriendshipRequestService
from ..services.UserProfile import UserProfileService


class FriendshipRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Send friendship request',
        request=UsernameSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Friendship requests'],
    )
    def post(self, request: Request) -> Response:
        serializer = UsernameSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            to_user = UserProfileService.get_user_profile(serializer.validated_data['username'])
            FriendshipRequestService.create(request.user, to_user)
            return Response({'message': 'Friendship request was sent'},
                            status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class FriendshipRequestModifyView(APIView):
    permission_classes = [IsAuthenticated]
    action = ""

    @extend_schema(
        request=RequestIdSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Friendship requests'],
    )
    def patch(self, request: Request) -> Response:
        if self.action not in ['accept', 'reject', 'cancel']:
            return Response({"error": "Internal server error"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        serializer = RequestIdSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        request_id = serializer.validated_data['request_id']
        try:
            if self.action == 'accept':
                FriendshipRequestService.accept(request_id, request.user)
            elif self.action == 'reject':
                FriendshipRequestService.reject(request_id, request.user)
            else:
                FriendshipRequestService.cancel(request_id, request.user)
            return Response({'message': f'Friendship request was {self.action}ed'},
                            status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BreakOffFriendshipView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=UsernameSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Friendship requests'],
    )
    def post(self, request: Request) -> Response:
        serializer = UsernameSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            friend_name = serializer.validated_data['username']
            FriendshipRequestService.break_off_friendship(request.user, friend_name)
            return Response({'message': f'Friendship with {friend_name} is over'},
                            status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
