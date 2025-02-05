from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import extend_schema_field
import jwt
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import FriendshipRequest, UserProfile
from .services import User2FAService


class SuccessResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = UserProfile
        fields = ['username', 'password', 'id']
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True}
        }

    def create(self, validated_data):
        return UserProfile.objects.create_user(**validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user.is_2fa_enabled:
            return {
                "required_2fa": True,
                "partial_token": User2FAService.create_partial_token(user.id)
            }
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class FriendshipRequestInSerializer(serializers.ModelSerializer):
    from_user = serializers.CharField(source='from_user.username')
    class Meta:
        model = FriendshipRequest
        fields = ['id', 'from_user']


class FriendshipRequestOutSerializer(serializers.ModelSerializer):
    to_user = serializers.CharField(source='to_user.username')
    class Meta:
        model = FriendshipRequest
        fields = ['id', 'to_user']


class MyProfileSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()
    received_requests = FriendshipRequestInSerializer(many=True, read_only=True)
    sent_requests = FriendshipRequestOutSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'avatar','is_2fa_enabled',
                  'friends', 'received_requests', 'sent_requests']

    def get_friends(self, obj):
        return [friend.username for friend in obj.friends.all()]


class UserProfileSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'avatar', 'friends']

    def get_friends(self, obj):
        return [friend.username for friend in obj.friends.all()]


class UsernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)


class RequestIdSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


@extend_schema_field({'type': 'string', 'format': 'binary'})
class AvatarField(serializers.ImageField):
    pass


class AvatarSerializer(serializers.Serializer):
    avatar = AvatarField()


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
