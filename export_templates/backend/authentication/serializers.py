from rest_framework import serializers
from authentication.models import AuthUser

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ["id", "full_name", "username", "email", "mobile", "is_active", "date_joined"]

class UserRegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(min_length=6, write_only=True)
    mobile = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")

class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    configuration_id = serializers.IntegerField(required=False, allow_null=True)
