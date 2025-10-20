"""
Booking URLs
"""
from django.urls import path
from .views import (
    MyBookingsView,
    BookingDetailView,
    BookingCreateView,
    cancel_booking,
    rate_booking
)

app_name = 'bookings'

urlpatterns = [
    # Customer Booking URLs
    path('', BookingCreateView.as_view(), name='create_booking'),
    path('my-bookings/', MyBookingsView.as_view(), name='my_bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    path('<int:pk>/cancel/', cancel_booking, name='cancel_booking'),
    path('<int:pk>/rate/', rate_booking, name='rate_booking'),
]
