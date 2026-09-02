import os
import sys
import json
import http.client
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
    ExportConfigurationView,
)

def run_swetha_e2e_flow():
    print("==================================================")
    print("RUNNING END-TO-END USER CONFIGURATION & DB TEST")
    print("==================================================")

    # 1. VERIFY SWETHA USER IDENTIFICATION
    swetha = AuthUser.objects.filter(username="swetha").first()
    if not swetha:
        print("  [FAIL] User 'swetha' not found in database!")
        sys.exit(1)

    print(f"  [PASS] User 'swetha' identified: ID={swetha.id}, Email={swetha.email}")

    token_swetha = generate_jwt_token(swetha)
    rf = RequestFactory()

    # 2. VERIFY GET ACTIVE CONFIGURATION FOR SWETHA
    req_curr = rf.get("/api/configurations/current", HTTP_AUTHORIZATION=f"Bearer {token_swetha}")
    req_curr.user = swetha
    view_curr = ConfigurationCurrentView.as_view()
    res_curr = view_curr(req_curr)

    if res_curr.status_code != 200 or not res_curr.data.get("success"):
        print(f"  [FAIL] Failed to retrieve current configuration for swetha: {res_curr.data}")
        sys.exit(1)

    swetha_config = res_curr.data["configuration"]
    config_id = swetha_config["id"]
    print(f"  [PASS] swetha active configuration ID: {config_id} (user_id={swetha_config['user_id']})")
    if int(swetha_config["user_id"]) != int(swetha.id):
        print(f"  [FAIL] Configuration user_id ({swetha_config['user_id']}) != swetha.id ({swetha.id})!")
        sys.exit(1)

    # 3. SAVE NEW CUSTOMIZED CONFIGURATION FOR SWETHA
    target_landing = "https://customerwebsite.com/"
    target_redirect = "https://customerwebsite.com/"
    brand_name = "SWETHA_ENTERPRISE_PORTAL"
    headline = "Swetha Portal Sign In"

    customized_data = {
        "activePage": "login",
        "previewMode": "desktop",
        "redirect": {
            "enabled": True,
            "redirectUrl": target_redirect,
            "showSuccessMessage": True,
            "successMessage": "Authentication completed successfully."
        },
        "urls": {
            "landingPageUrl": target_landing,
            "redirectUrl": target_redirect,
            "showBackToWebsite": True,
            "backToWebsiteText": "Back to Website"
        },
        "branding": {
            "showLogo": True,
            "brandName": brand_name,
            "logo": "assets/logos/brand-shield.svg"
        },
        "pages": {
            "login": {
                "title": headline,
                "subtitle": "Sign in to access your portal",
                "buttonText": "Sign In"
            }
        },
        "card": {
            "width": 520,
            "borderRadius": 24
        },
        "button": {
            "backgroundColor": "#059669"
        }
    }

    save_payload = {
        "id": config_id,
        "configuration_name": "Swetha's Production Portal",
        "landing_url": target_landing,
        "redirect_url": target_redirect,
        "configuration_data": customized_data
    }

    req_save = rf.post(
        "/api/configurations/save",
        data=json.dumps(save_payload),
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token_swetha}"
    )
    req_save.user = swetha
    view_save = ConfigurationSaveView.as_view()
    res_save = view_save(req_save)

    if res_save.status_code not in (200, 201) or not res_save.data.get("success"):
        print(f"  [FAIL] Failed to save configuration: {res_save.data}")
        sys.exit(1)

    print(f"  [PASS] Configuration updated successfully for user_id={swetha.id}")

    # 4. VERIFY DATABASE ROW DIRECTLY
    db_row = AuthConfiguration.objects.filter(id=config_id, user_id=swetha.id, is_active=True).first()
    if not db_row:
        print("  [FAIL] DB row not found after save!")
        sys.exit(1)

    if db_row.landing_url != target_landing or db_row.redirect_url != target_redirect:
        print(f"  [FAIL] DB row URLs mismatch! landing={db_row.landing_url}, redirect={db_row.redirect_url}")
        sys.exit(1)

    print(f"  [PASS] DB Row ID {db_row.id} verified: landing='{db_row.landing_url}', redirect='{db_row.redirect_url}'")

    # 5. TEST MY CONFIGURATIONS LIST ISOLATION
    req_list = rf.get("/api/configurations", HTTP_AUTHORIZATION=f"Bearer {token_swetha}")
    req_list.user = swetha
    view_list = ConfigurationListCreateView.as_view()
    res_list = view_list(req_list)

    if res_list.status_code != 200 or not res_list.data.get("success"):
        print(f"  [FAIL] List configurations failed: {res_list.data}")
        sys.exit(1)

    user_configs = res_list.data.get("configurations", [])
    for c in user_configs:
        if int(c["user_id"]) != int(swetha.id):
            print(f"  [FAIL] Found configuration belonging to user_id {c['user_id']} in swetha's list!")
            sys.exit(1)

    print(f"  [PASS] My Configurations list returned {len(user_configs)} configurations, all belonging to swetha (ID {swetha.id})")

    # 6. TEST BACKEND EXPORT PIPELINE FOR SWETHA
    req_exp = rf.post(
        "/api/configurations/export",
        data=json.dumps({"configuration": customized_data}),
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token_swetha}"
    )
    req_exp.user = swetha
    view_exp = ExportConfigurationView.as_view()
    res_exp = view_exp(req_exp)

    if res_exp.status_code != 200 or res_exp.get("Content-Type") != "application/zip":
        print(f"  [FAIL] Export failed or wrong content type: {res_exp.status_code}")
        sys.exit(1)

    print(f"  [PASS] Backend Export returned binary ZIP (Content-Type: application/zip, Content-Disposition: {res_exp.get('Content-Disposition')})")

    # 7. MULTI-USER ISOLATION TEST (User B = sam)
    sam = AuthUser.objects.filter(username="sam").first()
    if sam:
        token_sam = generate_jwt_token(sam)
        req_mod = rf.put(
            f"/api/configurations/{config_id}",
            data=json.dumps({"configuration_name": "Hacked Name"}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token_sam}"
        )
        req_mod.user = sam
        view_det = ConfigurationDetailView.as_view()
        res_mod = view_det(req_mod, pk=config_id)

        if res_mod.status_code == 403:
            print("  [PASS] Multi-user mutation attempt by User B ('sam') rejected with HTTP 403 FORBIDDEN.")
        else:
            print(f"  [FAIL] Multi-user mutation security breach! Got status {res_mod.status_code}")
            sys.exit(1)

    print("==================================================")
    print("END-TO-END SWETHA CONFIGURATION RESULTS: ALL PASSED")
    print("==================================================")

if __name__ == "__main__":
    run_swetha_e2e_flow()
