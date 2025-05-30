import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from PIL import Image

from .constants import AVATAR_DEFAULT, AVATAR_MAX_HEIGHT, AVATAR_MAX_WIDTH
from .utils import avatar_upload_to, validate_avatar_size


class UserProfile(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    avatar = models.ImageField(
        upload_to=avatar_upload_to,
        blank=True,
        default=AVATAR_DEFAULT,
        validators=[validate_avatar_size]
    )
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.avatar and self.avatar.name != AVATAR_DEFAULT:
            with Image.open(self.avatar.path) as img:
                output_size = (AVATAR_MAX_HEIGHT, AVATAR_MAX_WIDTH)
                img.thumbnail(output_size)
                img.save(self.avatar.path)


class FriendshipRequest(models.Model):
    from_user = models.ForeignKey(UserProfile, related_name='sent_requests',
                                  on_delete=models.CASCADE)
    to_user = models.ForeignKey(UserProfile, related_name='received_requests',
                                on_delete=models.CASCADE)
    status = models.CharField(
        max_length = 10,
        choices=[ 
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected'), 
            ('canceled', 'Canceled')
        ],
        default = 'pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_user', 'to_user')
