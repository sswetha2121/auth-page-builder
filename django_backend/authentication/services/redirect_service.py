from configurations.models import AuthConfiguration

DANGEROUS_SCHEMES = ["javascript:", "data:", "vbscript:", "file:"]

def validate_redirect_url(url_input):
    """
    Validate redirect URL.
    Returns (is_valid, sanitized_url_or_error_msg).
    """
    if not url_input or not isinstance(url_input, str):
        return False, "Please enter a valid HTTP(S) URL or relative path."
    
    clean_url = url_input.strip()
    lower_url = clean_url.lower()

    for scheme in DANGEROUS_SCHEMES:
        if lower_url.startswith(scheme):
            return False, "Please enter a valid HTTP(S) URL or relative path."

    if lower_url.startswith("http://") or lower_url.startswith("https://") or clean_url.startswith("/"):
        return True, clean_url

    # Relative path without leading slash
    if not ":" in clean_url:
        return True, clean_url

    return False, "Please enter a valid HTTP(S) URL or relative path."

def get_redirect_config(configuration_id=None, user_id=None):
    """
    Resolve configuration-specific redirect configuration dictionary.
    """
    config_obj = None

    if configuration_id:
        try:
            config_obj = AuthConfiguration.objects.filter(id=configuration_id, is_active=True).first()
        except Exception:
            pass

    if not config_obj and user_id:
        try:
            config_obj = AuthConfiguration.objects.filter(user_id=user_id, is_active=True).order_by("-updated_at").first()
        except Exception:
            pass

    default_redirect = {
        "enabled": True,
        "redirectUrl": "/dashboard",
        "redirectType": "url",
        "openInNewTab": False,
        "showSuccessMessage": True,
        "successMessage": "Authentication completed successfully.",
        "delay": 0
    }

    if not config_obj:
        return default_redirect

    data = config_obj.configuration_data or {}
    redirect_dict = data.get("redirect") if isinstance(data, dict) and isinstance(data.get("redirect"), dict) else {}

    raw_url = redirect_dict.get("redirectUrl") or config_obj.redirect_url or data.get("urls", {}).get("redirectUrl") or "/dashboard"
    is_valid, clean_url = validate_redirect_url(raw_url)
    if not is_valid:
        clean_url = "/dashboard"

    res = {
        "enabled": redirect_dict.get("enabled", True),
        "redirectUrl": clean_url,
        "redirectType": redirect_dict.get("redirectType", "url"),
        "openInNewTab": redirect_dict.get("openInNewTab", False),
        "showSuccessMessage": redirect_dict.get("showSuccessMessage", True),
        "successMessage": redirect_dict.get("successMessage", "Authentication completed successfully."),
        "delay": redirect_dict.get("delay", 0)
    }
    return res

def get_redirect_url(configuration_id=None, user_id=None):
    """
    Resolve configuration-specific redirect_url string.
    """
    config = get_redirect_config(configuration_id=configuration_id, user_id=user_id)
    return config["redirectUrl"] if config.get("enabled") else None
