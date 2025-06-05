from django.shortcuts import render
from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from users.serializers.UserProfile import SuccessResponseSerializer
from .serializers import ChatGetOrCreateSerializer
from .services import ChatRoomService


def room(request, room_id):
    return render(request, 'chat/room.html', {
        'room_id': room_id
    })

class ChatGetOrCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get or Create a chat room with another user",
        request=ChatGetOrCreateSerializer,
        responses={200: SuccessResponseSerializer},
        tags=['Chat'],
    )
    def post(self, request: Request) -> Response:
        serializer = ChatGetOrCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user1 = request.user
        username = serializer.validated_data['username']
        try:
            chatroom, created = ChatRoomService.get_or_create_chat(
                user1=user1, username=username
            )
            blocked_by = chatroom.blocked_by.username if chatroom.blocked_by else None
            return Response(
               {
                   "chat_room_id": chatroom.id,
                   "blocked_by": blocked_by,
                   "is_newly_created": created
               }, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ChatBlockorUnblockView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter(name='chatroom_id', required=True, type=int)],
        summary="Block or Unblock the other user in the ChatRoom",
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
            if chatroom.is_blocked:
                return Response(
                    {'message': f'Chatroom is blocked by {chatroom.blocked_by.username}'}, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'message': f'Chatroom is unblocked'}, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
