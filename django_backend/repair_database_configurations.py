"""
Database Migration & Data Repair Script
Ensures every existing user in `auth_user` has exactly one active configuration in `auth_configurations`.
Preserves existing customizations for users that already have configurations.
Creates default active configuration for users without an active configuration.
Deactivates duplicate active configurations if any exist.
"""

import os
import sys
from pathlib import Path

# Setup Django environment
sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_page_builder_backend.settings")

import django
django.setup()

from django.db import transaction
from django.utils import timezone
from authentication.models import AuthUser
from configurations.models import AuthConfiguration

DEFAULT_CANONICAL_CONFIG = {
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
        "showBackToWebsite": True,
        "backToWebsiteText": "Back to Website",
        "openInNewTab": False
    },
    "layout": {
        "type": "split-left-image",
        "imageWidth": 50,
        "formHorizontalAlignment": "center",
        "formVerticalAlignment": "center",
        "formWidth": 460,
        "contentPadding": 48
    },
    "background": {
        "type": "default",
        "selected": "assets/backgrounds/background-1.svg",
        "image": "assets/backgrounds/background-1.svg",
        "uploadedImage": "",
        "color": "#0f172a",
        "gradientEnabled": False,
        "gradientStart": "#0f172a",
        "gradientEnd": "#1e293b",
        "position": "center",
        "size": "cover",
        "repeat": "no-repeat",
        "overlayEnabled": True,
        "overlayColor": "#000000",
        "overlayOpacity": 35
    },
    "branding": {
        "showLogo": True,
        "selectedLogo": "assets/logos/brand-shield.svg",
        "logo": "assets/logos/brand-shield.svg",
        "uploadedLogo": "",
        "logoSize": 64,
        "logoShape": "circle",
        "logoPosition": "center",
        "brandName": "Your Brand"
    },
    "card": {
        "enabled": True,
        "backgroundColor": "#ffffff",
        "opacity": 100,
        "width": 460,
        "borderRadius": 20,
        "borderWidth": 1,
        "borderColor": "#e2e8f0",
        "shadowEnabled": True,
        "blurEnabled": False,
        "padding": 40
    },
    "typography": {
        "fontFamily": "Inter, sans-serif",
        "titleColor": "#0f172a",
        "subtitleColor": "#64748b",
        "bodyColor": "#334155",
        "labelColor": "#475569",
        "titleSize": 32,
        "subtitleSize": 15,
        "titleWeight": "700"
    },
    "button": {
        "backgroundType": "solid",
        "backgroundColor": "#2563eb",
        "gradientStart": "#2563eb",
        "gradientEnd": "#4f46e5",
        "textColor": "#ffffff",
        "borderRadius": 10,
        "height": 48,
        "shadow": True
    },
    "social": {
        "enabled": True,
        "dividerText": "or continue with",
        "providers": {
            "google": True,
            "apple": True,
            "github": True
        },
        "layout": "horizontal"
    },
    "pages": {
        "login": {
            "title": "Welcome back",
            "subtitle": "Sign in to continue to your account",
            "buttonText": "Sign In",
            "emailEnabled": True,
            "passwordEnabled": True
        }
    }
}


def repair_database():
    print("=" * 60)
    print("RUNNING DATABASE CONFIGURATION REPAIR")
    print("=" * 60)

    users = AuthUser.objects.filter(is_active=True).order_by("id")
    print(f"Found {users.count()} active accounts in auth_user.")

    repaired_count = 0
    created_count = 0

    with transaction.atomic():
        for user in users:
            user_configs = AuthConfiguration.objects.filter(user_id=user.id, is_active=True).order_by("-updated_at")
            count = user_configs.count()

            if count == 0:
                # Create a fresh canonical active configuration for this user
                new_cfg = AuthConfiguration.objects.create(
                    user=user,
                    configuration_name=f"{user.username}'s Auth Experience",
                    landing_url="https://customerwebsite.com",
                    redirect_url="/dashboard",
                    configuration_data=DEFAULT_CANONICAL_CONFIG,
                    is_active=True
                )
                created_count += 1
                print(f"  [CREATED] User ID {user.id} ({user.username}): Created active Config #{new_cfg.id}")

            elif count > 1:
                # Keep the primary (most recent) configuration, deactivate older duplicates
                primary = user_configs.first()
                duplicates = user_configs.exclude(id=primary.id)
                duplicates.update(is_active=False)
                repaired_count += 1
                print(f"  [REPAIRED] User ID {user.id} ({user.username}): Maintained Config #{primary.id}, deactivated {duplicates.count()} duplicates")

            else:
                primary = user_configs.first()
                print(f"  [OK] User ID {user.id} ({user.username}): Active Config #{primary.id}")

    print("=" * 60)
    print(f"REPAIR COMPLETED: {created_count} configurations created, {repaired_count} duplicates deactivated.")
    print("=" * 60)

    # Final DB Verification
    print("\nCURRENT ACTIVE CONFIGURATIONS IN DB:")
    for cfg in AuthConfiguration.objects.filter(is_active=True).order_by("user_id"):
        print(f"  Config ID: {cfg.id} | User ID: {cfg.user_id} | Name: {cfg.configuration_name} | Updated: {cfg.updated_at}")


if __name__ == "__main__":
    repair_database()
