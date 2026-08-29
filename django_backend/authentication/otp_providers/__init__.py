"""
OTP Providers Package for Auth Page Builder
"""

from .base import BaseOTPProvider
from .development import DevelopmentOTPProvider

__all__ = ["BaseOTPProvider", "DevelopmentOTPProvider"]
