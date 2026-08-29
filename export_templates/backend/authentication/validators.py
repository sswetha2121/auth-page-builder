import re

def validate_password_policy(password, policy=None):
    if not policy:
        policy = {}
    
    min_len = int(policy.get("minLength", 6))
    if len(password) < min_len:
        return False, f"Password must be at least {min_len} characters long."

    if policy.get("requireUppercase") and not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."

    if policy.get("requireLowercase") and not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."

    if policy.get("requireNumbers") and not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number."

    if policy.get("requireSpecialChars"):
        min_special = int(policy.get("minSpecialChars", 1))
        specials = re.findall(r"[^A-Za-z0-9]", password)
        if len(specials) < min_special:
            return False, f"Password must contain at least {min_special} special character(s)."

    return True, "Password is valid."
