"""
Review Models
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
from businesses.models import Business
from bookings.models import Booking


class Review(models.Model):
    """Review Model"""
    
    # Relations
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    booking = models.OneToOneField(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='review'
    )
    
    # Rating (1-5)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Detailed Ratings
    service_quality = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    cleanliness = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    staff_behavior = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    value_for_money = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    
    # Review Content
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    
    # Moderation
    is_approved = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)  # Verified purchase/booking
    
    # Business Response
    response = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Helpful Count
    helpful_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['business', '-created_at']),
            models.Index(fields=['customer']),
        ]
        unique_together = ['customer', 'booking']
    
    def __str__(self):
        return f"Review by {self.customer.phone_number} for {self.business.name}"
    
    def save(self, *args, **kwargs):
        # Mark as verified if linked to a booking
        if self.booking and self.booking.status == 'completed':
            self.is_verified = True
        
        super().save(*args, **kwargs)
        
        # Update business rating
        self.business.update_stats()


class ReviewImage(models.Model):
    """Review Image Model"""
    
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='reviews/')
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'review_images'
        ordering = ['id']
    
    def __str__(self):
        return f"Image for Review #{self.review.id}"


class ReviewHelpful(models.Model):
    """Track users who found review helpful"""
    
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='helpful_votes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'review_helpful'
        unique_together = ['review', 'user']
    
    def __str__(self):
        return f"{self.user.phone_number} found Review #{self.review.id} helpful"
