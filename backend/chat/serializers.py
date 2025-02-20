from rest_framework import serializers
from .models import ChatRoom
from users.models import UserProfile

class ChatCreateSerializer(serializers.Serializer):
	username = serializers.CharField()
	name = serializers.CharField(max_length=20)

	def validate_username(self, value):
		if not UserProfile.objects.filter(username=value).exists():
			raise serializers.ValidationError(f"User {value} not found.")
		return value