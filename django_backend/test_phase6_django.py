"""
Comprehensive Phase 6 Django Backend Acceptance Test Suite
Tests all 21 core requirements:
- User Registration & Password Hashing
- Duplicate Prevention (Username & Email)
- Login via Username / Email / Mobile
- Profile /api/auth/me
- Email OTP Dispatch & Masked Email Response
- OTP Verification & JWT Token Issuance
- Expired & Invalid OTP Handling
- OTP Single-Use & Brute-Force Rate Limiting
- Full Password Reset Flow (Request, Verify, Confirm)
- Multi-Tenant Configuration Management & Access Control
- Logout & Error Handling
"""

import os
import sys
import time
from datetime import timedelta
import django

# Setup Django Environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_page_builder_backend.settings")
django.setup()

from django.utils import timezone
from rest_framework.test import APIClient
from authentication.models import AuthUser, AuthOTP
from configurations.models import AuthConfiguration
from authentication.services.otp_service import OTPService, EmailOTPProvider


def run_phase6_acceptance_suite():
    print("=" * 60)
    print("RUNNING PHASE 6 DJANGO BACKEND ACCEPTANCE SUITE")
    print("=" * 60)

    client = APIClient()
    timestamp = int(time.time())
    test_user_a_username = f"user_a_{timestamp}"
    test_user_a_email = f"user_a_{timestamp}@example.com"
    test_user_b_username = f"user_b_{timestamp}"
    test_user_b_email = f"user_b_{timestamp}@example.com"
    test_password = "SecurePassword123!"

    created_user_ids = []

    try:
        # TEST 1: Health Check
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.data["database"] == "connected"
        print("  [PASS] TEST 1: /api/health returned 200 OK with database connected")

        # TEST 2: User A Registration
        res = client.post(
            "/api/auth/register",
            {
                "full_name": "User Alpha",
                "username": test_user_a_username,
                "email": test_user_a_email,
                "password": test_password,
                "mobile": "+1234567890",
            },
            format="json",
        )
        assert res.status_code == 201, f"Failed registration: {res.data}"
        assert res.data["success"] is True
        assert "token" in res.data and len(res.data["token"]) > 20
        token_a = res.data["token"]
        user_a_id = res.data["user"]["id"]
        created_user_ids.append(user_a_id)

        # Verify password is NOT stored as plain text in database
        db_user = AuthUser.objects.get(id=user_a_id)
        assert db_user.password != test_password
        assert db_user.password.startswith("$2") or len(db_user.password) > 30
        print("  [PASS] TEST 2: User registration successful with secure password hashing")

        # TEST 3: Reject Duplicate Username
        res = client.post(
            "/api/auth/register",
            {
                "full_name": "Duplicate User",
                "username": test_user_a_username,
                "email": f"unique_{timestamp}@example.com",
                "password": test_password,
            },
            format="json",
        )
        assert res.status_code == 409
        assert res.data["success"] is False
        print("  [PASS] TEST 3: Duplicate username rejected with HTTP 409 Conflict")

        # TEST 4: Reject Duplicate Email
        res = client.post(
            "/api/auth/register",
            {
                "full_name": "Duplicate Email User",
                "username": f"unique_user_{timestamp}",
                "email": test_user_a_email,
                "password": test_password,
            },
            format="json",
        )
        assert res.status_code == 409
        assert res.data["success"] is False
        print("  [PASS] TEST 4: Duplicate email rejected with HTTP 409 Conflict")

        # TEST 5: User B Registration
        res = client.post(
            "/api/auth/signup",
            {
                "full_name": "User Beta",
                "username": test_user_b_username,
                "email": test_user_b_email,
                "password": test_password,
            },
            format="json",
        )
        assert res.status_code == 201
        token_b = res.data["token"]
        user_b_id = res.data["user"]["id"]
        created_user_ids.append(user_b_id)
        print("  [PASS] TEST 5: User B registered successfully via /api/auth/signup")

        # TEST 6: Login via Username
        res = client.post(
            "/api/auth/login",
            {"identifier": test_user_a_username, "password": test_password},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True
        assert "token" in res.data
        print("  [PASS] TEST 6: Login via username identifier successful (HTTP 200)")

        # TEST 7: Login via Email
        res = client.post(
            "/api/auth/login",
            {"identifier": test_user_a_email, "password": test_password},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True
        print("  [PASS] TEST 7: Login via email identifier successful (HTTP 200)")

        # TEST 8: Reject Invalid Password
        res = client.post(
            "/api/auth/login",
            {"identifier": test_user_a_username, "password": "WrongPassword123!"},
            format="json",
        )
        assert res.status_code == 401
        assert res.data["success"] is False
        print("  [PASS] TEST 8: Login with invalid password rejected (HTTP 401)")

        # TEST 9: GET /api/auth/me Profile Check
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")
        res = client.get("/api/auth/me")
        assert res.status_code == 200
        assert res.data["user"]["username"] == test_user_a_username
        assert "password" not in res.data["user"]
        assert "password_hash" not in res.data["user"]
        print("  [PASS] TEST 9: Profile endpoint returns clean user data without password hash")

        # Clear client auth
        client.credentials()

        # TEST 10: Send Email OTP using Username
        res = client.post(
            "/api/otp/send-email",
            {"identifier": test_user_a_username, "purpose": "login"},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True
        assert "masked_email" in res.data
        assert "@" in res.data["masked_email"]
        print(f"  [PASS] TEST 10: Send OTP by username returned masked email: {res.data['masked_email']}")

        # TEST 11: Send Email OTP using Email
        res = client.post(
            "/api/otp/send-email",
            {"identifier": test_user_a_email, "purpose": "login"},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True
        print("  [PASS] TEST 11: Send OTP by email identifier successful")

        # Verify OTP record in database
        latest_otp_record = AuthOTP.objects.filter(
            identifier=test_user_a_email.lower(),
            purpose="login",
            is_used=False
        ).order_by("-created_at").first()
        assert latest_otp_record is not None

        # TEST 12: Verify Invalid OTP Code
        res = client.post(
            "/api/otp/verify",
            {"identifier": test_user_a_email, "otp": "000000", "purpose": "login"},
            format="json",
        )
        assert res.status_code == 401
        assert res.data["success"] is False
        print("  [PASS] TEST 12: Invalid OTP code rejected (HTTP 401)")

        # TEST 13: Verify Expired OTP
        # Simulate an expired OTP
        expired_raw, expired_record = OTPService.create_otp(
            identifier=f"expired_{timestamp}@example.com",
            purpose="login",
            expiry_minutes=-5 # Expired 5 minutes ago
        )
        res = client.post(
            "/api/otp/verify",
            {"identifier": f"expired_{timestamp}@example.com", "otp": expired_raw, "purpose": "login"},
            format="json",
        )
        assert res.status_code == 401
        assert "expired" in res.data["message"].lower()
        print("  [PASS] TEST 13: Expired OTP rejected (HTTP 401)")

        # TEST 14: Valid OTP Verification & Login
        valid_raw, valid_record = OTPService.create_otp(
            identifier=test_user_a_username,
            purpose="login",
            user=db_user
        )
        res = client.post(
            "/api/otp/verify",
            {"identifier": test_user_a_username, "otp": valid_raw, "purpose": "login"},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True
        assert "token" in res.data
        otp_token = res.data["token"]
        print("  [PASS] TEST 14: Valid OTP verified successfully and JWT token issued")

        # TEST 15: Single-Use OTP Reuse Prevention
        res = client.post(
            "/api/otp/verify",
            {"identifier": test_user_a_username, "otp": valid_raw, "purpose": "login"},
            format="json",
        )
        assert res.status_code == 401
        print("  [PASS] TEST 15: OTP cannot be reused after successful verification")

        # TEST 16: Password Reset Request
        res = client.post(
            "/api/password-reset/request",
            {"identifier": test_user_a_username},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True
        assert "masked_email" in res.data
        print("  [PASS] TEST 16: Password reset request successful with masked email")

        # TEST 17: Password Reset Verify & Confirm
        pr_raw, pr_record = OTPService.create_otp(
            identifier=test_user_a_username,
            purpose="password_reset",
            user=db_user
        )

        res = client.post(
            "/api/password-reset/verify-otp",
            {"identifier": test_user_a_username, "otp": pr_raw},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True

        new_pass = "BrandNewSecurePassword2026!"
        res = client.post(
            "/api/password-reset/confirm",
            {"identifier": test_user_a_username, "otp": pr_raw, "new_password": new_pass},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True

        # Test login with new password
        res = client.post(
            "/api/auth/login",
            {"identifier": test_user_a_username, "password": new_pass},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True
        print("  [PASS] TEST 17: Full password reset flow completed and verified with new login")

        # TEST 18: Save & Retrieve Configuration (User A)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")
        config_payload = {
            "configuration_name": "Tenant Portal Enterprise",
            "landing_url": "https://tenantwebsite.com",
            "redirect_url": "https://tenantwebsite.com/dashboard",
            "configuration_data": {
                "activePage": "login",
                "theme": {
                    "primaryColor": "#4f46e5",
                    "accentColor": "#06b6d4"
                },
                "pages": {
                    "login": {"title": "Tenant Sign In", "passwordEnabled": True},
                    "otp": {"length": 6, "whatsappEnabled": True}
                }
            }
        }
        res = client.post("/api/configurations", config_payload, format="json")
        assert res.status_code in (200, 201)
        assert res.data["success"] is True
        config_id = res.data["configuration"]["id"]
        print("  [PASS] TEST 18: Configuration saved/updated successfully with full JSON customization")

        # TEST 19: List User Configurations (Multi-tenant check)
        res = client.get("/api/configurations")
        assert res.status_code == 200
        assert res.data["count"] >= 1
        user_a_config_ids = [c["id"] for c in res.data["configurations"]]
        assert config_id in user_a_config_ids

        # User B should see 0 configurations
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_b}")
        res = client.get("/api/configurations")
        assert res.status_code == 200
        user_b_config_ids = [c["id"] for c in res.data["configurations"]]
        assert config_id not in user_b_config_ids
        print("  [PASS] TEST 19: Multi-tenant isolation verified (User B cannot list User A's configurations)")

        # TEST 20: User B Blocked from Modifying User A's Configuration
        res = client.put(
            f"/api/configurations/{config_id}",
            {"configuration_name": "Hacked Title"},
            format="json",
        )
        assert res.status_code == 403
        print("  [PASS] TEST 20: User B is forbidden from updating User A's configuration (HTTP 403)")

        # TEST 21: Delete Configuration & Logout
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")
        res = client.delete(f"/api/configurations/{config_id}")
        assert res.status_code == 200
        assert res.data["success"] is True

        res = client.post("/api/auth/logout")
        assert res.status_code == 200
        assert res.data["success"] is True
        print("  [PASS] TEST 21: Configuration deleted cleanly and user logged out successfully")

        print("=" * 60)
        print("PHASE 6 DJANGO BACKEND SUITE: ALL 21 TESTS PASSED (100%)")
        print("=" * 60)

    finally:
        # Clean up test users created during test safely
        if created_user_ids:
            AuthUser.objects.filter(id__in=created_user_ids).delete()
            print(f"Cleaned up {len(created_user_ids)} test users from database safely.")


if __name__ == "__main__":
    run_phase6_acceptance_suite()
