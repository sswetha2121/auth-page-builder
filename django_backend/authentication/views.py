import bcrypt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from configurations.models import AuthConfiguration
from authentication.models import AuthUser
from authentication.serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    SendEmailOTPSerializer,
    VerifyOTPSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from authentication.auth import generate_jwt_token
from authentication.services.otp_service import OTPService, EmailOTPProvider, WhatsAppOTPProvider


class RegisterView(APIView):
    """
    Register a new user account.
    POST /api/auth/register, /api/auth/signup/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            first_key = list(errors.keys())[0]
            first_err = errors[first_key]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            status_code = status.HTTP_409_CONFLICT if "already" in err_msg.lower() or "taken" in err_msg.lower() else status.HTTP_400_BAD_REQUEST
            return Response({"success": False, "message": err_msg, "errors": errors}, status=status_code)

        user = serializer.save()
        token = generate_jwt_token(user)
        user_data = UserProfileSerializer(user).data

        return Response(
            {
                "success": True,
                "message": "User registered successfully.",
                "token": token,
                "user": user_data,
                "redirect_url": None,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Authenticate user via username, email, or mobile.
    POST /api/auth/login, /api/auth/login/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            err_msg = (
                errors.get("non_field_errors", [None])[0]
                or errors.get("identifier", [None])[0]
                or errors.get("password", [None])[0]
                or "Invalid credentials."
            )
            return Response({"success": False, "message": str(err_msg)}, status=status.HTTP_401_UNAUTHORIZED)

        user = serializer.validated_data["user"]
        token = generate_jwt_token(user)
        user_data = UserProfileSerializer(user).data

        # Get active configuration redirect_url if available
        active_config = AuthConfiguration.objects.filter(user_id=user.id, is_active=True).order_by("-updated_at").first()
        redirect_url = active_config.redirect_url if active_config and active_config.redirect_url else None

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "token": token,
                "user": user_data,
                "redirect_url": redirect_url,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    Logout user.
    POST /api/auth/logout, /api/auth/logout/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(
            {
                "success": True,
                "message": "Logged out successfully.",
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """
    Get current logged in user's profile.
    GET /api/auth/me, /api/auth/me/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user:
            return Response({"success": False, "message": "User not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = UserProfileSerializer(user).data
        return Response({"success": True, "user": user_data}, status=status.HTTP_200_OK)


class SendEmailOTPView(APIView):
    """
    Generate and send secure OTP to user's registered email.
    POST /api/otp/send-email/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendEmailOTPSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            err_msg = list(errors.values())[0][0] if errors else "Invalid request."
            return Response({"success": False, "message": str(err_msg)}, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"]
        purpose = serializer.validated_data.get("purpose", "login")

        # Resolve user by username or email
        user = (
            AuthUser.objects.filter(username__iexact=identifier, is_active=True).first()
            or AuthUser.objects.filter(email__iexact=identifier.lower(), is_active=True).first()
            or AuthUser.objects.filter(mobile=identifier, is_active=True).first()
        )

        if not user:
            return Response(
                {
                    "success": False,
                    "message": "No registered account found with that username or email.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        target_email = user.email
        if not target_email or "@" not in target_email:
            return Response(
                {
                    "success": False,
                    "message": "No valid email address associated with this account.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate secure single-use OTP
        otp_raw, otp_record = OTPService.create_otp(
            identifier=identifier,
            purpose=purpose,
            user=user,
            expiry_minutes=10
        )

        # Send real email via SMTP
        EmailOTPProvider.send_otp_email(
            to_email=target_email,
            otp_code=otp_raw,
            purpose=purpose,
            username=user.full_name or user.username
        )

        masked_email = EmailOTPProvider.mask_email(target_email)

        return Response(
            {
                "success": True,
                "message": f"Verification code sent to your registered email ({masked_email}).",
                "masked_email": masked_email,
            },
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    """
    Verify single-use OTP for login or other purpose.
    POST /api/otp/verify/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            err_msg = list(errors.values())[0][0] if errors else "Invalid verification code."
            return Response({"success": False, "message": str(err_msg)}, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"]
        otp = serializer.validated_data["otp"]
        purpose = serializer.validated_data.get("purpose", "login")

        is_valid, msg, user = OTPService.verify_otp(identifier, otp, purpose=purpose)
        if not is_valid:
            return Response({"success": False, "message": msg}, status=status.HTTP_401_UNAUTHORIZED)

        # If login verification, issue JWT and retrieve redirect_url
        if purpose == "login" and user:
            token = generate_jwt_token(user)
            user_data = UserProfileSerializer(user).data
            active_config = AuthConfiguration.objects.filter(user_id=user.id, is_active=True).order_by("-updated_at").first()
            redirect_url = active_config.redirect_url if active_config and active_config.redirect_url else None

            return Response(
                {
                    "success": True,
                    "message": "OTP verified successfully. Login successful.",
                    "token": token,
                    "user": user_data,
                    "redirect_url": redirect_url,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": True,
                "message": "Verification code confirmed successfully.",
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    """
    Step 1 of Password Reset: Request OTP.
    POST /api/password-reset/request/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            err_msg = list(errors.values())[0][0] if errors else "Invalid request."
            return Response({"success": False, "message": str(err_msg)}, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"]

        user = (
            AuthUser.objects.filter(username__iexact=identifier, is_active=True).first()
            or AuthUser.objects.filter(email__iexact=identifier.lower(), is_active=True).first()
        )

        if not user or not user.email:
            return Response(
                {
                    "success": False,
                    "message": "No account found matching this username or email.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create password_reset OTP
        otp_raw, otp_record = OTPService.create_otp(
            identifier=identifier,
            purpose="password_reset",
            user=user,
            expiry_minutes=10
        )

        EmailOTPProvider.send_otp_email(
            to_email=user.email,
            otp_code=otp_raw,
            purpose="password_reset",
            username=user.full_name or user.username
        )

        masked = EmailOTPProvider.mask_email(user.email)
        return Response(
            {
                "success": True,
                "message": f"Password reset verification code sent to {masked}.",
                "masked_email": masked,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetVerifyOTPView(APIView):
    """
    Step 2 of Password Reset: Validate OTP before password reset form.
    POST /api/password-reset/verify-otp/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            err_msg = list(errors.values())[0][0] if errors else "Invalid verification code."
            return Response({"success": False, "message": str(err_msg)}, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"]
        otp = serializer.validated_data["otp"]

        is_valid, msg, user = OTPService.verify_otp(identifier, otp, purpose="password_reset")
        if not is_valid:
            return Response({"success": False, "message": msg}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "success": True,
                "message": "Verification code verified successfully. You may now enter your new password.",
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    Step 3 of Password Reset: Set new password.
    POST /api/password-reset/confirm/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            err_msg = list(errors.values())[0][0] if errors else "Invalid input."
            return Response({"success": False, "message": str(err_msg)}, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        # Resolve user
        user = (
            AuthUser.objects.filter(username__iexact=identifier, is_active=True).first()
            or AuthUser.objects.filter(email__iexact=identifier.lower(), is_active=True).first()
        )

        if not user:
            return Response({"success": False, "message": "Account not found."}, status=status.HTTP_404_NOT_FOUND)

        # Hash new password with bcrypt
        salt = bcrypt.gensalt(rounds=10)
        password_hash = bcrypt.hashpw(new_password.encode("utf-8"), salt).decode("utf-8")

        user.password = password_hash[:128]
        user.password_hash = password_hash
        user.save(update_fields=["password", "password_hash"])

        return Response(
            {
                "success": True,
                "message": "Your password has been reset successfully. You can now log in with your new password.",
            },
            status=status.HTTP_200_OK,
        )

