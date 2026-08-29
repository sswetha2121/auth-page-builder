from configurations.models import AuthConfiguration

def get_redirect_url(configuration_id=None, user_id=None):
    """
    Resolve configuration-specific redirect_url for authentication requests.
    Returns redirect_url string or None if not configured.
    No hardcoded external fallback URLs.
    """
    if configuration_id:
        try:
            config_obj = AuthConfiguration.objects.filter(id=configuration_id, is_active=True).first()
            if config_obj and config_obj.redirect_url:
                return config_obj.redirect_url
        except Exception:
            pass

    if user_id:
        try:
            active_config = AuthConfiguration.objects.filter(user_id=user_id, is_active=True).order_by("-updated_at").first()
            if active_config and active_config.redirect_url:
                return active_config.redirect_url
        except Exception:
            pass

    return None
