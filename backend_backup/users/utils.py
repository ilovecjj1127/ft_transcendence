import os
import uuid

from django.core.exceptions import ValidationError

from .constants import AVATAR_DEFAULT, AVATAR_UPLOAD_DIR, AVATAR_MAX_SIZE_MB


def avatar_upload_to(instance, filename):
    if filename:
        ext = filename.split('.')[-1]
        new_filename = f"{uuid.uuid4()}.{ext}"
        return os.path.join(AVATAR_UPLOAD_DIR, new_filename)
    return AVATAR_DEFAULT


def validate_avatar_size(file):
    if file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024:
        raise ValidationError(f"File size should not exceed {AVATAR_MAX_SIZE_MB} MB.")
