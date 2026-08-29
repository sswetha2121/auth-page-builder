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

def run_config_save_tests():
    print("============================================================")
    print("RUNNING DJANGO AUTH_CONFIGURATIONS SAVE & UPDATE SUITE")
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

    # Cleanup test configs
    AuthConfiguration.objects.filter(configuration_name__icontains="Test Configuration").delete()

    # Create test user
    test_user, _ = AuthUser.objects.get_or_create(
        username="config_test_user",
        defaults={"email": "config_test@example.com", "password": "hash", "password_hash": "hash"}
    )
    client.force_authenticate(user=test_user)

    # 1. Test Initial Configuration Save (POST /api/configurations)
    sample_data_v1 = {
        "branding": {"brandName": "Apex Enterprise"},
        "urls": {"landingPageUrl": "https://apex.com", "redirectUrl": "https://apex.com/dashboard"},
        "button": {"backgroundColor": "#2563eb"}
    }
    
    res_create = client.post("/api/configurations", {
        "configuration_name": "Test Configuration V1",
        "landing_url": "https://apex.com",
        "redirect_url": "https://apex.com/dashboard",
        "configuration_data": sample_data_v1
    }, format="json")

    assert_test(res_create.status_code in [200, 201], f"Initial config save returned HTTP {res_create.status_code}")
    assert_test(res_create.data.get("success") is True, "Response contains success: true")
    config_id = res_create.data.get("configuration", {}).get("id")
    assert_test(config_id is not None, f"Created configuration returned ID: {config_id}")

    # 2. Verify Database Row in auth_configurations
    db_config = AuthConfiguration.objects.filter(id=config_id).first()
    assert_test(db_config is not None, "Configuration record exists in auth_configurations database table")
    if db_config:
        assert_test(db_config.user_id == test_user.id, f"auth_configurations.user_id matches authenticated user ({test_user.id})")
        assert_test(db_config.configuration_name == "Test Configuration V1", "auth_configurations.configuration_name stored correctly")
        assert_test(db_config.landing_url == "https://apex.com", "auth_configurations.landing_url stored correctly")
        assert_test(db_config.redirect_url == "https://apex.com/dashboard", "auth_configurations.redirect_url stored correctly")
        assert_test(db_config.configuration_data.get("button", {}).get("backgroundColor") == "#2563eb", "auth_configurations.configuration_data stored JSON state correctly")
        initial_updated_at = db_config.updated_at

    # 3. Test Configuration Update (Upsert on POST /api/configurations)
    time.sleep(0.1) # Small delay to ensure timestamp change
    sample_data_v2 = {
        "branding": {"brandName": "Apex Enterprise V2"},
        "urls": {"landingPageUrl": "https://apex.com", "redirectUrl": "https://apex.com/v2/dashboard"},
        "button": {"backgroundColor": "#059669"}
    }

    res_upsert = client.post("/api/configurations", {
        "id": config_id,
        "configuration_name": "Test Configuration V2",
        "landing_url": "https://apex.com",
        "redirect_url": "https://apex.com/v2/dashboard",
        "configuration_data": sample_data_v2
    }, format="json")

    assert_test(res_upsert.status_code == 200, "Upserting existing config returned HTTP 200 OK")

    # 4. Verify Database Row updated in auth_configurations
    db_config_v2 = AuthConfiguration.objects.filter(id=config_id).first()
    if db_config_v2:
        assert_test(db_config_v2.configuration_name == "Test Configuration V2", "auth_configurations table updated configuration_name")
        assert_test(db_config_v2.redirect_url == "https://apex.com/v2/dashboard", "auth_configurations table updated redirect_url")
        assert_test(db_config_v2.configuration_data.get("button", {}).get("backgroundColor") == "#059669", "auth_configurations table updated configuration_data JSON")
        assert_test(db_config_v2.updated_at >= initial_updated_at, "auth_configurations.updated_at timestamp updated")

    # 5. Test Direct PUT Endpoint (/api/configurations/<id>)
    res_put = client.put(f"/api/configurations/{config_id}", {
        "configuration_name": "Test Configuration V3",
        "configuration_data": sample_data_v2
    }, format="json")
    assert_test(res_put.status_code == 200, "PUT /api/configurations/<id> returned HTTP 200 OK")

    # 6. Test GET Endpoint (/api/configurations/<id>)
    res_get = client.get(f"/api/configurations/{config_id}")
    assert_test(res_get.status_code == 200 and res_get.data.get("configuration", {}).get("configuration_name") == "Test Configuration V3", "GET /api/configurations/<id> retrieves updated configuration")

    # Clean up
    AuthConfiguration.objects.filter(configuration_name__icontains="Test Configuration").delete()
    AuthUser.objects.filter(username="config_test_user").delete()

    print("\n============================================================")
    print(f"CONFIGURATION SAVE SUITE: PASSED {passed}/{passed + failed}")
    print("============================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_config_save_tests()
