from django.urls import path

from .views import FriendshipRequestView, FriendshipRequestModifyView, \
    LogoutView, RegistrationView, UserProfileView, LoginView, RefreshTokenView, \
    PasswordChangeView, MyProfileView, BreakOffFriendshipView, AvatarUploadView, \
    Verify2FAView, Setup2FAView


urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify_2fa/', Verify2FAView.as_view(), name='verify_2fa'),
    path('token_refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('setup_2fa/', Setup2FAView.as_view(), name='setup_2fa'),
    path('', UserProfileView.as_view(), name='user_profile'),
    path('me/', MyProfileView.as_view(), name='my_profile'),
    path('password_change/', PasswordChangeView.as_view(), name='change_password'),
    path('avatar/', AvatarUploadView.as_view(), name='avatar'),
    path('friendship_request/', FriendshipRequestView.as_view(), name='friendship_request'),
    path('friendship_request/accept/', FriendshipRequestModifyView.as_view(action='accept'),
         name='accept_friendship_request'),
    path('friendship_request/reject/', FriendshipRequestModifyView.as_view(action='reject'),
         name='reject_friendship_request'),
    path('friendship_request/cancel/', FriendshipRequestModifyView.as_view(action='cancel'),
         name='cancel_friendship_request'),
    path('remove_friend/', BreakOffFriendshipView.as_view(), name='remove_friend'),
]
