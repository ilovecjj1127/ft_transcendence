from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView

from users.serializers import SuccessResponseSerializer


class HelloView(APIView):
    @extend_schema(
        summary='Test non-protected endpoint',
        description='Test description',
        responses={200: SuccessResponseSerializer},
    )
    def get(self, request: Request) -> Response:
        return Response({'message': 'Hello World!'},
                        status=status.HTTP_200_OK)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Test protected endpoint',
        responses={200: SuccessResponseSerializer},
    )
    def get(self, request: Request) -> Response:
        return Response({'message': 'You got access to a protected endpoint!'},
                        status=status.HTTP_200_OK)
