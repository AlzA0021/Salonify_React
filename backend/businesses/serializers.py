"""
Business Serializers
"""
from rest_framework import serializers
from .models import Business, BusinessImage, Staff, StaffSchedule, Category, City, Area
from services.models import Service
from reviews.models import Review


class CategorySerializer(serializers.ModelSerializer):
    """Category Serializer"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'name_en', 'slug', 'description', 'icon']


class CitySerializer(serializers.ModelSerializer):
    """City Serializer"""
    
    class Meta:
        model = City
        fields = ['id', 'name', 'name_en', 'slug', 'province']


class AreaSerializer(serializers.ModelSerializer):
    """Area Serializer"""
    
    city = CitySerializer(read_only=True)
    
    class Meta:
        model = Area
        fields = ['id', 'name', 'name_en', 'slug', 'city']


class BusinessImageSerializer(serializers.ModelSerializer):
    """Business Image Serializer"""
    
    class Meta:
        model = BusinessImage
        fields = ['id', 'image', 'caption', 'order']


class StaffScheduleSerializer(serializers.ModelSerializer):
    """Staff Schedule Serializer"""
    
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)
    
    class Meta:
        model = StaffSchedule
        fields = ['id', 'weekday', 'weekday_display', 'start_time', 'end_time', 'is_available']


class StaffSerializer(serializers.ModelSerializer):
    """Staff Serializer"""
    
    schedules = StaffScheduleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Staff
        fields = [
            'id', 'name', 'gender', 'avatar', 'bio', 'title',
            'experience_years', 'specialties', 'is_active',
            'can_accept_bookings', 'schedules'
        ]


class BusinessListSerializer(serializers.ModelSerializer):
    """Business List Serializer (for list views)"""
    
    category = CategorySerializer(read_only=True)
    city = CitySerializer(read_only=True)
    area = AreaSerializer(read_only=True)
    distance = serializers.SerializerMethodField()
    
    class Meta:
        model = Business
        fields = [
            'id', 'slug', 'name', 'logo', 'cover_image',
            'category', 'city', 'area', 'address',
            'gender_target', 'average_rating', 'total_reviews',
            'total_bookings', 'is_featured', 'opens_at',
            'closes_at', 'distance'
        ]
    
    def get_distance(self, obj):
        """Calculate distance from user location (if provided)"""
        # This would calculate distance based on user's location
        # For now, return None
        return None


class BusinessDetailSerializer(serializers.ModelSerializer):
    """Business Detail Serializer (for detail view)"""
    
    category = CategorySerializer(read_only=True)
    city = CitySerializer(read_only=True)
    area = AreaSerializer(read_only=True)
    images = BusinessImageSerializer(many=True, read_only=True)
    staff_members = StaffSerializer(many=True, read_only=True)
    
    class Meta:
        model = Business
        fields = [
            'id', 'slug', 'name', 'description', 'logo', 'cover_image',
            'category', 'city', 'area', 'address', 'latitude', 'longitude',
            'phone', 'whatsapp', 'instagram', 'telegram', 'website',
            'gender_target', 'opens_at', 'closes_at', 'closed_days',
            'average_rating', 'total_reviews', 'total_bookings',
            'is_featured', 'allow_online_booking', 'auto_confirm_booking',
            'booking_advance_days', 'cancellation_deadline_hours',
            'slot_duration_minutes', 'images', 'staff_members', 'created_at'
        ]


class BusinessCreateSerializer(serializers.ModelSerializer):
    """Business Create/Update Serializer (for partners)"""
    
    class Meta:
        model = Business
        fields = [
            'name', 'description', 'category', 'city', 'area',
            'address', 'latitude', 'longitude', 'phone', 'whatsapp',
            'instagram', 'telegram', 'website', 'gender_target',
            'logo', 'cover_image', 'opens_at', 'closes_at',
            'closed_days', 'booking_advance_days',
            'cancellation_deadline_hours', 'slot_duration_minutes',
            'allow_online_booking', 'auto_confirm_booking'
        ]
    
    def validate_phone(self, value):
        """Validate phone number"""
        if not value.startswith('09') or len(value) != 11:
            raise serializers.ValidationError(
                "Phone number must be in format: 09xxxxxxxxx"
            )
        return value


class StaffCreateSerializer(serializers.ModelSerializer):
    """Staff Create/Update Serializer"""
    
    class Meta:
        model = Staff
        fields = [
            'name', 'gender', 'phone', 'avatar', 'bio',
            'title', 'experience_years', 'specialties',
            'is_active', 'can_accept_bookings', 'order'
        ]
