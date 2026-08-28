from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from configurations.models import AuthConfiguration
from authentication.serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
)
from authentication.auth import generate_jwt_token


class RegisterView(APIView):
    """
    Register a new user account.
    POST /api/auth/register
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            # Format first validation error message cleanly
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
    POST /api/auth/login
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


class MeView(APIView):
    """
    Get current logged in user's profile.
    GET /api/auth/me
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user:
            return Response({"success": False, "message": "User not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = UserProfileSerializer(user).data
        return Response({"success": True, "user": user_data}, status=status.HTTP_200_OK)
