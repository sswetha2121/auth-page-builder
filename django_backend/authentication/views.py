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


import logging
logger = logging.getLogger(__name__)


def resolve_user_active_configuration(user, session_id=None):
    """
    Guarantees user has exactly one active configuration inside a transaction.atomic block.
    Claims anonymous session configuration if present; creates default configuration if missing.
    Returns the active AuthConfiguration instance.
    """
    from django.db import transaction
    from django.utils import timezone
    from configurations.models import AuthConfiguration

    with transaction.atomic():
        user_configs = AuthConfiguration.objects.filter(user_id=user.id, is_active=True).order_by("-updated_at")
        user_config = user_configs.first()

        # Handle anonymous session transfer if session_id is present
        if session_id:
            anon_configs = AuthConfiguration.objects.filter(builder_session_id=session_id, user_id__isnull=True, is_active=True)
            if anon_configs.exists():
                primary_anon = anon_configs.order_by("-updated_at").first()
                if not user_config:
                    primary_anon.user_id = user.id
                    primary_anon.builder_session_id = None
                    primary_anon.updated_at = timezone.now()
                    primary_anon.save(update_fields=["user_id", "builder_session_id", "updated_at"])
                    user_config = primary_anon
                    anon_configs.exclude(id=primary_anon.id).update(is_active=False)
                else:
                    if primary_anon.configuration_data:
                        user_config.configuration_data = primary_anon.configuration_data
                        user_config.updated_at = timezone.now()
                        user_config.save()
                    anon_configs.update(is_active=False)

        # If user still has no active configuration, create a default active configuration
        if not user_config:
            default_data = {
                "activePage": "login",
                "previewMode": "desktop",
                "redirect": {"enabled": True, "redirectUrl": "/dashboard", "redirectType": "url", "openInNewTab": False, "showSuccessMessage": True, "successMessage": "Authentication completed successfully.", "delay": 0},
                "urls": {"landingPageUrl": "https://customerwebsite.com", "redirectUrl": "/dashboard", "showBackToWebsite": True, "backToWebsiteText": "Back to Website", "openInNewTab": False},
                "layout": {"type": "split-left-image", "imageWidth": 50, "formHorizontalAlignment": "center", "formVerticalAlignment": "center", "formWidth": 460, "contentPadding": 48},
                "background": {"type": "default", "selected": "assets/backgrounds/background-1.svg", "image": "assets/backgrounds/background-1.svg", "uploadedImage": "", "color": "#0f172a", "gradientEnabled": False, "gradientStart": "#0f172a", "gradientEnd": "#1e293b", "position": "center", "size": "cover", "repeat": "no-repeat", "overlayEnabled": True, "overlayColor": "#000000", "overlayOpacity": 35},
                "branding": {"showLogo": True, "selectedLogo": "assets/logos/brand-shield.svg", "logo": "assets/logos/brand-shield.svg", "uploadedLogo": "", "logoSize": 64, "logoShape": "circle", "logoPosition": "center", "brandName": "Your Brand"},
                "card": {"enabled": True, "backgroundColor": "#ffffff", "opacity": 100, "width": 460, "borderRadius": 20, "borderWidth": 1, "borderColor": "#e2e8f0", "shadowEnabled": True, "blurEnabled": False, "padding": 40},
                "typography": {"fontFamily": "Inter, sans-serif", "titleColor": "#0f172a", "subtitleColor": "#64748b", "bodyColor": "#334155", "labelColor": "#475569", "titleSize": 32, "subtitleSize": 15, "titleWeight": "700"},
                "button": {"backgroundType": "solid", "backgroundColor": "#2563eb", "gradientStart": "#2563eb", "gradientEnd": "#4f46e5", "textColor": "#ffffff", "borderRadius": 10, "height": 48, "shadow": True},
                "social": {"enabled": True, "dividerText": "or continue with", "providers": {"google": True, "apple": True, "github": True}, "layout": "horizontal"},
                "pages": {"login": {"title": "Welcome back", "subtitle": "Sign in to continue to your account", "buttonText": "Sign In", "emailEnabled": True, "passwordEnabled": True}}
            }
            user_config = AuthConfiguration.objects.create(
                user=user,
                configuration_name=f"{user.username}'s Auth Experience",
                landing_url="https://customerwebsite.com",
                redirect_url="/dashboard",
                configuration_data=default_data,
                is_active=True
            )

        # Deactivate any duplicate active configurations for this user
        extra = AuthConfiguration.objects.filter(user_id=user.id, is_active=True).exclude(id=user_config.id)
        if extra.exists():
            extra.update(is_active=False)

        return user_config


class RegisterView(APIView):
    """
    Register a new user account.
    POST /api/auth/register, /api/auth/register/, /api/auth/signup/
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            serializer = UserRegisterSerializer(data=request.data)
            if not serializer.is_valid():
                errors = serializer.errors
                err_msg = "Registration validation failed."
                if "username" in errors:
                    err_msg = str(errors["username"][0])
                elif "email" in errors:
                    err_msg = str(errors["email"][0])
                elif "password" in errors:
                    err_msg = str(errors["password"][0])
                elif errors:
                    first_key = list(errors.keys())[0]
                    first_err = errors[first_key]
                    err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)

                status_code = status.HTTP_409_CONFLICT if "already" in err_msg.lower() or "taken" in err_msg.lower() else status.HTTP_400_BAD_REQUEST
                return Response({"success": False, "message": err_msg, "errors": errors}, status=status_code)

            from django.utils import timezone
            from django.db import transaction
            from authentication.services.redirect_service import get_redirect_config, get_redirect_url
            from configurations.serializers import ConfigurationSerializer

            with transaction.atomic():
                user = serializer.save()
                user.last_login = timezone.now()
                user.save(update_fields=["last_login"])

                session_id = (
                    (request.data.get("builder_session_id") if isinstance(request.data, dict) else None)
                    or request.META.get("HTTP_X_BUILDER_SESSION_ID")
                    or request.META.get("x-builder-session-id")
                )
                user_config = resolve_user_active_configuration(user, session_id)

            token = generate_jwt_token(user)
            user_data = UserProfileSerializer(user).data
            config_id = request.data.get("configuration_id") or request.data.get("config_id") or user_config.id
            redirect_obj = get_redirect_config(config_id, user.id)
            redirect_url = redirect_obj["redirectUrl"]

            return Response(
                {
                    "success": True,
                    "message": "Registration successful.",
                    "user": user_data,
                    "user_id": user.id,
                    "configuration_id": user_config.id,
                    "configuration": ConfigurationSerializer(user_config).data,
                    "token": token,
                    "redirect": redirect_obj,
                    "redirect_url": redirect_url,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            safe_username = str(request.data.get("username", "")).strip() if isinstance(request.data, dict) else ""
            logger.error(f"[RegisterView] Unexpected error during registration for user='{safe_username}': {str(e)}", exc_info=True)
            return Response(
                {"success": False, "message": "An unexpected error occurred during registration. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(APIView):
    """
    Authenticate user via username, email, or mobile.
    POST /api/auth/login, /api/auth/login/
    """
    permission_classes = [AllowAny]
    authentication_classes = []

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

        from django.utils import timezone
        from django.db import transaction
        from authentication.services.redirect_service import get_redirect_config, get_redirect_url
        from configurations.serializers import ConfigurationSerializer

        user = serializer.validated_data["user"]
        
        with transaction.atomic():
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            session_id = (
                (request.data.get("builder_session_id") if isinstance(request.data, dict) else None)
                or request.META.get("HTTP_X_BUILDER_SESSION_ID")
                or request.META.get("x-builder-session-id")
            )
            user_config = resolve_user_active_configuration(user, session_id)

        token = generate_jwt_token(user)
        user_data = UserProfileSerializer(user).data

        config_id = request.data.get("configuration_id") or request.data.get("config_id") or user_config.id
        redirect_obj = get_redirect_config(config_id, user.id)
        redirect_url = redirect_obj["redirectUrl"]

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "token": token,
                "user": user_data,
                "user_id": user.id,
                "configuration_id": user_config.id,
                "configuration": ConfigurationSerializer(user_config).data,
                "redirect": redirect_obj,
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
            from django.utils import timezone
            from authentication.services.redirect_service import get_redirect_config, get_redirect_url

            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            token = generate_jwt_token(user)
            user_data = UserProfileSerializer(user).data
            config_id = request.data.get("configuration_id") or request.data.get("config_id")
            redirect_obj = get_redirect_config(config_id, user.id)
            redirect_url = redirect_obj["redirectUrl"]

            return Response(
                {
                    "success": True,
                    "message": "OTP verified successfully. Login successful.",
                    "token": token,
                    "user": user_data,
                    "redirect": redirect_obj,
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
        config_id = request.data.get("configuration_id") or request.data.get("config_id")

        # Resolve user
        user = (
            AuthUser.objects.filter(username__iexact=identifier, is_active=True).first()
            or AuthUser.objects.filter(email__iexact=identifier.lower(), is_active=True).first()
        )

        if not user:
            return Response({"success": False, "message": "Account not found."}, status=status.HTTP_404_NOT_FOUND)

        # Enforce Password Policy Validation
        from authentication.validators import get_password_policy, validate_password_policy
        policy = get_password_policy(config_id)
        is_valid_pw, pw_errors = validate_password_policy(new_password, policy, username=user.username, email=user.email)
        if not is_valid_pw:
            err_msg = pw_errors.get("password", ["Password policy validation failed."])[0]
            return Response({"success": False, "message": err_msg, "errors": pw_errors}, status=status.HTTP_400_BAD_REQUEST)

        # Hash new password with bcrypt
        salt = bcrypt.gensalt(rounds=10)
        password_hash = bcrypt.hashpw(new_password.encode("utf-8"), salt).decode("utf-8")

        user.password = password_hash[:128]
        user.password_hash = password_hash
        user.save(update_fields=["password", "password_hash"])

        from authentication.services.redirect_service import get_redirect_config
        redirect_obj = get_redirect_config(config_id, user.id)

        return Response(
            {
                "success": True,
                "message": "Your password has been reset successfully. You can now log in with your new password.",
                "redirect": redirect_obj,
                "redirect_url": redirect_obj["redirectUrl"],
            },
            status=status.HTTP_200_OK,
        )

