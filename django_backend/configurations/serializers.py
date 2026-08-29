from urllib.parse import urlparse
import json
from rest_framework import serializers
from configurations.models import AuthConfiguration


def is_valid_url(url_str):
    if not url_str or not isinstance(url_str, str):
        return False
    try:
        parsed = urlparse(url_str)
        return parsed.scheme in ["http", "https"] and bool(parsed.netloc)
    except Exception:
        return False


class ConfigurationSerializer(serializers.ModelSerializer):
    """
    Serializer for AuthConfiguration records.
    """
    configuration_data = serializers.JSONField(required=True)
    builder_session_id = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = AuthConfiguration
        fields = [
            "id",
            "user_id",
            "builder_session_id",
            "configuration_name",
            "landing_url",
            "redirect_url",
            "configuration_data",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user_id", "created_at", "updated_at"]

    def validate_configuration_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Configuration name is required.")
        return cleaned

    def validate_landing_url(self, value):
        if value:
            cleaned = value.strip()
            if not is_valid_url(cleaned):
                raise serializers.ValidationError("Invalid landing URL. Must be a valid http:// or https:// URL.")
            return cleaned
        return None

    def validate_redirect_url(self, value):
        if value:
            cleaned = value.strip()
            if not is_valid_url(cleaned):
                raise serializers.ValidationError("Invalid redirect URL. Must be a valid http:// or https:// URL.")
            return cleaned
        return None

    def validate_configuration_data(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except Exception:
                raise serializers.ValidationError("Invalid JSON for configuration_data.")
        if not isinstance(value, dict):
            raise serializers.ValidationError("configuration_data must be a valid JSON object.")
        return value

    def validate(self, attrs):
        config_data = attrs.get("configuration_data") or {}
        if isinstance(config_data, dict):
            urls = config_data.get("urls") or {}
            if not attrs.get("landing_url") and urls.get("landingPageUrl"):
                attrs["landing_url"] = urls.get("landingPageUrl")
            if not attrs.get("redirect_url") and urls.get("redirectUrl"):
                attrs["redirect_url"] = urls.get("redirectUrl")
        if not attrs.get("configuration_name"):
            attrs["configuration_name"] = "My Auth Page Experience"
        return attrs
