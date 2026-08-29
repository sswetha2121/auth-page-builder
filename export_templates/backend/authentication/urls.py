from django.urls import path
from authentication.views import RegisterView, LoginView, SendOTPView, VerifyOTPView

urlpatterns = [
    path("register", RegisterView.as_view(), name="auth-register"),
    path("login", LoginView.as_view(), name="auth-login"),
    path("otp/send-email", SendOTPView.as_view(), name="otp-send"),
    path("otp/verify", VerifyOTPView.as_view(), name="otp-verify"),
]
