import os
from django.conf import settings

class OTPService:
    @classmethod
    def verify_otp(cls, identifier: str, otp_raw: str, purpose: str = "login"):
        static_otp = str(getattr(settings, "STATIC_OTP", os.getenv("STATIC_OTP", "123456"))).strip()
        clean_otp = str(otp_raw).strip()
        if clean_otp == static_otp:
            return True, "Verification successful.", None
        return False, "Invalid verification code. Please try again.", None
