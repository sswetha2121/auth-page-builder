from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_status = "disconnected"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_status = "connected"
        except Exception:
            db_status = "disconnected"

        return Response(
            {
                "status": "ok",
                "backend": "django",
                "database": db_status,
            }
        )


urlpatterns = [
    path("api/health", HealthCheckView.as_view(), name="api-health"),
    path("api/health/", HealthCheckView.as_view(), name="api-health-slash"),
    path("api/auth/", include("authentication.urls")),
    path("api/auth", include("authentication.urls")),
    path("api/configurations/", include("configurations.urls")),
    path("api/configurations", include("configurations.urls")),
]
