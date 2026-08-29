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

def run_registration_tests():
    print("============================================================")
    print("RUNNING DJANGO USER REGISTRATION ACCEPTANCE SUITE")
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

    # Cleanup test users before running
    test_users = ["reg_test_user_1", "reg_test_user_dup", "reg_test_user_unique"]
    AuthUser.objects.filter(username__in=test_users).delete()
    AuthUser.objects.filter(email__in=["reg_test_1@example.com", "reg_dup@example.com", "unique_email@example.com"]).delete()

    # 1. Test Mismatched Password
    res_mismatch = client.post("/api/auth/register", {
        "username": "reg_test_user_1",
        "email": "reg_test_1@example.com",
        "password": "Password123!",
        "confirm_password": "Password999!"
    }, format="json")
    assert_test(res_mismatch.status_code == 400 and res_mismatch.data["success"] is False, "Mismatched passwords rejected (HTTP 400)")

    # 2. Test Password Policy Violation (e.g. missing number or too short)
    res_policy = client.post("/api/auth/register", {
        "username": "reg_test_user_1",
        "email": "reg_test_1@example.com",
        "password": "short",
        "confirm_password": "short"
    }, format="json")
    assert_test(res_policy.status_code == 400 and res_policy.data["success"] is False, "Password policy violation rejected (HTTP 400)")

    # 3. Test Successful User Registration
    res_success = client.post("/api/auth/register", {
        "username": "reg_test_user_1 ", # whitespace check
        "email": " REG_TEST_1@EXAMPLE.COM ", # whitespace & case normalization check
        "password": "Password123!",
        "confirm_password": "Password123!",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890"
    }, format="json")
    
    assert_test(res_success.status_code == 201, f"User registration returned HTTP 201 Created (Got {res_success.status_code})")
    assert_test(res_success.data.get("success") is True, "Response contains success: true")
    assert_test("password" not in res_success.data.get("user", {}) and "password_hash" not in res_success.data.get("user", {}), "Response NEVER contains password or password_hash")

    # 4. Verify Database Insertion & Password Hashing
    user_db = AuthUser.objects.filter(username="reg_test_user_1").first()
    assert_test(user_db is not None, "Exactly one AuthUser row created in database")
    if user_db:
        assert_test(user_db.email == "reg_test_1@example.com", "Email normalized to lowercase in database")
        assert_test(user_db.first_name == "John" and user_db.last_name == "Doe", "First name and last name saved correctly")
        assert_test(user_db.mobile == "+1234567890", "Phone/mobile saved correctly")
        
        # Check Django Hash
        is_django_hash = user_db.password_hash.startswith("pbkdf2_") or user_db.password_hash.startswith("argon2") or user_db.password_hash.startswith("bcrypt")
        assert_test(is_django_hash and user_db.password_hash != "Password123!", "Password stored as valid Django hash, NOT plain text")
        
        # Check password verification with Django check_password
        valid_pwd = check_password("Password123!", user_db.password_hash)
        assert_test(valid_pwd is True, "Django check_password verifies stored password hash successfully")

    # 5. Test Duplicate Username Rejection
    res_dup_user = client.post("/api/auth/register", {
        "username": "REG_TEST_USER_1",
        "email": "unique_email@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }, format="json")
    assert_test(res_dup_user.status_code in [400, 409] and res_dup_user.data["success"] is False, f"Duplicate username rejected with HTTP {res_dup_user.status_code}")
    assert_test("username" in res_dup_user.data.get("errors", {}) or "already exists" in res_dup_user.data.get("message", "").lower(), "Duplicate username returns structured error")

    # 6. Test Duplicate Email Rejection
    res_dup_email = client.post("/api/auth/register", {
        "username": "reg_test_user_unique",
        "email": "reg_test_1@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }, format="json")
    assert_test(res_dup_email.status_code in [400, 409] and res_dup_email.data["success"] is False, f"Duplicate email rejected with HTTP {res_dup_email.status_code}")
    assert_test("email" in res_dup_email.data.get("errors", {}) or "already exists" in res_dup_email.data.get("message", "").lower(), "Duplicate email returns structured error")

    # 7. Test Login with Newly Registered User Credentials
    res_login = client.post("/api/auth/login", {
        "identifier": "reg_test_user_1",
        "password": "Password123!"
    }, format="json")
    assert_test(res_login.status_code == 200 and res_login.data.get("success") is True, "Newly registered user can log in successfully (HTTP 200)")

    # Clean up test users
    AuthUser.objects.filter(username__in=test_users).delete()
    AuthUser.objects.filter(email__in=["reg_test_1@example.com", "reg_dup@example.com", "unique_email@example.com"]).delete()

    print("\n============================================================")
    print(f"REGISTRATION SUITE: PASSED {passed}/{passed + failed}")
    print("============================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_registration_tests()
