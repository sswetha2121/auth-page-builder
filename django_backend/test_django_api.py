"""
Automated Test Suite for Django Backend Endpoints
Tests: Registration, Login (Username, Email, Mobile), Profile,
       Configuration CRUD, Ownership Security, Validation & Health
"""

import os
import sys
import time
from pathlib import Path

# Setup Django environment
sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_page_builder_backend.settings")

import django
django.setup()

from authentication.models import AuthUser
from configurations.models import AuthConfiguration

# Clean previous test records safely
AuthUser.objects.filter(username__in=["testuser1", "testuser2"]).delete()
AuthConfiguration.objects.filter(configuration_name__in=["Integration Config", "Updated Config"]).delete()
from rest_framework.test import APIClient
from authentication.models import AuthUser
from configurations.models import AuthConfiguration


def run_tests():
    print("=" * 60)
    print("RUNNING DJANGO REST FRAMEWORK BACKEND ACCEPTANCE SUITE")
    print("=" * 60)

    client = APIClient()
    timestamp = int(time.time())

    user_a_data = {
        "full_name": "Alice Wonderland",
        "username": f"alice_{timestamp}",
        "email": f"alice_{timestamp}@example.com",
        "mobile": f"+1 555-01{str(timestamp)[-2:]}",
        "password": "SecurePassword123!",
    }

    user_b_data = {
        "full_name": "Bob Builder",
        "username": f"bob_{timestamp}",
        "email": f"bob_{timestamp}@example.com",
        "mobile": f"+1 555-02{str(timestamp)[-2:]}",
        "password": "BobPassword456!",
    }

    created_user_ids = []

    try:
        # TEST 1: Health Check
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.status_code}"
        assert res.data["status"] == "ok", "Health check status not ok"
        assert res.data["database"] == "connected", "Database not connected"
        print("  [PASS] TEST 1: /api/health returned 200 OK with database: connected")

        # TEST 2: Register User A
        res = client.post("/api/auth/register", user_a_data, format="json")
        assert res.status_code == 201, f"Registration failed: {res.data}"
        assert "token" in res.data, "Token missing in registration"
        assert res.data["user"]["username"] == user_a_data["username"], "Username mismatch"
        token_a = res.data["token"]
        user_a_id = res.data["user"]["id"]
        created_user_ids.append(user_a_id)
        print("  [PASS] TEST 2: User A registered successfully (HTTP 201) with JWT")

        # TEST 3: Duplicate username registration rejected
        res = client.post("/api/auth/register", user_a_data, format="json")
        assert res.status_code in [400, 409], f"Expected 400/409 on duplicate username, got {res.status_code}"
        print("  [PASS] TEST 3: Duplicate username registration rejected")

        # TEST 4: Register User B
        res = client.post("/api/auth/register", user_b_data, format="json")
        assert res.status_code == 201, f"Registration failed for User B: {res.data}"
        token_b = res.data["token"]
        user_b_id = res.data["user"]["id"]
        created_user_ids.append(user_b_id)
        print("  [PASS] TEST 4: User B registered successfully (HTTP 201)")

        # TEST 5: Login using username
        res = client.post("/api/auth/login", {"identifier": user_a_data["username"], "password": user_a_data["password"]}, format="json")
        assert res.status_code == 200, f"Login via username failed: {res.data}"
        assert "token" in res.data, "Token missing in login"
        print("  [PASS] TEST 5: Login via username identifier successful (HTTP 200)")

        # TEST 6: Login using email
        res = client.post("/api/auth/login", {"identifier": user_a_data["email"], "password": user_a_data["password"]}, format="json")
        assert res.status_code == 200, f"Login via email failed: {res.data}"
        print("  [PASS] TEST 6: Login via email identifier successful (HTTP 200)")

        # TEST 7: Login using mobile
        res = client.post("/api/auth/login", {"identifier": user_a_data["mobile"], "password": user_a_data["password"]}, format="json")
        assert res.status_code == 200, f"Login via mobile failed: {res.data}"
        print("  [PASS] TEST 7: Login via mobile number identifier successful (HTTP 200)")

        # TEST 8: Login with invalid password rejected
        res = client.post("/api/auth/login", {"identifier": user_a_data["username"], "password": "WrongPassword!"}, format="json")
        assert res.status_code == 401, f"Expected 401 on wrong password, got {res.status_code}"
        print("  [PASS] TEST 8: Login with invalid password rejected (HTTP 401)")

        # TEST 9: Profile endpoint /api/auth/me
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")
        res = client.get("/api/auth/me")
        assert res.status_code == 200, f"Profile fetch failed: {res.data}"
        assert res.data["user"]["email"] == user_a_data["email"], "Profile email mismatch"
        assert "password" not in res.data["user"] and "password_hash" not in res.data["user"], "Password leaked in profile"
        print("  [PASS] TEST 9: GET /api/auth/me returns profile without leaking password hash")

        # TEST 10: Create Configuration for User A
        config_payload = {
            "configuration_name": f"Django Prod Template {timestamp}",
            "landing_url": "https://companyportal.com",
            "redirect_url": "https://companyportal.com/dashboard",
            "configuration_data": {
                "branding": {"brandName": "Enterprise Cloud", "logoShape": "circle"},
                "layout": {"type": "split-right-image", "imageWidth": 55},
                "pages": {
                    "login": {"title": "Welcome Back to Cloud"},
                    "otp": {"length": 6, "style": "rounded", "whatsappEnabled": True}
                }
            }
        }
        res = client.post("/api/configurations", config_payload, format="json")
        assert res.status_code in (200, 201), f"Configuration creation failed: {res.data}"
        config_a_id = res.data["configuration"]["id"]
        assert res.data["configuration"]["configuration_name"] == config_payload["configuration_name"]
        assert res.data["configuration"]["configuration_data"]["pages"]["otp"]["length"] == 6
        print("  [PASS] TEST 10: Configuration saved/updated successfully (HTTP 200/201) with full JSON state")

        # TEST 11: List Configurations for User A
        res = client.get("/api/configurations")
        assert res.status_code == 200, f"Listing configurations failed: {res.data}"
        assert res.data["count"] >= 1, "Count should be at least 1"
        assert any(c["id"] == config_a_id for c in res.data["configurations"]), "Created configuration not found in list"
        print("  [PASS] TEST 11: GET /api/configurations lists User A's configurations")

        # TEST 12: Retrieve single Configuration by ID
        res = client.get(f"/api/configurations/{config_a_id}")
        assert res.status_code == 200, f"Single configuration fetch failed: {res.data}"
        assert res.data["configuration"]["landing_url"] == "https://companyportal.com"
        print("  [PASS] TEST 12: GET /api/configurations/<id> retrieves full configuration")

        # TEST 13: Update Configuration
        update_payload = {
            "configuration_name": f"Django Prod Template {timestamp} (Updated)",
            "configuration_data": {
                "branding": {"brandName": "Updated Enterprise Cloud", "logoShape": "rounded"},
                "pages": {"otp": {"length": 8, "style": "square", "whatsappEnabled": True}}
            }
        }
        res = client.put(f"/api/configurations/{config_a_id}", update_payload, format="json")
        assert res.status_code == 200, f"Configuration update failed: {res.data}"
        assert res.data["configuration"]["configuration_name"] == update_payload["configuration_name"]
        assert res.data["configuration"]["configuration_data"]["pages"]["otp"]["length"] == 8
        print("  [PASS] TEST 13: PUT /api/configurations/<id> updates configuration successfully")

        # TEST 14: Ownership Isolation - User B cannot read User A's configuration
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_b}")
        res = client.get(f"/api/configurations/{config_a_id}")
        assert res.status_code in [403, 404], f"Expected 403/404 when User B accesses User A's config, got {res.status_code}"
        print("  [PASS] TEST 14: User B is blocked from reading User A's configuration (HTTP 403)")

        # TEST 15: Ownership Isolation - User B cannot update User A's configuration
        res = client.put(f"/api/configurations/{config_a_id}", {"configuration_name": "Hacked Config"}, format="json")
        assert res.status_code in [403, 404], f"Expected 403/404 when User B updates User A's config, got {res.status_code}"
        print("  [PASS] TEST 15: User B is blocked from updating User A's configuration (HTTP 403)")

        # TEST 16: Ownership Isolation - User B cannot delete User A's configuration
        res = client.delete(f"/api/configurations/{config_a_id}")
        assert res.status_code in [403, 404], f"Expected 403/404 when User B deletes User A's config, got {res.status_code}"
        print("  [PASS] TEST 16: User B is blocked from deleting User A's configuration (HTTP 403)")

        # TEST 17: User A deletes own configuration
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")
        res = client.delete(f"/api/configurations/{config_a_id}")
        assert res.status_code == 200, f"Configuration delete failed: {res.data}"
        print("  [PASS] TEST 17: DELETE /api/configurations/<id> deletes configuration successfully")

        # TEST 18: Deleted configuration cannot be retrieved
        res = client.get(f"/api/configurations/{config_a_id}")
        assert res.status_code == 404, f"Expected 404 for deleted config, got {res.status_code}"
        print("  [PASS] TEST 18: Deleted configuration returns HTTP 404 Not Found")

        # TEST 19: Invalid URL validation
        bad_config = {
            "configuration_name": "Bad URL Config",
            "landing_url": "ftp-invalid://example",
            "configuration_data": {"test": 1}
        }
        res = client.post("/api/configurations", bad_config, format="json")
        assert res.status_code == 400, f"Expected 400 for bad URL, got {res.status_code}"
        print("  [PASS] TEST 19: Malformed URL rejected with HTTP 400 Bad Request")

        # TEST 20: Missing Authorization Header
        client.credentials()  # Remove credentials
        res = client.get("/api/configurations")
        assert res.status_code in [401, 403], f"Expected 401/403 without auth header, got {res.status_code}"
        print("  [PASS] TEST 20: Unauthenticated request rejected with HTTP 401/403")

        print("=" * 60)
        print("DJANGO BACKEND SUITE: ALL 20 TESTS PASSED (100%)")
        print("=" * 60)

    finally:
        # Clean up test users safely from MySQL
        if created_user_ids:
            AuthUser.objects.filter(id__in=created_user_ids).delete()
            print(f"Cleaned up {len(created_user_ids)} test users from database safely.")


if __name__ == "__main__":
    run_tests()
