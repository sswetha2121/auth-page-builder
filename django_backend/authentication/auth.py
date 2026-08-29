import os
import datetime
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from authentication.models import AuthUser

JWT_SECRET = os.getenv("JWT_SECRET", "auth_page_builder_super_secure_jwt_secret_key_2026_99x")


def generate_jwt_token(user):
    """
    Generate a 7-day signed JWT token for an AuthUser instance.
    """
    payload = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication class for Django REST Framework.
    Extracts Bearer token from `Authorization` header.
    If header format, token decoding, or user lookup fails, returns None so AllowAny views can proceed.
    """
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = payload.get("id")
            if not user_id:
                return None
            user = AuthUser.objects.get(id=user_id, is_active=True)
            return (user, token)
        except Exception:
            return None
