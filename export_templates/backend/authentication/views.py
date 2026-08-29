from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from authentication.serializers import UserRegisterSerializer, UserLoginSerializer
from authentication.services.otp_service import OTPService
from authentication.services.redirect_service import resolve_redirect_url

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "message": "Invalid registration data.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "User registered successfully.", "redirect_url": resolve_redirect_url(request.data)}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "message": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"success": True, "message": "Login successful.", "redirect_url": resolve_redirect_url(request.data)}, status=status.HTTP_200_OK)

class SendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        return Response({"success": True, "message": "OTP request successful. Development mode is active.", "otp_code": "123456"}, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        ident = request.data.get("identifier", "")
        otp = request.data.get("otp", "")
        is_valid, msg, user = OTPService.verify_otp(ident, otp)
        if not is_valid:
            return Response({"success": False, "message": msg}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"success": True, "message": "OTP verified successfully.", "redirect_url": resolve_redirect_url(request.data)}, status=status.HTTP_200_OK)
