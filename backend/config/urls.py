"""
Main URL Configuration for Salonify Backend
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Salonify API",
        default_version='v1',
        description="API Documentation for Salonify - Beauty Salon Booking System",
        terms_of_service="https://www.salonify.com/terms/",
        contact=openapi.Contact(email="contact@salonify.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/businesses/', include('businesses.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/categories/', include('services.urls')),
    path('api/locations/', include('businesses.urls_locations')),
    path('api/partner/', include('businesses.urls_partner')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
