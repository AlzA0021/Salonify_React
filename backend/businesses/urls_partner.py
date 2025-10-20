"""
Partner URLs (Business Owner Panel)
"""
from django.urls import path
from .views_partner import (
    PartnerDashboardStatsView,
    PartnerRecentBookingsView,
    PartnerBusinessView,
    PartnerBookingsView,
    PartnerBookingDetailView,
    update_booking_status,
    PartnerServicesView,
    PartnerServiceDetailView,
    PartnerStaffView,
    PartnerStaffDetailView,
    partner_calendar
)
from accounts.views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView
)

app_name = 'partner'

urlpatterns = [
    # Auth
    path('auth/login/', LoginView.as_view(), name='partner_login'),
    path('auth/logout/', LogoutView.as_view(), name='partner_logout'),
    path('auth/me/', CurrentUserView.as_view(), name='partner_me'),
    path('auth/business/', PartnerBusinessView.as_view(), name='partner_business'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='partner_change_password'),
    
    # Dashboard
    path('dashboard/stats/', PartnerDashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/recent-bookings/', PartnerRecentBookingsView.as_view(), name='recent_bookings'),
    
    # Bookings
    path('bookings/', PartnerBookingsView.as_view(), name='bookings'),
    path('bookings/<int:pk>/', PartnerBookingDetailView.as_view(), name='booking_detail'),
    path('bookings/<int:pk>/status/', update_booking_status, name='update_booking_status'),
    
    # Calendar
    path('calendar/', partner_calendar, name='calendar'),
    
    # Services
    path('services/', PartnerServicesView.as_view(), name='services'),
    path('services/<int:pk>/', PartnerServiceDetailView.as_view(), name='service_detail'),
    
    # Staff
    path('staff/', PartnerStaffView.as_view(), name='staff'),
    path('staff/<int:pk>/', PartnerStaffDetailView.as_view(), name='staff_detail'),
]
