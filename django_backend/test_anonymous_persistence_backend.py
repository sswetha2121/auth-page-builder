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

def run_anonymous_persistence_tests():
    print("============================================================")
    print("RUNNING DJANGO ANONYMOUS SESSION PERSISTENCE ACCEPTANCE SUITE")
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

    # Cleanup test configs & users
    test_sessions = ["sess_anon_uuid_1001", "sess_anon_uuid_2002"]
    AuthConfiguration.objects.filter(builder_session_id__in=test_sessions).delete()
    AuthUser.objects.filter(username="linked_test_user").delete()

    # TEST 1 — New Anonymous Session Creation
    anon_session_1 = "sess_anon_uuid_1001"
    payload_1 = {
        "builder_session_id": anon_session_1,
        "configuration_name": "Anonymous Customization 1",
        "landing_url": "https://landing1.com",
        "redirect_url": "https://redirect1.com",
        "configuration_data": {
            "branding": {"brandName": "Brand Anon 1"},
            "background": {"image": "assets/backgrounds/auth_bg_1.webp"},
            "passwordPolicy": {"minLength": 8}
        }
    }

    res_save1 = client.post("/api/configurations", payload_1, format="json")
    assert_test(res_save1.status_code == 201, f"First anonymous save returned HTTP 201 Created (Got {res_save1.status_code})")
    assert_test(res_save1.data.get("success") is True, "Response contains success: true")
    config_1_id = res_save1.data.get("configuration", {}).get("id")

    # Verify Database Row for Test 1
    db_config_1 = AuthConfiguration.objects.filter(id=config_1_id).first()
    assert_test(db_config_1 is not None, "Exactly one AuthConfiguration database record created")
    if db_config_1:
        assert_test(db_config_1.user_id is None, "auth_configurations.user_id is NULL for anonymous user")
        assert_test(db_config_1.builder_session_id == anon_session_1, f"auth_configurations.builder_session_id matches '{anon_session_1}'")
        initial_updated_at = db_config_1.updated_at

    # TEST 2 — Update Existing Anonymous Configuration
    time.sleep(0.1)
    payload_2 = {
        "builder_session_id": anon_session_1,
        "configuration_name": "Anonymous Customization 1 (Updated)",
        "landing_url": "https://landing1.com",
        "redirect_url": "https://redirect1.com/dashboard",
        "configuration_data": {
            "branding": {"brandName": "Brand Anon 1 Updated"},
            "background": {"image": "assets/backgrounds/auth_bg_2.webp"},
            "passwordPolicy": {"minLength": 10}
        }
    }

    res_save2 = client.post("/api/configurations", payload_2, format="json")
    assert_test(res_save2.status_code == 200, f"Second anonymous save returned HTTP 200 OK (Got {res_save2.status_code})")
    config_2_id = res_save2.data.get("configuration", {}).get("id")
    assert_test(config_2_id == config_1_id, "Subsequent save updated the SAME database row ID (no duplicate created)")

    # Verify Database Row Updated for Test 2
    db_config_updated = AuthConfiguration.objects.filter(id=config_1_id).first()
    if db_config_updated:
        assert_test(db_config_updated.configuration_name == "Anonymous Customization 1 (Updated)", "configuration_name updated in database")
        assert_test(db_config_updated.configuration_data.get("background", {}).get("image") == "assets/backgrounds/auth_bg_2.webp", "configuration_data background image updated")
        assert_test(db_config_updated.updated_at >= initial_updated_at, "updated_at timestamp refreshed")

    # TEST 3 — Multiple Customizations Persist
    total_count = AuthConfiguration.objects.filter(builder_session_id=anon_session_1).count()
    assert_test(total_count == 1, f"Exactly 1 database row exists for session {anon_session_1} (found {total_count})")

    # TEST 4 — Browser Refresh Restoration (GET /api/configurations/current)
    res_restore = client.get(f"/api/configurations/current?builder_session_id={anon_session_1}")
    assert_test(res_restore.status_code == 200, "GET /api/configurations/current returned HTTP 200 OK")
    restored_config = res_restore.data.get("configuration", {})
    assert_test(restored_config.get("id") == config_1_id, "Restored configuration matches saved ID")
    assert_test(restored_config.get("configuration_data", {}).get("branding", {}).get("brandName") == "Brand Anon 1 Updated", "Restored branding name matches saved state")

    # TEST 5 — New Browser Session (Separate Session ID)
    anon_session_2 = "sess_anon_uuid_2002"
    payload_3 = {
        "builder_session_id": anon_session_2,
        "configuration_name": "Anonymous Customization 2",
        "configuration_data": {"branding": {"brandName": "Brand Session 2"}}
    }
    res_save3 = client.post("/api/configurations", payload_3, format="json")
    config_3_id = res_save3.data.get("configuration", {}).get("id")
    assert_test(res_save3.status_code == 201 and config_3_id != config_1_id, "New builder_session_id created a separate configuration record")

    # TEST 6 — Account Linking on User Registration
    res_reg = client.post("/api/auth/register", {
        "username": "linked_test_user",
        "email": "linked_test@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "builder_session_id": anon_session_2
    }, format="json")

    assert_test(res_reg.status_code == 201, "User registration returned HTTP 201 Created")
    new_user_id = res_reg.data.get("user", {}).get("id")
    
    # Check that anonymous config is now linked to new_user_id
    linked_config = AuthConfiguration.objects.filter(id=config_3_id).first()
    assert_test(linked_config is not None and linked_config.user_id == new_user_id, f"Anonymous configuration linked to new user ID ({new_user_id}) upon registration")

    # Clean up test rows
    AuthConfiguration.objects.filter(builder_session_id__in=test_sessions).delete()
    AuthUser.objects.filter(username="linked_test_user").delete()

    print("\n============================================================")
    print(f"ANONYMOUS PERSISTENCE SUITE: PASSED {passed}/{passed + failed}")
    print("============================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_anonymous_persistence_tests()
