"""
Service Models
"""
from django.db import models
from django.core.validators import MinValueValidator
from businesses.models import Business, Category


class ServiceCategory(models.Model):
    """Service Category Model (e.g., Hair, Nails, Makeup)"""
    
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='service_categories'
    )
    name = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='service_categories/', null=True, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'service_categories'
        verbose_name = 'Service Category'
        verbose_name_plural = 'Service Categories'
        ordering = ['order', 'name']
        unique_together = ['category', 'slug']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"


class Service(models.Model):
    """Service Model"""
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
    ]
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='services'
    )
    service_category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='services'
    )
    
    # Basic Info
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        validators=[MinValueValidator(0)]
    )
    discounted_price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Duration
    duration_minutes = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Service duration in minutes"
    )
    
    # Gender Restriction
    gender_target = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        default='unisex'
    )
    
    # Media
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    
    # Settings
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    # Stats
    total_bookings = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'services'
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['-is_popular', 'order', 'name']
        indexes = [
            models.Index(fields=['business', 'is_active']),
            models.Index(fields=['service_category']),
        ]
    
    def __str__(self):
        return f"{self.business.name} - {self.name}"
    
    @property
    def final_price(self):
        """Return discounted price if available, otherwise regular price"""
        return self.discounted_price if self.discounted_price else self.price
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.discounted_price and self.price > 0:
            return int(((self.price - self.discounted_price) / self.price) * 100)
        return 0


class ServiceStaff(models.Model):
    """Many-to-Many relationship between Service and Staff"""
    
    service = models.ForeignKey(
        'Service',
        on_delete=models.CASCADE,
        related_name='service_staff'
    )
    staff = models.ForeignKey(
        'businesses.Staff',
        on_delete=models.CASCADE,
        related_name='staff_services'
    )
    is_specialist = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'service_staff'
        unique_together = ['service', 'staff']
    
    def __str__(self):
        return f"{self.service.name} - {self.staff.name}"
