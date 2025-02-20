from django.shortcuts import render
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from users.serializers.UserProfile import SuccessResponseSerializer
from .serializers import ChatCreateSerializer
from .models import ChatRoom
from .services import ChatRoomService


def room(request, room_name):
    return render(request, 'chat/room.html', {
        'room_name': room_name
    })

class ChatCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Create a chat room with another user",
        request=ChatCreateSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Chat'],
    )
    def post(self, request: Request) -> Response:
        serializer = ChatCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user1 = request.user
        username = serializer.validated_data['username']
        room_name = serializer.validated_data['name']
        try:
            chatroom, created = ChatRoomService.get_or_create_chat(
                name=room_name, user1=user1, username=username
            )
            return Response(
                {
                    "chat_room": chatroom.name,
                    "is_blocked": chatroom.is_blocked,
                    "created": created
                }, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BlockChatRoomView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter(name='chatroom_id', required=True, type=int)],
        summary="Block the other user in the ChatRoom",
        responses={200: SuccessResponseSerializer},
        tags=['Chat'],
    )
    def patch(self, request: Request) -> Response:
        chatroom_id = request.query_params.get('chatroom_id')
        if not chatroom_id:
            return Response({'error': 'ChatRoom ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        try:
            chatroom = ChatRoomService.block_action(user, chatroom_id)
            return Response(
                {'message': f'Chatroom {chatroom.name} is blocked by {chatroom.blocked_by.username}'}, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)