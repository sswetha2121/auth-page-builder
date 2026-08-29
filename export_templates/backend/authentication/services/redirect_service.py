"""
Redirect Service
Configuration-driven redirect URL resolver for authentication pages.
"""

def resolve_redirect_url(request_data, config=None, fallback_url="https://customerwebsite.com/dashboard"):
    if config and isinstance(config, dict):
        urls = config.get("urls", {})
        if urls.get("redirectUrl"):
            return urls["redirectUrl"]

    if request_data and isinstance(request_data, dict):
        if request_data.get("redirect_url"):
            return request_data["redirect_url"]

    return fallback_url
