from django.conf import settings
from django.db import transaction
import jwt
import pyotp
import qrcode

import base64
import datetime
from io import BytesIO
from uuid import UUID

from ..models import UserProfile


class User2FAService:
    @staticmethod
    def generate_otp_secret() -> str:
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(secret: str, username: str) -> str:
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=username, issuer_name="FT_TRANSCENDENCE")

    @staticmethod
    def generate_qr_code(provisioning_uri) -> bytes:
        ''' 
        Add this to display QR code:
        <img src="data:image/png;base64,{{ qr_code_data }}" alt="QR code"/>
        '''
        
        qr = qrcode.QRCode(box_size=10, border=4)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return img_str

    @staticmethod
    def verify_otp_code(secret: str, user_input_code: str) -> bool:
        totp = pyotp.TOTP(secret)
        return totp.verify(user_input_code)

    @staticmethod
    @transaction.atomic
    def connect_with_2fa_app(user: UserProfile):
        if user.is_2fa_enabled:
            raise ValueError('2FA is already enabled')
        user.otp_secret = User2FAService.generate_otp_secret()
        user.save()
        provisioning_uri = User2FAService.get_provisioning_uri(
            secret=user.otp_secret,
            username=user.username
        )
        return User2FAService.generate_qr_code(provisioning_uri)

    @staticmethod
    @transaction.atomic
    def setup_2fa(user: UserProfile, user_code: str):
        if user.is_2fa_enabled:
            raise ValueError('2FA is already enabled')
        otp_secret = user.otp_secret
        if not otp_secret:
            raise ValueError('OTP secret was not set')
        if not User2FAService.verify_otp_code(otp_secret, user_code):
            raise ValueError('Invalid code. Try again')
        user.is_2fa_enabled = True
        user.save()

    @staticmethod
    def create_partial_token(user_id: UUID) -> str:
        """
        Creates a short-lived JWT indicating the user passed the password check
        but still needs to pass 2FA.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        exp = now + datetime.timedelta(minutes=5)
        payload = {
            "user_id": str(user_id),
            "token_type": "pending_2fa",
            "iat": now,
            "exp": exp
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    @staticmethod
    def decode_partial_token(token: str) -> dict:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
