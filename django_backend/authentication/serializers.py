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
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(max_length=254, required=True)
    password = serializers.CharField(min_length=1, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=1, write_only=True, required=False, allow_blank=True, default="")
    confirmPassword = serializers.CharField(min_length=1, write_only=True, required=False, allow_blank=True, default="")
    mobile = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")
    configuration_id = serializers.IntegerField(required=False, allow_null=True)
    config_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_username(self, value):
        cleaned = value.strip() if value else ""
        if not cleaned:
            raise serializers.ValidationError("Username is required.")
        if len(cleaned) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if AuthUser.objects.filter(username__iexact=cleaned).exists():
            raise serializers.ValidationError("Username already exists.")
        return cleaned

    def validate_email(self, value):
        cleaned = value.strip().lower() if value else ""
        if not cleaned:
            raise serializers.ValidationError("Email is required.")
        if AuthUser.objects.filter(email__iexact=cleaned).exists():
            raise serializers.ValidationError("Email already exists.")
        return cleaned

    def validate(self, attrs):
        from authentication.validators import get_password_policy, validate_password_policy
        config_id = attrs.get("configuration_id") or attrs.get("config_id")
        password = attrs.get("password")
        confirm_pass = attrs.get("confirm_password") or attrs.get("confirmPassword")
        username = attrs.get("username")
        email = attrs.get("email")

        if confirm_pass and password != confirm_pass:
            raise serializers.ValidationError({"confirm_password": ["Passwords do not match."]})

        policy = get_password_policy(config_id)
        is_valid, errors = validate_password_policy(password, policy, username=username, email=email)
        if not is_valid:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        from django.db import transaction
        from django.contrib.auth.hashers import make_password
        from django.utils import timezone

        first_name = validated_data.get("first_name", "").strip()
        last_name = validated_data.get("last_name", "").strip()
        full_name = validated_data.get("full_name", "").strip()

        if full_name and (not first_name or not last_name):
            name_parts = full_name.split()
            if not first_name:
                first_name = name_parts[0] if name_parts else ""
            if not last_name:
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
        elif not full_name and (first_name or last_name):
            full_name = f"{first_name} {last_name}".strip()

        username = validated_data["username"].strip()
        email = validated_data["email"].strip().lower()
        mobile = validated_data.get("mobile", "").strip() or validated_data.get("phone", "").strip()
        raw_password = validated_data["password"]

        with transaction.atomic():
            # Hash password using Django's make_password
            password_hash = make_password(raw_password)

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
                date_joined=timezone.now(),
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

        from django.contrib.auth.hashers import check_password as django_check_password

        is_valid = False
        if user.password_hash:
            try:
                is_valid = django_check_password(password, user.password_hash)
            except Exception:
                is_valid = False
        if not is_valid and user.password:
            try:
                is_valid = django_check_password(password, user.password)
            except Exception:
                is_valid = False

        if not is_valid:
            hash_str = user.password_hash or user.password
            if hash_str:
                try:
                    is_valid = bcrypt.checkpw(password.encode("utf-8"), hash_str.encode("utf-8"))
                except Exception:
                    is_valid = False

        if not is_valid:
            raise serializers.ValidationError("Invalid credentials. Please check your password and try again.")

        attrs["user"] = user
        return attrs


class SendEmailOTPSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    purpose = serializers.CharField(required=False, default="login")

    def validate_identifier(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Username or email identifier is required.")
        return cleaned


class VerifyOTPSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, min_length=4, max_length=10)
    purpose = serializers.CharField(required=False, default="login")

    def validate_identifier(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Identifier is required.")
        return cleaned

    def validate_otp(self, value):
        cleaned = value.strip()
        if not cleaned.isdigit():
            raise serializers.ValidationError("Verification code must contain digits only.")
        return cleaned


class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)

    def validate_identifier(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Username or email is required.")
        return cleaned


class PasswordResetConfirmSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, min_length=4, max_length=10)
    new_password = serializers.CharField(required=True, min_length=6, write_only=True)

    def validate_identifier(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Identifier is required.")
        return cleaned

    def validate_otp(self, value):
        cleaned = value.strip()
        if not cleaned.isdigit():
            raise serializers.ValidationError("Verification code must contain digits only.")
        return cleaned

    def validate_new_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("New password must be at least 6 characters long.")
        return value

