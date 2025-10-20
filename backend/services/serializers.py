"""
Service Serializers
"""
from rest_framework import serializers
from .models import Service, ServiceCategory, ServiceStaff
from businesses.models import Staff


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Service Category Serializer"""
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'name_en', 'slug', 'description', 'icon']


class ServiceStaffSerializer(serializers.ModelSerializer):
    """Service Staff Serializer"""
    
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    staff_avatar = serializers.ImageField(source='staff.avatar', read_only=True)
    
    class Meta:
        model = ServiceStaff
        fields = ['id', 'staff', 'staff_name', 'staff_avatar', 'is_specialist']


class ServiceListSerializer(serializers.ModelSerializer):
    """Service List Serializer"""
    
    category = ServiceCategorySerializer(source='service_category', read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'category',
            'price', 'discounted_price', 'final_price',
            'discount_percentage', 'duration_minutes',
            'gender_target', 'image', 'is_popular',
            'total_bookings'
        ]


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Service Detail Serializer"""
    
    category = ServiceCategorySerializer(source='service_category', read_only=True)
    available_staff = ServiceStaffSerializer(source='service_staff', many=True, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'category',
            'price', 'discounted_price', 'final_price',
            'discount_percentage', 'duration_minutes',
            'gender_target', 'image', 'is_popular',
            'total_bookings', 'available_staff', 'created_at'
        ]


class ServiceCreateSerializer(serializers.ModelSerializer):
    """Service Create/Update Serializer (for partners)"""
    
    staff_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Service
        fields = [
            'name', 'description', 'service_category',
            'price', 'discounted_price', 'duration_minutes',
            'gender_target', 'image', 'is_popular',
            'is_active', 'order', 'staff_ids'
        ]
    
    def validate(self, attrs):
        """Validate service data"""
        if attrs.get('discounted_price'):
            if attrs['discounted_price'] >= attrs['price']:
                raise serializers.ValidationError({
                    'discounted_price': 'Discounted price must be less than regular price.'
                })
        return attrs
    
    def create(self, validated_data):
        """Create service with staff assignments"""
        staff_ids = validated_data.pop('staff_ids', [])
        service = Service.objects.create(**validated_data)
        
        # Assign staff to service
        if staff_ids:
            for staff_id in staff_ids:
                try:
                    staff = Staff.objects.get(
                        id=staff_id,
                        business=service.business
                    )
                    ServiceStaff.objects.create(service=service, staff=staff)
                except Staff.DoesNotExist:
                    pass
        
        return service
    
    def update(self, instance, validated_data):
        """Update service and staff assignments"""
        staff_ids = validated_data.pop('staff_ids', None)
        
        # Update service fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update staff assignments if provided
        if staff_ids is not None:
            # Remove existing assignments
            ServiceStaff.objects.filter(service=instance).delete()
            
            # Add new assignments
            for staff_id in staff_ids:
                try:
                    staff = Staff.objects.get(
                        id=staff_id,
                        business=instance.business
                    )
                    ServiceStaff.objects.create(service=instance, staff=staff)
                except Staff.DoesNotExist:
                    pass
        
        return instance
