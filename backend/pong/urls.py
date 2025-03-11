from django.urls import path

from .views import HelloView, ProtectedView, game, login, home


urlpatterns = [
    path('', HelloView.as_view(), name='hello'),
    path('home/', home, name='home'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
    path('login/', login, name='login'),
    path('pong/<str:game_id>/', game, name='pong'),
]
