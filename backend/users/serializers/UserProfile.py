from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .FriendshipRequest import FriendshipRequestInSerializer, FriendshipRequestOutSerializer
from ..models import UserProfile


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


class MyProfileSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()
    received_requests = FriendshipRequestInSerializer(many=True, read_only=True)
    sent_requests = FriendshipRequestOutSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'avatar','is_2fa_enabled',
                  'friends', 'received_requests', 'sent_requests']

    def get_friends(self, obj) -> list[str]:
        return [friend.username for friend in obj.friends.all()]


class UserProfileSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'avatar', 'friends']

    def get_friends(self, obj) -> list[str]:
        return [friend.username for friend in obj.friends.all()]


class UsernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


@extend_schema_field({'type': 'string', 'format': 'binary'})
class AvatarField(serializers.ImageField):
    pass


class AvatarSerializer(serializers.Serializer):
    avatar = AvatarField()
