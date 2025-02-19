from django.db import models
from users.models import UserProfile
from django.contrib.postgres.fields import JSONField

class ChatRoom(models.Model):
    name = models.CharField(max_length=20)
    user1 = models.ForeignKey(UserProfile, related_name='chat_rooms1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(UserProfile, related_name='chat_rooms2', on_delete=models.CASCADE)
    history = JSONField(default=list)
    blocked_by = models.ForeignKey(UserProfile, null=True, blank=True, on_delete=models.SET_NULL)

    @property
    def is_blocked(self):
        return self.blocked_by is not None