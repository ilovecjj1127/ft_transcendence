from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import FriendshipRequestView, LogoutView, RegistrationView, UserProfileView


urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token_refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('', UserProfileView.as_view(), name='user_profile'),
    path('friendship_request/', FriendshipRequestView.as_view(), name='friendship_request'),
    path('friendship_request/accept/', FriendshipRequestView.as_view(action='accept'),
         name='accept_friendship_request'),
    path('friendship_request/reject/', FriendshipRequestView.as_view(action='reject'),
         name='reject_friendship_request'),
    path('friendship_request/cancel/', FriendshipRequestView.as_view(action='cancel'),
         name='cancel_friendship_request'),
]