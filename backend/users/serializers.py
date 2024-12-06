from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import UserProfile


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


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['username', 'avatar', 'friends']


class UsernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)


class RequestIdSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
