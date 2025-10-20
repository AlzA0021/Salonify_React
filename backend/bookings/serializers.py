"""
Booking Serializers
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Booking, BookingHistory
from businesses.models import Business, Staff
from services.models import Service
from accounts.models import User


class BookingCustomerSerializer(serializers.ModelSerializer):
    """Customer info in booking"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'first_name', 'last_name', 'full_name', 'avatar']


class BookingBusinessSerializer(serializers.ModelSerializer):
    """Business info in booking"""
    
    class Meta:
        model = Business
        fields = ['id', 'name', 'slug', 'logo', 'phone', 'address']


class BookingServiceSerializer(serializers.ModelSerializer):
    """Service info in booking"""
    
    class Meta:
        model = Service
        fields = ['id', 'name', 'duration_minutes', 'price', 'final_price', 'image']


class BookingStaffSerializer(serializers.ModelSerializer):
    """Staff info in booking"""
    
    class Meta:
        model = Staff
        fields = ['id', 'name', 'gender', 'avatar', 'title']


class BookingListSerializer(serializers.ModelSerializer):
    """Booking List Serializer"""
    
    business = BookingBusinessSerializer(read_only=True)
    service = BookingServiceSerializer(read_only=True)
    staff = BookingStaffSerializer(read_only=True)
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'business', 'service', 'staff',
            'date', 'time', 'end_time', 'status',
            'final_price', 'is_paid', 'can_cancel',
            'created_at'
        ]
    
    def get_can_cancel(self, obj):
        """Check if booking can be cancelled"""
        return obj.can_be_cancelled()


class BookingDetailSerializer(serializers.ModelSerializer):
    """Booking Detail Serializer"""
    
    customer = BookingCustomerSerializer(read_only=True)
    business = BookingBusinessSerializer(read_only=True)
    service = BookingServiceSerializer(read_only=True)
    staff = BookingStaffSerializer(read_only=True)
    can_cancel = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'business', 'service', 'staff',
            'date', 'time', 'end_time', 'duration_minutes',
            'service_price', 'final_price', 'discount_amount',
            'status', 'notes', 'is_cancelled', 'cancelled_at',
            'cancelled_by', 'cancellation_reason', 'is_paid',
            'paid_at', 'payment_method', 'can_cancel', 'has_review',
            'created_at', 'confirmed_at', 'completed_at'
        ]
    
    def get_can_cancel(self, obj):
        """Check if booking can be cancelled"""
        return obj.can_be_cancelled()
    
    def get_has_review(self, obj):
        """Check if booking has review"""
        return hasattr(obj, 'review')


class BookingCreateSerializer(serializers.Serializer):
    """Booking Create Serializer"""
    
    business = serializers.IntegerField()
    service = serializers.IntegerField()
    staff = serializers.IntegerField(required=False, allow_null=True)
    date = serializers.DateField()
    time = serializers.TimeField()
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_date(self, value):
        """Validate booking date"""
        today = timezone.now().date()
        
        if value < today:
            raise serializers.ValidationError("Cannot book for past dates.")
        
        return value
    
    def validate(self, attrs):
        """Validate booking data"""
        # Validate business
        try:
            business = Business.objects.get(id=attrs['business'])
            if not business.is_active or business.status != 'approved':
                raise serializers.ValidationError({
                    'business': 'This business is not available for booking.'
                })
            attrs['business_obj'] = business
        except Business.DoesNotExist:
            raise serializers.ValidationError({'business': 'Business not found.'})
        
        # Validate service
        try:
            service = Service.objects.get(
                id=attrs['service'],
                business=business,
                is_active=True
            )
            attrs['service_obj'] = service
        except Service.DoesNotExist:
            raise serializers.ValidationError({'service': 'Service not found.'})
        
        # Validate staff
        if attrs.get('staff'):
            try:
                staff = Staff.objects.get(
                    id=attrs['staff'],
                    business=business,
                    is_active=True,
                    can_accept_bookings=True
                )
                attrs['staff_obj'] = staff
            except Staff.DoesNotExist:
                raise serializers.ValidationError({'staff': 'Staff not found.'})
        else:
            attrs['staff_obj'] = None
        
        # Check if booking date is within allowed advance booking days
        max_date = timezone.now().date() + timedelta(days=business.booking_advance_days)
        if attrs['date'] > max_date:
            raise serializers.ValidationError({
                'date': f'Cannot book more than {business.booking_advance_days} days in advance.'
            })
        
        # Check if time slot is available
        booking_datetime = timezone.make_aware(
            datetime.combine(attrs['date'], attrs['time'])
        )
        
        # Check for overlapping bookings
        end_time = (
            datetime.combine(attrs['date'], attrs['time']) +
            timedelta(minutes=service.duration_minutes)
        ).time()
        
        overlapping = Booking.objects.filter(
            business=business,
            date=attrs['date'],
            status__in=['pending', 'confirmed'],
            is_cancelled=False
        ).filter(
            models.Q(time__lt=end_time, end_time__gt=attrs['time'])
        )
        
        if attrs.get('staff_obj'):
            overlapping = overlapping.filter(staff=attrs['staff_obj'])
        
        if overlapping.exists():
            raise serializers.ValidationError({
                'time': 'This time slot is not available.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create booking"""
        business = validated_data['business_obj']
        service = validated_data['service_obj']
        staff = validated_data.get('staff_obj')
        
        # Calculate end time
        start_datetime = datetime.combine(
            validated_data['date'],
            validated_data['time']
        )
        end_datetime = start_datetime + timedelta(minutes=service.duration_minutes)
        
        # Create booking
        booking = Booking.objects.create(
            customer=self.context['request'].user,
            business=business,
            service=service,
            staff=staff,
            date=validated_data['date'],
            time=validated_data['time'],
            end_time=end_datetime.time(),
            duration_minutes=service.duration_minutes,
            service_price=service.price,
            final_price=service.final_price,
            discount_amount=service.price - service.final_price,
            notes=validated_data.get('notes', ''),
            status='confirmed' if business.auto_confirm_booking else 'pending'
        )
        
        # Create booking history
        BookingHistory.objects.create(
            booking=booking,
            status=booking.status,
            notes='Booking created',
            changed_by=self.context['request'].user
        )
        
        return booking


class BookingCancelSerializer(serializers.Serializer):
    """Booking Cancel Serializer"""
    
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validate cancellation"""
        booking = self.instance
        
        if not booking.can_be_cancelled():
            raise serializers.ValidationError(
                "This booking cannot be cancelled. Cancellation deadline has passed."
            )
        
        return attrs
    
    def save(self):
        """Cancel booking"""
        booking = self.instance
        booking.cancel(
            cancelled_by='customer',
            reason=self.validated_data.get('reason', '')
        )
        
        # Create booking history
        BookingHistory.objects.create(
            booking=booking,
            status='cancelled',
            notes=self.validated_data.get('reason', 'Cancelled by customer'),
            changed_by=self.context['request'].user
        )
        
        return booking


class BookingStatusUpdateSerializer(serializers.Serializer):
    """Booking Status Update Serializer (for partners)"""
    
    status = serializers.ChoiceField(choices=[
        'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    ])
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def save(self):
        """Update booking status"""
        booking = self.instance
        old_status = booking.status
        new_status = self.validated_data['status']
        
        booking.status = new_status
        
        if new_status == 'confirmed':
            booking.confirmed_at = timezone.now()
        elif new_status == 'completed':
            booking.completed_at = timezone.now()
        elif new_status == 'cancelled':
            booking.is_cancelled = True
            booking.cancelled_at = timezone.now()
            booking.cancelled_by = 'business'
        
        booking.save()
        
        # Create booking history
        BookingHistory.objects.create(
            booking=booking,
            status=new_status,
            notes=self.validated_data.get('notes', f'Status changed from {old_status} to {new_status}'),
            changed_by=self.context['request'].user
        )
        
        return booking


from django.db import models
