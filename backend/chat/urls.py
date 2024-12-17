from django.urls import path

from .views import room, login


urlpatterns = [
    path('login/', login, name='login'),
    path('<str:room_name>/', room, name='room'),
]
