from django.urls import path

from .views import HelloView, ProtectedView


urlpatterns = [
    path('', HelloView.as_view(), name='hello'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
]
