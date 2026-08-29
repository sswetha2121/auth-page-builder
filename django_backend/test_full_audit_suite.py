import os
import sys
import django
import time

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ["DJANGO_SETTINGS_MODULE"] = "auth_page_builder_backend.settings"
django.setup()

from rest_framework.test import APIClient
from authentication.models import AuthUser
from configurations.models import AuthConfiguration

def run_audit_suite():
    print("============================================================")
    print("RUNNING COMPLETE USER ACCOUNT & CONFIGURATION AUDIT SUITE")
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

    # Cleanup test data
    test_session = "audit_session_uuid_777"
    AuthConfiguration.objects.filter(builder_session_id=test_session).delete()
    AuthUser.objects.filter(username__in=["audit_user_1", "audit_user_2"]).delete()

    # 1. Test Registration with Stale Authorization Header (Verify NO 403 Error)
    client.credentials(HTTP_AUTHORIZATION="Bearer invalid_or_expired_stale_token_123")
    res_reg = client.post("/api/auth/register", {
        "username": "audit_user_1",
        "email": "audit1@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "builder_session_id": test_session
    }, format="json")

    assert_test(res_reg.status_code == 201, f"Registration with stale token returned HTTP 201 Created (Got {res_reg.status_code})")
    assert_test(res_reg.data.get("success") is True, "Registration response contains success: true")
    user_1_id = res_reg.data.get("user", {}).get("id")

    # 2. Test Login with Stale Authorization Header (Verify NO 403 Error)
    client.credentials(HTTP_AUTHORIZATION="Bearer invalid_or_expired_stale_token_123")
    res_login = client.post("/api/auth/login", {
        "identifier": "audit_user_1",
        "password": "Password123!"
    }, format="json")

    assert_test(res_login.status_code == 200, f"Login with stale token returned HTTP 200 OK (Got {res_login.status_code})")
    token = res_login.data.get("token")
    assert_test(token is not None, "Login response returned valid JWT token")

    # 3. Test CORS Preflight Header
    res_options = client.options("/api/configurations", HTTP_ACCESS_CONTROL_REQUEST_HEADERS="x-builder-session-id, authorization, content-type")
    assert_test(res_options.status_code in [200, 204], f"CORS OPTIONS preflight returned HTTP {res_options.status_code}")

    # 4. Test Anonymous Configuration Persistence (Non-null fields)
    client.credentials()  # Unauthenticated
    res_config = client.post("/api/configurations", {
        "builder_session_id": test_session,
        "configuration_name": "Audit Configuration",
        "landing_url": "https://landing-audit.com",
        "redirect_url": "https://landing-audit.com/dashboard",
        "configuration_data": {
            "branding": {"brandName": "Audit Brand"},
            "urls": {"landingPageUrl": "https://landing-audit.com", "redirectUrl": "https://landing-audit.com/dashboard"}
        }
    }, format="json")

    assert_test(res_config.status_code in [200, 201], f"Anonymous config save returned HTTP {res_config.status_code}")
    config_id = res_config.data.get("configuration", {}).get("id")

    # 5. Verify Database Record in auth_configurations
    db_config = AuthConfiguration.objects.filter(id=config_id).first()
    assert_test(db_config is not None, "Configuration saved to MySQL auth_configurations database table")
    if db_config:
        assert_test(db_config.configuration_name == "Audit Configuration", "configuration_name is non-null")
        assert_test(db_config.landing_url == "https://landing-audit.com", "landing_url is non-null")
        assert_test(db_config.redirect_url == "https://landing-audit.com/dashboard", "redirect_url is non-null")
        assert_test(db_config.configuration_data.get("branding", {}).get("brandName") == "Audit Brand", "configuration_data stored cleanly")
        initial_updated = db_config.updated_at

    # 6. Test In-Place Update (PUT /api/configurations/<id>)
    time.sleep(0.1)
    res_update = client.put(f"/api/configurations/{config_id}", {
        "builder_session_id": test_session,
        "configuration_name": "Audit Configuration Updated",
        "configuration_data": {
            "branding": {"brandName": "Audit Brand V2"}
        }
    }, format="json")

    assert_test(res_update.status_code == 200, "Configuration update returned HTTP 200 OK")
    db_updated = AuthConfiguration.objects.filter(id=config_id).first()
    if db_updated:
        assert_test(db_updated.configuration_name == "Audit Configuration Updated", "configuration_name updated in database")
        assert_test(db_updated.updated_at >= initial_updated, "updated_at timestamp refreshed")

    # Clean up
    AuthConfiguration.objects.filter(builder_session_id=test_session).delete()
    AuthUser.objects.filter(username__in=["audit_user_1", "audit_user_2"]).delete()

    print("\n============================================================")
    print(f"AUDIT SUITE: PASSED {passed}/{passed + failed}")
    print("============================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_audit_suite()
