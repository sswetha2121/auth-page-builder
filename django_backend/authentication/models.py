from django.db import models


class AuthUser(models.Model):
    """
    Model mapping to existing MySQL `auth_user` table.
    """
    id = models.BigAutoField(primary_key=True)
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
