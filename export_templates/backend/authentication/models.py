from django.db import models

class AuthUser(models.Model):
    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=150, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.CharField(max_length=254, unique=True)
    mobile = models.CharField(max_length=20, null=True, blank=True)
    password = models.CharField(max_length=128)
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auth_user"

    def __str__(self):
        return f"{self.username} ({self.email})"
