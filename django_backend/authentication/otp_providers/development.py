"""
Development / Static OTP Provider
Used when OTP_MODE=development. Does not send third-party SMS/Email/WhatsApp.
Verifies against STATIC_OTP (default 123456).
"""

import os
from django.conf import settings
from .base import BaseOTPProvider


class DevelopmentOTPProvider(BaseOTPProvider):
    """
    Development mode OTP Provider.
    Always uses configured STATIC_OTP without calling external SMS/Email APIs.
    """

    def __init__(self):
        self.static_otp = str(getattr(settings, "STATIC_OTP", os.getenv("STATIC_OTP", "123456"))).strip()

    def send_otp(self, identifier: str, channel: str = "email", purpose: str = "login") -> dict:
        """
        Simulate OTP dispatch for development mode.
        """
        clean_ident = str(identifier).strip().lower()
        if not clean_ident:
            return {
                "success": False,
                "message": "Identifier is required.",
                "otp_code": None
            }

        return {
            "success": True,
            "message": "OTP request successful. Development mode is active.",
            "channel": channel,
            "otp_code": self.static_otp,
            "mode": "development"
        }

    def verify_otp(self, identifier: str, otp_code: str, purpose: str = "login") -> dict:
        """
        Verify submitted OTP against STATIC_OTP in development mode.
        """
        clean_ident = str(identifier).strip().lower()
        submitted_otp = str(otp_code).strip()

        if not clean_ident:
            return {"success": False, "message": "Identifier is required.", "user": None}

        if not submitted_otp:
            return {"success": False, "message": "Verification code is required.", "user": None}

        if submitted_otp == self.static_otp:
            return {
                "success": True,
                "message": "Verification successful.",
                "identifier": clean_ident
            }
        else:
            return {
                "success": False,
                "message": "Invalid verification code. Please check and try again.",
                "user": None
            }
