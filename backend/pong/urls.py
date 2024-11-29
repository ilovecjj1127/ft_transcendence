from django.urls import path

from . import views
from .views import ProtectedView


urlpatterns = [
    path('', views.index, name='index'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
]
