import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ["DJANGO_SETTINGS_MODULE"] = "auth_page_builder_backend.settings"
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.hashers import check_password
from authentication.models import AuthUser
from authentication.validators import (
    normalize_password_policy,
    validate_password_against_policy,
    get_active_password_policy
)

def run_password_policy_tests():
    print("============================================================")
    print("RUNNING DJANGO PASSWORD POLICY ACCEPTANCE SUITE")
    print("============================================================\n")

    client = APIClient()
    passed = 0
    failed = 0

    def assert_test(condition, message):
        nonlocal passed, failed
        if condition:
            print(f"  [PASS] {message}")
            passed += 1
        else:
            print(f"  [FAIL] {message}")
            failed += 1

    # 1. Test Legacy Field Normalization
    legacy_policy = {
        "min_length": 10,
        "max_length": 32,
        "requireUpper": True,
        "requireLower": True,
        "requireNumbers": True,
        "requireSpecialChars": True,
        "min_special_chars": 2,
        "allowedSpecialCharacters": "@#$",
        "preventUsername": True,
        "preventEmail": True
    }
    norm = normalize_password_policy(legacy_policy)
    assert_test(norm["minLength"] == 10, "Legacy min_length normalized to minLength: 10")
    assert_test(norm["maxLength"] == 32, "Legacy max_length normalized to maxLength: 32")
    assert_test(norm["requireNumber"] is True, "Legacy requireNumbers normalized to requireNumber: True")
    assert_test(norm["requireSpecialChar"] is True, "Legacy requireSpecialChars normalized to requireSpecialChar: True")
    assert_test(norm["minSpecialChars"] == 2, "Legacy min_special_chars normalized to minSpecialChars: 2")
    assert_test(norm["allowedSpecialChars"] == "@#$", "Legacy allowedSpecialCharacters normalized to allowedSpecialChars: '@#$'")
    assert_test(norm["preventUsernameInPassword"] is True, "Legacy preventUsername normalized to preventUsernameInPassword: True")
    assert_test(norm["preventEmailInPassword"] is True, "Legacy preventEmail normalized to preventEmailInPassword: True")

    # 2. Test Minimum & Maximum Length
    policy_len = {"minLength": 8, "maxLength": 16, "requireUppercase": False, "requireLowercase": False, "requireNumber": False, "requireSpecialChar": False}
    valid, errs = validate_password_against_policy("Short1", policy_len)
    assert_test(not valid and "Password must contain at least 8 characters." in errs["password"], "Password below minLength rejected")

    valid_eq_min, _ = validate_password_against_policy("Pass1234", policy_len)
    assert_test(valid_eq_min, "Password equal to minLength accepted")

    valid_over_max, errs = validate_password_against_policy("VeryLongPasswordExceeding16Chars", policy_len)
    assert_test(not valid_over_max and "Password must not exceed 16 characters." in errs["password"], "Password above maxLength rejected")

    valid_eq_max, _ = validate_password_against_policy("Exact16CharPass!", policy_len)
    assert_test(valid_eq_max, "Password equal to maxLength accepted")

    # 3. Test Character Requirements (Uppercase, Lowercase, Number, Special)
    policy_strict = {
        "minLength": 6,
        "requireUppercase": True,
        "requireLowercase": True,
        "requireNumber": True,
        "requireSpecialChar": True,
        "minSpecialChars": 1
    }
    
    # Missing uppercase
    v1, e1 = validate_password_against_policy("password123!", policy_strict)
    assert_test(not v1 and "Password must contain at least one uppercase letter." in e1["password"], "Missing uppercase letter rejected")

    # Missing lowercase
    v2, e2 = validate_password_against_policy("PASSWORD123!", policy_strict)
    assert_test(not v2 and "Password must contain at least one lowercase letter." in e2["password"], "Missing lowercase letter rejected")

    # Missing number
    v3, e3 = validate_password_against_policy("PasswordSpecial!", policy_strict)
    assert_test(not v3 and "Password must contain at least one number." in e3["password"], "Missing number rejected")

    # Missing special char
    v4, e4 = validate_password_against_policy("Password1234", policy_strict)
    assert_test(not v4 and "Password must contain at least 1 special character." in e4["password"], "Missing special character rejected")

    # 4. Test Multiple Special Characters
    policy_2spec = {
        "minLength": 6,
        "requireSpecialChar": True,
        "minSpecialChars": 2,
        "requireUppercase": False, "requireLowercase": False, "requireNumber": False
    }
    
    v_1spec, e_1spec = validate_password_against_policy("Password123!", policy_2spec)
    assert_test(not v_1spec and "Password must contain at least 2 special characters." in e_1spec["password"], "minSpecialChars=2 with 1 special char fails")

    v_2spec, _ = validate_password_against_policy("Password123!@", policy_2spec)
    assert_test(v_2spec, "minSpecialChars=2 with 2 special chars passes")

    v_3spec, _ = validate_password_against_policy("Password123!@#", policy_2spec)
    assert_test(v_3spec, "minSpecialChars=2 with 3 special chars passes")

    # 5. Test Allowed Special Characters
    policy_allowed = {
        "minLength": 6,
        "requireSpecialChar": True,
        "minSpecialChars": 1,
        "allowedSpecialChars": "@#$",
        "requireUppercase": False, "requireLowercase": False, "requireNumber": False
    }
    
    v_at, _ = validate_password_against_policy("Password123@", policy_allowed)
    assert_test(v_at, "Allowed special character '@' accepted")

    v_hash, _ = validate_password_against_policy("Password123#", policy_allowed)
    assert_test(v_hash, "Allowed special character '#' accepted")

    v_dollar, _ = validate_password_against_policy("Password123$", policy_allowed)
    assert_test(v_dollar, "Allowed special character '$' accepted")

    v_percent, e_percent = validate_password_against_policy("Password123%", policy_allowed)
    assert_test(not v_percent and "Password contains disallowed special characters. Allowed: @#$" in e_percent["password"], "Disallowed special character '%' rejected")

    # 6. Test Username Prevention in Password
    policy_user = {
        "minLength": 6,
        "preventUsernameInPassword": True,
        "requireUppercase": False, "requireLowercase": False, "requireNumber": False, "requireSpecialChar": False
    }
    v_user, e_user = validate_password_against_policy("SwethaSecret123!", policy_user, username="SWETHA")
    assert_test(not v_user and "Password must not contain your username." in e_user["password"], "Case-insensitive username in password rejected")

    v_clean_user, _ = validate_password_against_policy("CleanSecret123!", policy_user, username="SWETHA")
    assert_test(v_clean_user, "Password without username accepted")

    # 7. Test Email Prevention in Password
    policy_email = {
        "minLength": 6,
        "preventEmailInPassword": True,
        "requireUppercase": False, "requireLowercase": False, "requireNumber": False, "requireSpecialChar": False
    }
    v_email, e_email = validate_password_against_policy("SwethaSecret123!", policy_email, email="SWETHA@EXAMPLE.COM")
    assert_test(not v_email and "Password must not contain your email." in e_email["password"], "Case-insensitive email username in password rejected")

    # 8. Test Multiple Errors Returned Together
    v_multi, e_multi = validate_password_against_policy("abc", {
        "minLength": 8,
        "requireUppercase": True,
        "requireNumber": True,
        "requireSpecialChar": True
    })
    assert_test(not v_multi and len(e_multi["password"]) >= 4, "Multiple password policy errors collected and returned together")

    # 9. Test Registration Integration
    AuthUser.objects.filter(username="pol_test_user").delete()
    
    # Invalid password -> no user created
    res_bad = client.post("/api/auth/register", {
        "username": "pol_test_user",
        "email": "pol_test@example.com",
        "password": "abc",
        "confirm_password": "abc"
    }, format="json")
    assert_test(res_bad.status_code == 400 and not AuthUser.objects.filter(username="pol_test_user").exists(), "Registration with invalid password creates NO database record")

    # Valid password -> user created with Django hash
    res_good = client.post("/api/auth/register", {
        "username": "pol_test_user",
        "email": "pol_test@example.com",
        "password": "ValidPassword123!",
        "confirm_password": "ValidPassword123!"
    }, format="json")
    assert_test(res_good.status_code == 201, "Registration with valid password succeeds (HTTP 201)")

    db_user = AuthUser.objects.filter(username="pol_test_user").first()
    assert_test(db_user is not None and check_password("ValidPassword123!", db_user.password_hash), "User saved in database with valid Django password hash")

    # Clean up
    AuthUser.objects.filter(username="pol_test_user").delete()

    print("\n============================================================")
    print(f"PASSWORD POLICY SUITE: PASSED {passed}/{passed + failed}")
    print("============================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_password_policy_tests()
