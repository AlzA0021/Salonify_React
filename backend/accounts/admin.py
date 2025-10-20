from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP, UserAddress


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['phone_number', 'email', 'first_name', 'last_name', 'user_type', 'is_active', 'is_verified']
    list_filter = ['user_type', 'is_active', 'is_verified', 'is_staff']
    search_fields = ['phone_number', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'gender', 'date_of_birth', 'avatar')}),
        ('User Type', {'fields': ('user_type',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2', 'user_type'),
        }),
    )


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'code', 'is_used', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['phone_number', 'code']
    ordering = ['-created_at']


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'city', 'is_default']
    list_filter = ['is_default', 'city']
    search_fields = ['user__phone_number', 'address', 'city']
