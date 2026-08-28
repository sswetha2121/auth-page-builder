from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection

from authentication.views import (
    SendEmailOTPView,
    VerifyOTPView,
    PasswordResetRequestView,
    PasswordResetVerifyOTPView,
    PasswordResetConfirmView,
)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_status = "disconnected"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_status = "connected"
        except Exception:
            db_status = "disconnected"

        return Response(
            {
                "status": "ok",
                "backend": "django",
                "database": db_status,
            }
        )


urlpatterns = [
    path("api/health", HealthCheckView.as_view(), name="api-health"),
    path("api/health/", HealthCheckView.as_view(), name="api-health-slash"),
    path("api/auth/", include("authentication.urls")),
    path("api/auth", include("authentication.urls")),
    path("api/configurations/", include("configurations.urls")),
    path("api/configurations", include("configurations.urls")),

    # OTP Endpoints
    path("api/otp/send-email", SendEmailOTPView.as_view(), name="otp-send-email"),
    path("api/otp/send-email/", SendEmailOTPView.as_view(), name="otp-send-email-slash"),
    path("api/otp/verify", VerifyOTPView.as_view(), name="otp-verify"),
    path("api/otp/verify/", VerifyOTPView.as_view(), name="otp-verify-slash"),

    # Password Reset Endpoints
    path("api/password-reset/request", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("api/password-reset/request/", PasswordResetRequestView.as_view(), name="password-reset-request-slash"),
    path("api/password-reset/verify-otp", PasswordResetVerifyOTPView.as_view(), name="password-reset-verify-otp"),
    path("api/password-reset/verify-otp/", PasswordResetVerifyOTPView.as_view(), name="password-reset-verify-otp-slash"),
    path("api/password-reset/confirm", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("api/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm-slash"),
]

