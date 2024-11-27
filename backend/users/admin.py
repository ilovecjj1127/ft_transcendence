from django.contrib import admin

from .models import FriendshipRequest, UserProfile


admin.site.register(FriendshipRequest)
admin.site.register(UserProfile)
