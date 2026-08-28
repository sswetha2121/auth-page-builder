import re
import bcrypt
from rest_framework import serializers
from authentication.models import AuthUser


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Safe serializer for AuthUser that never exposes password hashes.
    """
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = AuthUser
        fields = ["id", "full_name", "username", "email", "mobile", "is_active", "created_at"]

    def get_created_at(self, obj):
        if hasattr(obj, "created_at") and obj.created_at:
            return obj.created_at
        return obj.date_joined


class UserRegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=True)
    username = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(max_length=254, required=True)
    password = serializers.CharField(min_length=6, write_only=True, required=True)
    mobile = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")

    def validate_username(self, value):
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if AuthUser.objects.filter(username__iexact=cleaned).exists():
            raise serializers.ValidationError("Username is already taken. Please choose another.")
        return cleaned

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if AuthUser.objects.filter(email__iexact=cleaned).exists():
            raise serializers.ValidationError("Email address is already registered. Please login.")
        return cleaned

    def create(self, validated_data):
        full_name = validated_data["full_name"].strip()
        username = validated_data["username"].strip()
        email = validated_data["email"].strip().lower()
        mobile = validated_data.get("mobile", "").strip()
        raw_password = validated_data["password"]

        # Hash password with bcrypt
        salt = bcrypt.gensalt(rounds=10)
        password_hash = bcrypt.hashpw(raw_password.encode("utf-8"), salt).decode("utf-8")

        name_parts = full_name.split()
        first_name = name_parts[0] if name_parts else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        user = AuthUser(
            full_name=full_name,
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            mobile=mobile,
            password=password_hash[:128],
            password_hash=password_hash,
            is_active=True,
            is_staff=False,
            is_superuser=False,
        )
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("identifier", "").strip()
        password = attrs.get("password", "").strip()

        if not identifier or not password:
            raise serializers.ValidationError("Both identifier and password are required.")

        # Find user by username, email, or mobile
        user = (
            AuthUser.objects.filter(username__iexact=identifier, is_active=True).first()
            or AuthUser.objects.filter(email__iexact=identifier.lower(), is_active=True).first()
            or AuthUser.objects.filter(mobile=identifier, is_active=True).first()
        )

        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check your details and try again.")

        hash_to_verify = user.password_hash or user.password
        try:
            is_valid = bcrypt.checkpw(password.encode("utf-8"), hash_to_verify.encode("utf-8"))
        except Exception:
            is_valid = False

        if not is_valid:
            raise serializers.ValidationError("Invalid credentials. Please check your password and try again.")

        attrs["user"] = user
        return attrs
