import os
import uuid

from .constants import AVATAR_DEFAULT, AVATAR_UPLOAD_DIR


def avatar_upload_to(instance, filename):
    if filename:
        ext = filename.split('.')[-1]
        new_filename = f"{uuid.uuid4()}.{ext}"
        return os.path.join(AVATAR_UPLOAD_DIR, new_filename)
    return AVATAR_DEFAULT