from rest_framework import serializers

from ..models import FriendshipRequest


class RequestIdSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()


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
