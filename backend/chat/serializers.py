from rest_framework import serializers
from .models import ChatRoom
from users.models import UserProfile

class ChatGetOrCreateSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        if not UserProfile.objects.filter(username=value).exists():
            raise serializers.ValidationError(f"User {value} not found.")
        return value