from django.urls import path
from .views import RegisterView, LoginView, LogoutView, RegistrationView
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout')
]