from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import FriendshipRequest, UserProfile


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
        fields = ['username', 'avatar', 'friends', 'received_requests', 'sent_requests']

    def get_friends(self, obj):
        return [friend.username for friend in obj.friends.all()]


class UserProfileSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['username', 'avatar', 'friends']

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
