from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import UserProfile


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
