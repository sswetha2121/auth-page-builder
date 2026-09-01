from django.db import models
from authentication.models import AuthUser


class AuthConfiguration(models.Model):
    """
    Model mapping to `auth_configurations` table.
    Stores full customization JSON for Auth Page Builder.
    Supports both registered users (user_id) and anonymous sessions (builder_session_id).
    """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        AuthUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column="user_id",
        related_name="configurations"
    )
    builder_session_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
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
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(is_active=True, user__isnull=False),
                name="one_active_configuration_per_user"
            )
        ]

    def __str__(self):
        owner = f"User: {self.user_id}" if self.user_id else f"Session: {self.builder_session_id}"
        return f"{self.configuration_name} ({owner})"


class AuthConfigurationHistory(models.Model):
    """
    Model mapping to `auth_configuration_history` table.
    Stores versioned snapshot history of Auth Configurations for audit and restore.
    """
    id = models.AutoField(primary_key=True)
    configuration = models.ForeignKey(
        AuthConfiguration,
        on_delete=models.CASCADE,
        db_column="configuration_id",
        related_name="history_snapshots"
    )
    user = models.ForeignKey(
        AuthUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="user_id",
        related_name="configuration_snapshots"
    )
    version_number = models.IntegerField(default=1)
    configuration_data = models.JSONField()
    change_source = models.CharField(max_length=100, default="manual_save")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auth_configuration_history"
        ordering = ["-version_number", "-created_at"]

    def __str__(self):
        return f"Config #{self.configuration_id} v{self.version_number} ({self.change_source})"
