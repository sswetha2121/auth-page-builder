import os
import sys
import json
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_page_builder_backend.settings")
django.setup()

from django.db import connection
from authentication.models import AuthUser
from configurations.models import AuthConfiguration
from configurations.views import save_configuration

def run_db_persistence_verification():
    print("=" * 60)
    print("RUNNING DATABASE PERSISTENCE VERIFICATION FOR USER 11 (CONFIG 4)")
    print("=" * 60)

    # 1. Ensure User 11 exists
    user, created = AuthUser.objects.get_or_create(
        id=11,
        defaults={
            "username": "user11_test",
            "email": "user11@example.com",
            "password_hash": "pbkdf2_sha256$mock"
        }
    )
    print(f"[DB Test] User 11 exists: {user.username} (ID: {user.id})")

    # 2. Canonical test configuration data
    canonical_data = {
        "activePage": "login",
        "previewMode": "desktop",
        "redirect": {
            "enabled": True,
            "redirectUrl": "/dashboard",
            "redirectType": "url",
            "openInNewTab": False,
            "showSuccessMessage": True,
            "successMessage": "Authentication completed successfully.",
            "delay": 0
        },
        "urls": {
            "landingPageUrl": "https://customerwebsite.com",
            "redirectUrl": "/dashboard",
            "openInNewTab": False
        },
        "background": {
            "type": "default",
            "selected": "assets/backgrounds/auth_bg_1.webp",
            "color": "#0f172a",
            "overlayEnabled": True
        },
        "branding": {
            "brandName": "Apex Security Portal",
            "logoAsset": "assets/logos/auth_logo_1.svg"
        },
        "login": {
            "heading": "Welcome Back",
            "description": "Please enter your credentials"
        },
        "signup": {
            "heading": "Create your Account",
            "termsEnabled": True
        },
        "forgotPassword": {
            "heading": "Reset Password",
            "buttonText": "Send Reset Link"
        },
        "otp": {
            "enabled": True,
            "length": 6,
            "displayMode": "separate"
        }
    }

    # 3. Save configuration for User 11
    config, created_flag = save_configuration(
        configuration_data=canonical_data,
        config_name="Primary Auth Experience",
        landing_url="https://customerwebsite.com",
        redirect_url="/dashboard",
        user=user,
        config_id=4
    )

    print(f"[DB Test] Config saved: ID={config.id}, created={created_flag}, updated_at={config.updated_at}")
    assert config.id == 4, f"Expected config ID 4, got {config.id}"
    assert config.user_id == 11, f"Expected user_id 11, got {config.user_id}"

    # 4. Save second customization edit for User 11 to verify in-place update (No duplicate row creation)
    canonical_data["branding"]["brandName"] = "Apex Enterprise Security"
    canonical_data["redirect"]["redirectUrl"] = "/profile/settings"
    config_edited, created_edited = save_configuration(
        configuration_data=canonical_data,
        config_name="Primary Auth Experience",
        landing_url="https://customerwebsite.com",
        redirect_url="/profile/settings",
        user=user,
        config_id=4
    )

    total_rows = AuthConfiguration.objects.filter(user_id=11).count()
    print(f"[DB Test] Total configuration rows for user_id=11: {total_rows}")
    assert total_rows == 1, f"Expected exactly 1 configuration row for user_id=11, got {total_rows}"
    assert config_edited.id == 4, "Config ID changed from 4!"
    assert not created_edited, "In-place update created a new row!"

    # 5. Execute raw SQL JSON queries as required by Section 11 of user request
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                id,
                user_id,
                builder_session_id,
                configuration_name,
                updated_at
            FROM auth_configurations
            WHERE id = 4;
        """)
        row = cursor.fetchone()
        print(f"[SQL Output] Row 4 metadata: {row}")

        cursor.execute("""
            SELECT
                JSON_KEYS(configuration_data)
            FROM auth_configurations
            WHERE id = 4;
        """)
        keys_json = cursor.fetchone()[0]
        print(f"[SQL Output] JSON_KEYS: {keys_json}")

        cursor.execute("""
            SELECT
                JSON_EXTRACT(configuration_data, '$.redirect') AS redirect,
                JSON_EXTRACT(configuration_data, '$.background') AS background,
                JSON_EXTRACT(configuration_data, '$.branding') AS branding,
                JSON_EXTRACT(configuration_data, '$.login') AS login,
                JSON_EXTRACT(configuration_data, '$.signup') AS signup,
                JSON_EXTRACT(configuration_data, '$.forgotPassword') AS forgotPassword,
                JSON_EXTRACT(configuration_data, '$.otp') AS otp
            FROM auth_configurations
            WHERE id = 4;
        """)
        extracted_sections = cursor.fetchone()
        print("[SQL Output] Extracted Sections:")
        labels = ["redirect", "background", "branding", "login", "signup", "forgotPassword", "otp"]
        for idx, lbl in enumerate(labels):
            val = extracted_sections[idx]
            print(f"  - {lbl}: {val}")
            assert val is not None, f"JSON_EXTRACT for $.{lbl} returned NULL!"

    print("=" * 60)
    print("DATABASE PERSISTENCE VERIFICATION SUCCESSFUL (100% PASSED)")
    print("=" * 60)

if __name__ == "__main__":
    run_db_persistence_verification()
