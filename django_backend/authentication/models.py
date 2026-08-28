from django.db import models
from django.utils import timezone


class AuthUser(models.Model):
    """
    Model mapping to existing MySQL `auth_user` table.
    """
    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=150, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")
    email = models.CharField(max_length=254, unique=True)
    mobile = models.CharField(max_length=20, null=True, blank=True)
    password = models.CharField(max_length=128)
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auth_user"
        managed = False

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return f"{self.username} ({self.email})"


class AuthOTP(models.Model):
    """
    Model mapping to `auth_otps` table for secure, single-use, rate-limited OTPs.
    """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        AuthUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column="user_id",
        related_name="otps"
    )
    identifier = models.CharField(max_length=255)
    purpose = models.CharField(max_length=50, default="login")
    otp_hash = models.CharField(max_length=255)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempt_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auth_otps"
        managed = False
        ordering = ["-created_at"]

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP({self.identifier}, purpose={self.purpose}, used={self.is_used})"
