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

def run_autosave_flow_tests():
    print("============================================================")
    print("RUNNING DJANGO AUTOSAVE FLOW ACCEPTANCE SUITE")
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
    test_session = "sess_autosave_flow_999"
    AuthConfiguration.objects.filter(builder_session_id=test_session).delete()
    AuthUser.objects.filter(username="autosave_user").delete()

    # Step 1: First Anonymous Customization Change (POST /api/configurations with id=None)
    payload_1 = {
        "builder_session_id": test_session,
        "configuration_name": "Default Auth Experience",
        "landing_url": "https://landing.com",
        "redirect_url": "https://landing.com/login",
        "configuration_data": {
            "branding": {"brandName": "Acme Corp Initial"},
            "background": {"image": "assets/backgrounds/auth_bg_1.webp"}
        }
    }

    res_first = client.post("/api/configurations", payload_1, format="json")
    assert_test(res_first.status_code == 201, f"First anonymous change returned HTTP 201 Created (Got {res_first.status_code})")
    assert_test(res_first.data.get("success") is True, "Response contains success: true")
    config_id = res_first.data.get("configuration", {}).get("id")
    assert_test(config_id is not None, f"First save created configuration with ID {config_id}")

    # Verify initial database row
    db_config_1 = AuthConfiguration.objects.filter(id=config_id).first()
    assert_test(db_config_1 is not None, "Exactly one row created in auth_configurations table")
    if db_config_1:
        assert_test(db_config_1.user_id is None, "user_id is NULL for anonymous autosave")
        assert_test(db_config_1.builder_session_id == test_session, f"builder_session_id matches '{test_session}'")
        assert_test(db_config_1.configuration_name == "Default Auth Experience", "configuration_name is 'Default Auth Experience'")
        assert_test(db_config_1.configuration_data.get("branding", {}).get("brandName") == "Acme Corp Initial", "configuration_data stores initial brand name")
        initial_updated_at = db_config_1.updated_at

    # Step 2: Second Customization Change (PUT /api/configurations/<id>)
    time.sleep(0.1)
    payload_2 = {
        "builder_session_id": test_session,
        "configuration_name": "Default Auth Experience",
        "landing_url": "https://landing.com",
        "redirect_url": "https://landing.com/dashboard",
        "configuration_data": {
            "branding": {"brandName": "Acme Corp Updated"},
            "background": {"image": "assets/backgrounds/auth_bg_3.webp"}
        }
    }

    res_second = client.put(f"/api/configurations/{config_id}", payload_2, format="json")
    assert_test(res_second.status_code == 200, f"Second customization change (PUT /api/configurations/{config_id}) returned HTTP 200 OK")

    # Verify same database row updated
    total_rows = AuthConfiguration.objects.filter(builder_session_id=test_session).count()
    assert_test(total_rows == 1, f"Total database rows for session is still 1 (No duplicate rows created on autosave update)")

    db_config_2 = AuthConfiguration.objects.filter(id=config_id).first()
    if db_config_2:
        assert_test(db_config_2.configuration_data.get("branding", {}).get("brandName") == "Acme Corp Updated", "configuration_data updated with new brand name")
        assert_test(db_config_2.configuration_data.get("background", {}).get("image") == "assets/backgrounds/auth_bg_3.webp", "configuration_data updated with new background")
        assert_test(db_config_2.updated_at >= initial_updated_at, "updated_at timestamp updated")

    # Step 3: Third Customization Change (POST /api/configurations with id=<config_id>)
    time.sleep(0.1)
    payload_3 = {
        "id": config_id,
        "builder_session_id": test_session,
        "configuration_name": "Default Auth Experience",
        "configuration_data": {
            "branding": {"brandName": "Acme Corp Final"},
            "background": {"image": "assets/backgrounds/auth_bg_5.webp"}
        }
    }

    res_third = client.post("/api/configurations", payload_3, format="json")
    assert_test(res_third.status_code == 200, "POST with activeConfigId upserted same row (HTTP 200 OK)")

    total_rows_after = AuthConfiguration.objects.filter(builder_session_id=test_session).count()
    assert_test(total_rows_after == 1, "Total database rows remains 1 after multiple autosave edits")

    # Step 4: User Logs In / Registers -> Attach configuration to user
    res_reg = client.post("/api/auth/register", {
        "username": "autosave_user",
        "email": "autosave_user@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "builder_session_id": test_session
    }, format="json")
    assert_test(res_reg.status_code == 201, "User registration returned HTTP 201 Created")
    user_id = res_reg.data.get("user", {}).get("id")

    linked_db_config = AuthConfiguration.objects.filter(id=config_id).first()
    assert_test(linked_db_config is not None and linked_db_config.user_id == user_id, f"Configuration ID {config_id} is now associated with registered user ID ({user_id})")
    assert_test(linked_db_config.configuration_data.get("branding", {}).get("brandName") == "Acme Corp Final", "Configuration data preserved intact after user association")

    # Clean up
    AuthConfiguration.objects.filter(builder_session_id=test_session).delete()
    AuthUser.objects.filter(username="autosave_user").delete()

    print("\n============================================================")
    print(f"AUTOSAVE FLOW SUITE: PASSED {passed}/{passed + failed}")
    print("============================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_autosave_flow_tests()
