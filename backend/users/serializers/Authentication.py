from django.contrib.auth import authenticate
import jwt
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import UserProfile
from ..services.User2FA import User2FAService


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid credentials')
        if user.is_2fa_enabled:
            return {
                "required_2fa": True,
                "partial_token": User2FAService.create_partial_token(user.id)
            }
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class OTPCodeSerializer(serializers.Serializer):
    otp_code = serializers.CharField(max_length=6)


class QRCodeSerializer(serializers.Serializer):
    qr_code = serializers.CharField()


class PartialTokenSerializer(serializers.Serializer):
    required_2fa = serializers.BooleanField()
    partial_token = serializers.CharField()


class Verify2FASerializer(serializers.Serializer):
    partial_token = serializers.CharField()
    otp_code = serializers.CharField()

    def validate(self, attrs):
        partial_token = attrs.get('partial_token')
        otp_code = attrs.get('otp_code')
        try:
            payload = User2FAService.decode_partial_token(partial_token)
        except jwt.ExpiredSignatureError:
            raise serializers.ValidationError('Partial token expired')
        except jwt.InvalidTokenError:
            raise serializers.ValidationError('Invalid partial token')
        if payload.get('token_type', '') != 'pending_2fa':
            raise serializers.ValidationError('Token is not a 2FA pending token')
        user_id = payload.get('user_id')
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError('Incorrect user_id')
        if not user.is_2fa_enabled:
            raise serializers.ValidationError('2FA is not enabled for this user')
        if not User2FAService.verify_otp_code(user.otp_secret, otp_code):
            raise serializers.ValidationError('Invalid code. Try again')
        attrs['user'] = user
        return attrs
