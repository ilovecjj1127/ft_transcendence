from django.core.exceptions import ValidationError

from .constants import AVATAR_MAX_SIZE_MB


def validate_avatar_size(file):
    if file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024:
        raise ValidationError(f"File size should not exceed {AVATAR_MAX_SIZE_MB} MB.")
