from django.urls import path

from .views import HelloView, ProtectedView, game


urlpatterns = [
    path('', HelloView.as_view(), name='hello'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
    path('pong/<str:game_id>/', game, name='pong'),
]
