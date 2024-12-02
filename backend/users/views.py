from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse
from django.views import View
from rest_framework import status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
import json

from .forms import LoginForm, RegisterForm
from .serializers import RegistrationSerializer
from django.http import HttpResponse
from django.shortcuts import render

def index(request):
	# return HttpResponse("Hello world")
    return render(request, 'index.html')

class RegistrationView(APIView):
    def post(self, request: Request) -> Response:
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User registered successfully'},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        form = RegisterForm(data)
        if form.is_valid():
            user = form.save()
            return JsonResponse(
                {'message': 'User registered successfully', 'user_id': user.id},
                status=201
            )
        else:
            return JsonResponse({'errors': form.errors}, status=400)

class LoginView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        form = LoginForm(data)
        if not form.is_valid():
            return JsonResponse({'errors': form.errors}, status=400)
        username = form.cleaned_data["username"]
        password = form.cleaned_data["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)


class LogoutView(LoginRequiredMixin, View):
    def post(self, request: HttpRequest) -> JsonResponse:
        logout(request)
        return JsonResponse({'message': 'Logout successful'}, status=200)

