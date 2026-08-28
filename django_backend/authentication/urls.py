from django.urls import path
from authentication.views import RegisterView, LoginView, LogoutView, MeView

urlpatterns = [
    path("register", RegisterView.as_view(), name="auth-register"),
    path("register/", RegisterView.as_view(), name="auth-register-slash"),
    path("signup", RegisterView.as_view(), name="auth-signup"),
    path("signup/", RegisterView.as_view(), name="auth-signup-slash"),
    path("login", LoginView.as_view(), name="auth-login"),
    path("login/", LoginView.as_view(), name="auth-login-slash"),
    path("logout", LogoutView.as_view(), name="auth-logout"),
    path("logout/", LogoutView.as_view(), name="auth-logout-slash"),
    path("me", MeView.as_view(), name="auth-me"),
    path("me/", MeView.as_view(), name="auth-me-slash"),
]

