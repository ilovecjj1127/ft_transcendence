from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from ..serializers.UserProfile import RegistrationSerializer, SuccessResponseSerializer, \
    UserProfileSerializer, PasswordChangeSerializer, MyProfileSerializer, AvatarSerializer
from ..services.UserProfile import UserProfileService


class RegistrationView(APIView):
    @extend_schema(
        summary='New user registration',
        request=RegistrationSerializer,
        responses={201: SuccessResponseSerializer},
        tags=['Users'],
    )
    def post(self, request: Request) -> Response:
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User registered successfully'},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter(name='username', required=True, type=str)],
        responses={200: UserProfileSerializer},
        tags=['Users'],
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


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MyProfileSerializer},
        tags=['Users'],
    )
    def get(self, request: Request) -> Response:
        user = UserProfileService.get_my_profile(request.user)
        serializer = MyProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Change password',
        request=PasswordChangeSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Users'],
    )
    def patch(self, request: Request) -> Response:
        serializer = PasswordChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            UserProfileService.change_password(request.user, old_password, new_password)
            return Response({'message': 'Password was changed successfully'},
                            status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    @extend_schema(
        request=AvatarSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Users'],
    )
    def post(self, request: Request) -> Response:
        serializer = AvatarSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        avatar = serializer.validated_data['avatar']
        try:
            UserProfileService.update_avatar(request.user, avatar)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': 'Avatar uploaded successfully'},
                        status=status.HTTP_200_OK)
