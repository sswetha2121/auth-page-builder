import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ["DJANGO_SETTINGS_MODULE"] = "auth_page_builder_backend.settings"
django.setup()

from django.db import connection
from authentication.models import AuthUser, AuthOTP
from configurations.models import AuthConfiguration, AuthConfigurationHistory

def ensure_tables_and_schema():
    print("============================================================")
    print("CREATING & VERIFYING MYSQL TABLES FOR DJANGO MODELS")
    print("============================================================\n")

    with connection.schema_editor() as schema_editor:
        for model in [AuthUser, AuthOTP, AuthConfiguration, AuthConfigurationHistory]:
            try:
                schema_editor.create_model(model)
                print(f"[SUCCESS] Created table for {model.__name__}")
            except Exception as e:
                print(f"[INFO] Table for {model.__name__} existing state: {e}")

    with connection.cursor() as cursor:
        for tbl in ["auth_configurations", "auth_configuration_history"]:
            try:
                cursor.execute(f"DESCRIBE {tbl};")
                columns = cursor.fetchall()
                print(f"\nCurrent columns in {tbl}:")
                for col in columns:
                    print(f"  - {col[0]} ({col[1]}), Nullable: {col[2]}")
            except Exception as e:
                print(f"[INFO] Could not describe {tbl}: {e}")

    print("\n============================================================")
    print("MYSQL SCHEMA PREPARATION COMPLETE!")
    print("============================================================")

if __name__ == "__main__":
    ensure_tables_and_schema()
