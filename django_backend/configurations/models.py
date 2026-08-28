from django.db import models
from authentication.models import AuthUser


class AuthConfiguration(models.Model):
    """
    Model mapping to existing MySQL `auth_configurations` table.
    Stores the full customization JSON for Auth Page Builder.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        AuthUser,
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="configurations"
    )
    configuration_name = models.CharField(max_length=255)
    landing_url = models.TextField(null=True, blank=True)
    redirect_url = models.TextField(null=True, blank=True)
    configuration_data = models.JSONField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "auth_configurations"
        managed = False
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.configuration_name} (User: {self.user_id})"
