"""
Abstract Base OTP Provider
Defines contract for OTP generation, delivery, and verification.
"""

from abc import ABC, abstractmethod


class BaseOTPProvider(ABC):
    """
    Abstract interface for OTP delivery providers (Development, Twilio, SendGrid, etc.).
    """

    @abstractmethod
    def send_otp(self, identifier: str, channel: str = "email", purpose: str = "login") -> dict:
        """
        Generate and deliver OTP to user identifier via requested channel.
        Returns dict: {"success": bool, "message": str, "otp_code": str | None}
        """
        pass

    @abstractmethod
    def verify_otp(self, identifier: str, otp_code: str, purpose: str = "login") -> dict:
        """
        Verify submitted OTP code for given identifier and purpose.
        Returns dict: {"success": bool, "message": str, "user": obj | None}
        """
        pass
