import os
import sys
import json
import django

base_dir = os.path.abspath("django_backend")
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_page_builder_backend.settings")
django.setup()

from authentication.models import AuthUser
from configurations.models import AuthConfiguration
from authentication.auth import generate_jwt_token
from django.test import RequestFactory
from configurations.views import (
    ConfigurationCurrentView,
    ConfigurationSaveView,
    ConfigurationListCreateView,
    ConfigurationDetailView,
)

def run_swetha_ownership_test():
    print("==================================================")
    print("TESTING SWETHA USER-SCOPED DB CONFIGURATION")
    print("==================================================")

    swetha = AuthUser.objects.filter(username="swetha").first()
    if not swetha:
        print("  [FAIL] User 'swetha' not found in database!")
        sys.exit(1)

    print(f"  [PASS] Found user 'swetha': ID={swetha.id}, Email={swetha.email}")

    token_swetha = generate_jwt_token(swetha)
    rf = RequestFactory()

    # 1. GET Current Configuration for swetha
    req1 = rf.get("/api/configurations/current", HTTP_AUTHORIZATION=f"Bearer {token_swetha}")
    req1.user = swetha
    view1 = ConfigurationCurrentView.as_view()
    res1 = view1(req1)

    print(f"  [INFO] GET /api/configurations/current status: {res1.status_code}")
    res_data1 = res1.data
    if res1.status_code == 200 and res_data1.get("success"):
        cfg = res_data1.get("configuration", {})
        print(f"  [PASS] swetha active config ID: {cfg.get('id')} (user_id={cfg.get('user_id')})")
        if int(cfg.get("user_id")) != int(swetha.id):
            print(f"  [FAIL] Configuration user_id ({cfg.get('user_id')}) does NOT match swetha ID ({swetha.id})!")
            sys.exit(1)
    else:
        print(f"  [FAIL] Failed to get active configuration for swetha: {res_data1}")
        sys.exit(1)

    # 2. SAVE Configuration for swetha
    swetha_config_id = res_data1["configuration"]["id"]
    new_landing = "https://customerwebsite.com/swetha-portal"
    new_redirect = "https://customerwebsite.com/swetha-portal"

    save_payload = {
        "id": swetha_config_id,
        "configuration_name": "Swetha's Customized Portal",
        "landing_url": new_landing,
        "redirect_url": new_redirect,
        "configuration_data": {
            "branding": {"brandName": "SWETHA_ENTERPRISE"},
            "pages": {"login": {"title": "Swetha Secure Login"}},
            "redirect": {"enabled": True, "redirectUrl": new_redirect},
            "urls": {"landingPageUrl": new_landing, "redirectUrl": new_redirect}
        }
    }

    req2 = rf.post(
        "/api/configurations/save",
        data=json.dumps(save_payload),
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token_swetha}"
    )
    req2.user = swetha
    view2 = ConfigurationSaveView.as_view()
    res2 = view2(req2)

    print(f"  [INFO] POST /api/configurations/save status: {res2.status_code}")
    if res2.status_code in (200, 201) and res2.data.get("success"):
        saved_cfg = res2.data["configuration"]
        print(f"  [PASS] Saved configuration ID: {saved_cfg['id']} for user_id={saved_cfg['user_id']}")
        if int(saved_cfg["user_id"]) != int(swetha.id):
            print(f"  [FAIL] Saved config user_id mismatch!")
            sys.exit(1)
    else:
        print(f"  [FAIL] Failed to save configuration for swetha: {res2.data}")
        sys.exit(1)

    # 3. Verify Database Row directly
    db_cfg = AuthConfiguration.objects.filter(id=swetha_config_id, user_id=swetha.id, is_active=True).first()
    if db_cfg and db_cfg.landing_url == new_landing and db_cfg.redirect_url == new_redirect:
        print(f"  [PASS] Database row ID {db_cfg.id} updated correctly: landing='{db_cfg.landing_url}', redirect='{db_cfg.redirect_url}'")
    else:
        print(f"  [FAIL] Database row mismatch for swetha configuration!")
        sys.exit(1)

    # 4. MULTI-USER ISOLATION TEST (User B = sam, ID 176)
    sam = AuthUser.objects.filter(username="sam").first()
    if sam:
        token_sam = generate_jwt_token(sam)
        # Sam attempts to access Swetha's configuration ID
        req_bad = rf.get(f"/api/configurations/{swetha_config_id}", HTTP_AUTHORIZATION=f"Bearer {token_sam}")
        req_bad.user = sam
        view_detail = ConfigurationDetailView.as_view()
        res_bad = view_detail(req_bad, pk=swetha_config_id)

        print(f"  [INFO] User 'sam' GET /api/configurations/{swetha_config_id} status: {res_bad.status_code}")
        if res_bad.status_code == 403:
            print("  [PASS] Multi-user isolation enforced! User 'sam' received HTTP 403 FORBIDDEN.")
        else:
            print(f"  [FAIL] Multi-user isolation breach! Expected 403, got {res_bad.status_code}")
            sys.exit(1)

    print("==================================================")
    print("SWETHA USER OWNERSHIP TEST RESULTS: ALL PASSED")
    print("==================================================")

if __name__ == "__main__":
    run_swetha_ownership_test()
