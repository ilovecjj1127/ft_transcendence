from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse
from django.views import View

from .forms import LoginForm, RegisterForm


class RegisterView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        form = RegisterForm(data=request.POST)
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
        form = LoginForm(request.POST)
        if not form.is_valid():
            return JsonResponse({'error': form.errors}, status=400)
        user = authenticate(request, username=form.username, password=form.password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)


class LogoutView(LoginRequiredMixin, View):
    def post(self, request: HttpRequest) -> JsonResponse:
        logout(request)
        return JsonResponse({'message': 'Logout successful'}, status=200)
