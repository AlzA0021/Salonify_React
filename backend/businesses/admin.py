from django.contrib import admin
from .models import Business, BusinessImage, Staff, StaffSchedule, StaffLeave, Category, City, Area


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'name_en']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'province', 'is_active']
    list_filter = ['province', 'is_active']
    search_fields = ['name', 'name_en']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'is_active']
    list_filter = ['city', 'is_active']
    search_fields = ['name', 'name_en']
    prepopulated_fields = {'slug': ('name',)}


class BusinessImageInline(admin.TabularInline):
    model = BusinessImage
    extra = 1


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'city', 'category', 'status', 'average_rating', 'is_featured', 'is_active']
    list_filter = ['status', 'is_featured', 'is_active', 'category', 'city']
    search_fields = ['name', 'owner__phone_number']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [BusinessImageInline]


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'business', 'gender', 'title', 'is_active', 'can_accept_bookings']
    list_filter = ['business', 'gender', 'is_active', 'can_accept_bookings']
    search_fields = ['name', 'business__name']
