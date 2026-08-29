import re
from configurations.models import AuthConfiguration

CANONICAL_DEFAULT_PASSWORD_POLICY = {
    "minLength": 8,
    "maxLength": 64,
    "requireUppercase": True,
    "requireLowercase": True,
    "requireNumber": True,
    "requireSpecialChar": True,
    "minSpecialChars": 1,
    "allowedSpecialChars": "",
    "preventUsernameInPassword": False,
    "preventEmailInPassword": False
}

def normalize_password_policy(policy=None):
    """
    Normalize any password policy dict (legacy or current) into canonical format:
    minLength, maxLength, requireUppercase, requireLowercase, requireNumber,
    requireSpecialChar, minSpecialChars, allowedSpecialChars,
    preventUsernameInPassword, preventEmailInPassword.
    """
    if not isinstance(policy, dict):
        return dict(CANONICAL_DEFAULT_PASSWORD_POLICY)

    min_len = policy.get("minLength") if policy.get("minLength") is not None else policy.get("min_length")
    max_len = policy.get("maxLength") if policy.get("maxLength") is not None else policy.get("max_length")

    req_upper = policy.get("requireUppercase") if policy.get("requireUppercase") is not None else policy.get("requireUpper")
    req_lower = policy.get("requireLowercase") if policy.get("requireLowercase") is not None else policy.get("requireLower")

    req_num = policy.get("requireNumber") if policy.get("requireNumber") is not None else policy.get("requireNumbers")
    req_spec = policy.get("requireSpecialChar") if policy.get("requireSpecialChar") is not None else (
        policy.get("requireSpecialChars") if policy.get("requireSpecialChars") is not None else policy.get("requireSpecialCharacter")
    )
    min_spec = policy.get("minSpecialChars") if policy.get("minSpecialChars") is not None else (
        policy.get("min_special_chars") if policy.get("min_special_chars") is not None else policy.get("minSpecialCharacter")
    )
    allowed_spec = policy.get("allowedSpecialChars") if policy.get("allowedSpecialChars") is not None else policy.get("allowedSpecialCharacters")

    prev_user = policy.get("preventUsernameInPassword") if policy.get("preventUsernameInPassword") is not None else policy.get("preventUsername")
    prev_email = policy.get("preventEmailInPassword") if policy.get("preventEmailInPassword") is not None else policy.get("preventEmail")

    return {
        "minLength": int(min_len) if min_len is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["minLength"],
        "maxLength": int(max_len) if max_len is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["maxLength"],
        "requireUppercase": bool(req_upper) if req_upper is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["requireUppercase"],
        "requireLowercase": bool(req_lower) if req_lower is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["requireLowercase"],
        "requireNumber": bool(req_num) if req_num is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["requireNumber"],
        "requireSpecialChar": bool(req_spec) if req_spec is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["requireSpecialChar"],
        "minSpecialChars": int(min_spec) if min_spec is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["minSpecialChars"],
        "allowedSpecialChars": str(allowed_spec) if allowed_spec is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["allowedSpecialChars"],
        "preventUsernameInPassword": bool(prev_user) if prev_user is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["preventUsernameInPassword"],
        "preventEmailInPassword": bool(prev_email) if prev_email is not None else CANONICAL_DEFAULT_PASSWORD_POLICY["preventEmailInPassword"],
    }

def get_active_password_policy(user=None, configuration_id=None):
    """
    Retrieve and normalize active password policy configuration dictionary for a given configuration_id.
    """
    policy_dict = None
    if configuration_id:
        try:
            config_query = AuthConfiguration.objects.filter(id=configuration_id, is_active=True)
            if user and hasattr(user, "id"):
                user_specific = config_query.filter(user_id=user.id).first()
                if user_specific:
                    config_query = AuthConfiguration.objects.filter(id=user_specific.id)
            config_obj = config_query.first()
            if config_obj and config_obj.configuration_data and isinstance(config_obj.configuration_data, dict):
                policy_dict = config_obj.configuration_data.get("passwordPolicy") or config_obj.configuration_data.get("password_policy")
        except Exception:
            pass

    return normalize_password_policy(policy_dict)

# Backward-compatible alias
get_password_policy = get_active_password_policy

def validate_password_against_policy(password, policy=None, username=None, email=None):
    """
    Validate a password against a canonical or legacy password policy dictionary.
    Collects all validation errors into a list under the 'password' key.
    Returns (is_valid: bool, errors: dict).
    """
    norm_policy = normalize_password_policy(policy)
    errors = []

    if not password:
        return False, {"password": ["Password is required."]}

    min_len = norm_policy["minLength"]
    max_len = norm_policy["maxLength"]

    if len(password) < min_len:
        errors.append(f"Password must contain at least {min_len} characters.")

    if len(password) > max_len:
        errors.append(f"Password must not exceed {max_len} characters.")

    if norm_policy["requireUppercase"] and not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")

    if norm_policy["requireLowercase"] and not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter.")

    if norm_policy["requireNumber"] and not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one number.")

    if norm_policy["requireSpecialChar"]:
        min_special = norm_policy["minSpecialChars"]
        allowed_specials = norm_policy["allowedSpecialChars"]

        all_specials = re.findall(r"[^A-Za-z0-9]", password)

        if allowed_specials:
            disallowed = [c for c in all_specials if c not in allowed_specials]
            if disallowed:
                errors.append(f"Password contains disallowed special characters. Allowed: {allowed_specials}")
            valid_specials = [c for c in all_specials if c in allowed_specials]
        else:
            valid_specials = all_specials

        if len(valid_specials) < min_special:
            spec_word = "special character" if min_special == 1 else "special characters"
            errors.append(f"Password must contain at least {min_special} {spec_word}.")

    if norm_policy["preventUsernameInPassword"] and username:
        clean_user = str(username).strip().lower()
        if len(clean_user) >= 3 and clean_user in password.lower():
            errors.append("Password must not contain your username.")

    if norm_policy["preventEmailInPassword"] and email:
        clean_email = str(email).strip().lower()
        email_prefix = clean_email.split("@")[0].strip()
        if (len(clean_email) >= 3 and clean_email in password.lower()) or (len(email_prefix) >= 3 and email_prefix in password.lower()):
            errors.append("Password must not contain your email.")

    if errors:
        return False, {"password": errors}

    return True, {}

# Backward-compatible alias
validate_password_policy = validate_password_against_policy
