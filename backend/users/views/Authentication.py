from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from ..serializers.Authentication import LoginSerializer, LogoutSerializer, \
    OTPCodeSerializer, Verify2FASerializer, PartialTokenSerializer, QRCodeSerializer
from ..serializers.UserProfile import SuccessResponseSerializer
from ..services.User2FA import User2FAService
from ..services.UserProfile import UserProfileService


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

    @extend_schema(
        request=LoginSerializer,
        responses={200: TokenObtainPairSerializer, 202: PartialTokenSerializer},
        tags=['Authentication'],
    )
    def post(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        if data.get("required_2fa"):
            return Response(data, status=status.HTTP_202_ACCEPTED)
        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(tags=['Authentication'])
)
class RefreshTokenView(TokenRefreshView):
    pass


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LogoutSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Authentication'],
    )
    def post(self, request: Request) -> Response:
        serializer = LogoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh_token = serializer.validated_data['refresh']
            UserProfileService.logout(refresh_token)
            return Response({'message': 'Logout successful'},
                            status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class Setup2FAView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Ask for 2FA setup',
        request=None,
        responses={200: QRCodeSerializer},
        tags=['Authentication']
    )
    def patch(self, request: Request) -> Response:
        try:
            qr_code = User2FAService.connect_with_2fa_app(request.user)
        except Exception as e:
            return Response({'error': str(e)}, status.HTTP_400_BAD_REQUEST)
        return Response({'qr_code': qr_code}, status=status.HTTP_200_OK)

    @extend_schema(
        summary='Confirm 2FA setup',
        request=OTPCodeSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Authentication']
    )
    def post(self, request: Request) -> Response:
        serializer = OTPCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user_code = serializer.validated_data['otp_code']
        try:
            User2FAService.setup_2fa(request.user, user_code)
        except Exception as e:
            return Response({'error': str(e)}, status.HTTP_400_BAD_REQUEST)
        return Response({'message': '2FA was setup successfully'},
                        status=status.HTTP_200_OK)


class Verify2FAView(APIView):
    @extend_schema(
        request=Verify2FASerializer,
        responses={200: TokenObtainPairSerializer},
        tags=['Authentication'],
    )
    def post(self, request: Request) -> Response:
        serializer = Verify2FASerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }
        return Response(data, status=status.HTTP_200_OK)
