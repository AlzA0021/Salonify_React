"""
Serializers for Accounts App
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import random
from .models import User, OTP, UserAddress


class UserSerializer(serializers.ModelSerializer):
    """User Serializer"""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'first_name', 'last_name',
            'full_name', 'user_type', 'gender', 'date_of_birth',
            'avatar', 'is_verified', 'date_joined'
        ]
        read_only_fields = ['id', 'phone_number', 'user_type', 'is_verified', 'date_joined']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserRegisterSerializer(serializers.Serializer):
    """User Registration Serializer"""
    
    phone_number = serializers.RegexField(
        regex=r'^09\d{9}$',
        error_messages={
            'invalid': 'Phone number must be in format: 09xxxxxxxxx'
        }
    )
    first_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    
    def validate_phone_number(self, value):
        """Check if phone number already exists"""
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value
    
    def validate_email(self, value):
        """Check if email already exists"""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def create(self, validated_data):
        """Create new user"""
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Send OTP for verification
        self._send_otp(user.phone_number)
        
        return user
    
    def _send_otp(self, phone_number):
        """Generate and send OTP"""
        # Generate 6-digit code
        code = str(random.randint(100000, 999999))
        
        # Create OTP
        OTP.objects.create(
            phone_number=phone_number,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=5)
        )
        
        # TODO: Send SMS with code
        # send_sms(phone_number, f"Your verification code is: {code}")


class UserLoginSerializer(serializers.Serializer):
    """User Login Serializer"""
    
    phone_number = serializers.RegexField(
        regex=r'^09\d{9}$',
        error_messages={
            'invalid': 'Phone number must be in format: 09xxxxxxxxx'
        }
    )
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate credentials"""
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')
        
        user = authenticate(username=phone_number, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        
        attrs['user'] = user
        return attrs


class OTPVerifySerializer(serializers.Serializer):
    """OTP Verification Serializer"""
    
    phone_number = serializers.RegexField(
        regex=r'^09\d{9}$',
        error_messages={
            'invalid': 'Phone number must be in format: 09xxxxxxxxx'
        }
    )
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        """Validate OTP"""
        phone_number = attrs.get('phone_number')
        code = attrs.get('code')
        
        try:
            otp = OTP.objects.filter(
                phone_number=phone_number,
                code=code,
                is_used=False
            ).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired OTP.")
        
        if not otp.is_valid():
            raise serializers.ValidationError("OTP has expired.")
        
        attrs['otp'] = otp
        return attrs


class OTPSendSerializer(serializers.Serializer):
    """Send OTP Serializer"""
    
    phone_number = serializers.RegexField(
        regex=r'^09\d{9}$',
        error_messages={
            'invalid': 'Phone number must be in format: 09xxxxxxxxx'
        }
    )
    
    def create(self, validated_data):
        """Generate and send OTP"""
        phone_number = validated_data['phone_number']
        
        # Check rate limiting - max 3 OTPs per 30 minutes
        recent_otps = OTP.objects.filter(
            phone_number=phone_number,
            created_at__gte=timezone.now() - timedelta(minutes=30)
        ).count()
        
        if recent_otps >= 3:
            raise serializers.ValidationError(
                "Too many OTP requests. Please try again later."
            )
        
        # Generate code
        code = str(random.randint(100000, 999999))
        
        # Create OTP
        otp = OTP.objects.create(
            phone_number=phone_number,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=5)
        )
        
        # TODO: Send SMS
        # send_sms(phone_number, f"Your verification code is: {code}")
        
        return otp


class ChangePasswordSerializer(serializers.Serializer):
    """Change Password Serializer"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate passwords"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    def validate_old_password(self, value):
        """Check old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class UserAddressSerializer(serializers.ModelSerializer):
    """User Address Serializer"""
    
    class Meta:
        model = UserAddress
        fields = [
            'id', 'title', 'address', 'city', 'state',
            'postal_code', 'latitude', 'longitude',
            'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
