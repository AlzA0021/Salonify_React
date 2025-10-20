"""
Booking Models
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from businesses.models import Business, Staff
from services.models import Service


class Booking(models.Model):
    """Booking Model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    CANCELLATION_BY_CHOICES = [
        ('customer', 'Customer'),
        ('business', 'Business'),
        ('system', 'System'),
    ]
    
    # Relations
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='bookings'
    )
    staff = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    
    # Booking Details
    date = models.DateField()
    time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField()
    
    # Pricing
    service_price = models.DecimalField(max_digits=10, decimal_places=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=0)
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        default=0
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Customer Notes
    notes = models.TextField(blank=True)
    
    # Cancellation
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.CharField(
        max_length=20,
        choices=CANCELLATION_BY_CHOICES,
        null=True,
        blank=True
    )
    cancellation_reason = models.TextField(blank=True)
    
    # Payment
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    
    # Notifications
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['customer', '-date']),
            models.Index(fields=['business', 'date', 'status']),
            models.Index(fields=['staff', 'date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Booking #{self.id} - {self.customer.phone_number} - {self.date} {self.time}"
    
    def save(self, *args, **kwargs):
        # Calculate end time if not set
        if not self.end_time:
            from datetime import datetime, timedelta
            start = datetime.combine(self.date, self.time)
            end = start + timedelta(minutes=self.duration_minutes)
            self.end_time = end.time()
        
        # Set prices if not set
        if not self.service_price:
            self.service_price = self.service.price
        if not self.final_price:
            self.final_price = self.service.final_price
            self.discount_amount = self.service_price - self.final_price
        
        super().save(*args, **kwargs)
    
    def can_be_cancelled(self):
        """Check if booking can be cancelled"""
        if self.is_cancelled or self.status in ['completed', 'no_show']:
            return False
        
        # Check if within cancellation deadline
        booking_datetime = timezone.make_aware(
            timezone.datetime.combine(self.date, self.time)
        )
        deadline_hours = self.business.cancellation_deadline_hours
        deadline = booking_datetime - timedelta(hours=deadline_hours)
        
        return timezone.now() < deadline
    
    def cancel(self, cancelled_by='customer', reason=''):
        """Cancel the booking"""
        if not self.can_be_cancelled():
            raise ValueError("Booking cannot be cancelled")
        
        self.is_cancelled = True
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.cancelled_by = cancelled_by
        self.cancellation_reason = reason
        self.save()
    
    def confirm(self):
        """Confirm the booking"""
        if self.status == 'pending':
            self.status = 'confirmed'
            self.confirmed_at = timezone.now()
            self.save()
    
    def complete(self):
        """Mark booking as completed"""
        if self.status in ['confirmed', 'in_progress']:
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()
            
            # Update service stats
            self.service.total_bookings += 1
            self.service.save(update_fields=['total_bookings'])
            
            # Update business stats
            self.business.total_bookings += 1
            self.business.save(update_fields=['total_bookings'])


class BookingHistory(models.Model):
    """Booking Status History"""
    
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='history'
    )
    status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'booking_history'
        verbose_name = 'Booking History'
        verbose_name_plural = 'Booking Histories'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.booking.id} - {self.status}"


class TimeSlot(models.Model):
    """Available Time Slot Model (for blocking specific times)"""
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='time_slots'
    )
    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='time_slots'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    reason = models.CharField(max_length=200, blank=True)
    
    class Meta:
        db_table = 'time_slots'
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.business.name} - {self.date} {self.start_time}-{self.end_time}"
