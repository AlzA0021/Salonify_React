"""
URLs for Accounts App - FIXED VERSION
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    SendOTPView,
    VerifyOTPView,
    ForgotPasswordView,
    ResetPasswordView,
    CurrentUserView,
    UpdateProfileView,
    ChangePasswordView,
    UserAddressListCreateView,
    UserAddressDetailView,
)

app_name = "accounts"

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # OTP
    path("send-otp/", SendOTPView.as_view(), name="send_otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify_otp"),
    # Password Reset - NEW
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    # User Profile
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("profile/", UpdateProfileView.as_view(), name="update_profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    # Addresses
    path("addresses/", UserAddressListCreateView.as_view(), name="address_list"),
    path("addresses/<int:pk>/", UserAddressDetailView.as_view(), name="address_detail"),
]
