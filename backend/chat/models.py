from django.db import models
from users.models import UserProfile
from django.contrib.postgres.fields import JSONField

class ChatRoom(models.Model):
    user1 = models.ForeignKey(UserProfile, related_name='chat_rooms1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(UserProfile, related_name='chat_rooms2', on_delete=models.CASCADE)
    history = models.JSONField(default=list)
    blocked_by = models.ForeignKey(UserProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name="blocked_chat")
    unread_by = models.ForeignKey(UserProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name="unread_chat")

    @property
    def is_blocked(self):
        return self.blocked_by is not None
    
    def __str__(self):
        return f"Chatroom: {self.user1.username} and {self.user2.username}"