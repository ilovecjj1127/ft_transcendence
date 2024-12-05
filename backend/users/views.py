from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LogoutSerializer, RegistrationSerializer, \
    SuccessResponseSerializer, UserProfileSerializer, UsernameSerializer
from .services import FriendshipRequestService, UserProfileService


class RegistrationView(APIView):

    @extend_schema(
        summary='New user registration',
        request=RegistrationSerializer,
        responses={201: SuccessResponseSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User registered successfully'},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LogoutSerializer,
        responses={200: SuccessResponseSerializer},
    )
    def post(self, request: Request) -> Response:
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter(name='username', required=True, type=str)],
        responses={200: UserProfileSerializer},
    )
    def get(self, request: Request) -> Response:
        username = request.query_params.get('username')
        if username is None:
            return Response({'error': 'Username query parameter is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            user = UserProfileService.get_user_profile(username)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FriendshipRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Send friendship request',
        request=UsernameSerializer,
        responses={200: SuccessResponseSerializer},
    )
    def post(self, request: Request) -> Response:
        try:
            to_user = UserProfileService.get_user_profile(request.data['username'])
            FriendshipRequestService.create(request.user, to_user)
            return Response({'message': 'Friendship request was sent'},
                            status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
