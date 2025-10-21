"""
Views for Accounts App - FIXED VERSION
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from .models import OTP, UserAddress
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    UserLoginSerializer,
    OTPVerifySerializer,
    OTPSendSerializer,
    ChangePasswordSerializer,
    UserAddressSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    """User Registration"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully. Please verify your phone number.",
                    "phone_number": user.phone_number,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User Login - FIXED"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User Logout"""

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Logged out successfully"})
        except Exception:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )


class SendOTPView(APIView):
    """Send OTP to phone number"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPSendSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "OTP sent successfully", "expires_in": 300}  # 5 minutes
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """Verify OTP"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            otp = serializer.validated_data["otp"]
            phone_number = serializer.validated_data["phone_number"]

            # Mark OTP as used
            otp.mark_as_used()

            # Verify user
            try:
                user = User.objects.get(phone_number=phone_number)
                user.is_verified = True
                user.save()

                # Generate tokens
                refresh = RefreshToken.for_user(user)

                return Response(
                    {
                        "message": "Phone verified successfully",
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "user": UserSerializer(user).data,
                    }
                )
            except User.DoesNotExist:
                return Response(
                    {"message": "Phone verified. Please complete registration."}
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """Request password reset OTP - NEW"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data["phone_number"]

            # Generate code
            code = str(random.randint(100000, 999999))

            # Create OTP
            OTP.objects.create(
                phone_number=phone_number,
                code=code,
                expires_at=timezone.now() + timedelta(minutes=5),
            )

            # TODO: Send SMS
            # send_sms(phone_number, f"Your password reset code is: {code}")

            return Response(
                {"message": "Reset code sent to your phone", "expires_in": 300}
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """Reset password with OTP - NEW"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data["phone_number"]
            new_password = serializer.validated_data["new_password"]
            otp = serializer.validated_data["otp"]

            # Mark OTP as used
            otp.mark_as_used()

            # Update password
            try:
                user = User.objects.get(phone_number=phone_number)
                user.set_password(new_password)
                user.save()

                return Response({"message": "Password reset successfully"})
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """Get current user info"""

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UpdateProfileView(APIView):
    """Update user profile"""

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password"""

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response({"message": "Password changed successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAddressListCreateView(generics.ListCreateAPIView):
    """List and create user addresses"""

    serializer_class = UserAddressSerializer

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update and delete user address"""

    serializer_class = UserAddressSerializer

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)
