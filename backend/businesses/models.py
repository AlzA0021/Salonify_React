"""
Business Models
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from accounts.models import User


class Category(models.Model):
    """Business Category Model"""
    
    name = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='categories/', null=True, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class City(models.Model):
    """City Model"""
    
    name = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100)
    province = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'cities'
        verbose_name = 'City'
        verbose_name_plural = 'Cities'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Area(models.Model):
    """Area/District Model"""
    
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='areas')
    name = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'areas'
        verbose_name = 'Area'
        verbose_name_plural = 'Areas'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.city.name} - {self.name}"


class Business(models.Model):
    """Business/Salon Model"""
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    # Owner
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='businesses'
    )
    
    # Basic Info
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='businesses'
    )
    
    # Target Gender
    gender_target = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        default='unisex'
    )
    
    # Location
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True)
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Contact
    phone = models.CharField(max_length=11)
    whatsapp = models.CharField(max_length=11, blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    telegram = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    
    # Media
    logo = models.ImageField(upload_to='businesses/logos/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='businesses/covers/', null=True, blank=True)
    
    # Business Hours
    opens_at = models.TimeField(default='09:00')
    closes_at = models.TimeField(default='21:00')
    closed_days = models.JSONField(default=list, blank=True)  # [0, 6] for Saturday, Friday
    
    # Settings
    booking_advance_days = models.IntegerField(default=30)
    cancellation_deadline_hours = models.IntegerField(default=24)
    slot_duration_minutes = models.IntegerField(default=30)
    allow_online_booking = models.BooleanField(default=True)
    auto_confirm_booking = models.BooleanField(default=False)
    
    # Stats
    total_bookings = models.IntegerField(default=0)
    total_reviews = models.IntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'businesses'
        verbose_name = 'Business'
        verbose_name_plural = 'Businesses'
        ordering = ['-is_featured', '-average_rating', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['city', 'area']),
            models.Index(fields=['category']),
            models.Index(fields=['-average_rating']),
        ]
    
    def __str__(self):
        return self.name
    
    def update_stats(self):
        """Update business statistics"""
        from reviews.models import Review
        
        reviews = Review.objects.filter(business=self, is_approved=True)
        self.total_reviews = reviews.count()
        
        if self.total_reviews > 0:
            self.average_rating = reviews.aggregate(
                models.Avg('rating')
            )['rating__avg']
        else:
            self.average_rating = 0.0
        
        self.save(update_fields=['total_reviews', 'average_rating'])


class BusinessImage(models.Model):
    """Business Image Gallery"""
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='businesses/gallery/')
    caption = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'business_images'
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"{self.business.name} - Image {self.id}"


class Staff(models.Model):
    """Staff Member Model"""
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='staff_members'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_profiles'
    )
    
    # Basic Info
    name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone = models.CharField(max_length=11, blank=True)
    avatar = models.ImageField(upload_to='staff/', null=True, blank=True)
    bio = models.TextField(blank=True)
    
    # Professional Info
    title = models.CharField(max_length=100, blank=True)  # e.g., Senior Stylist
    experience_years = models.IntegerField(default=0)
    specialties = models.JSONField(default=list, blank=True)  # List of specialty IDs
    
    # Settings
    is_active = models.BooleanField(default=True)
    can_accept_bookings = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'staff'
        verbose_name = 'Staff'
        verbose_name_plural = 'Staff'
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.business.name} - {self.name}"


class StaffSchedule(models.Model):
    """Staff Schedule Model"""
    
    WEEKDAY_CHOICES = [
        (0, 'Saturday'),
        (1, 'Sunday'),
        (2, 'Monday'),
        (3, 'Tuesday'),
        (4, 'Wednesday'),
        (5, 'Thursday'),
        (6, 'Friday'),
    ]
    
    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'staff_schedules'
        unique_together = ['staff', 'weekday']
        ordering = ['weekday', 'start_time']
    
    def __str__(self):
        return f"{self.staff.name} - {self.get_weekday_display()}"


class StaffLeave(models.Model):
    """Staff Leave/Time Off Model"""
    
    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name='leaves'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'staff_leaves'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.staff.name} - {self.start_date} to {self.end_date}"
