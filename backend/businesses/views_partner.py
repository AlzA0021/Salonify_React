"""
Partner Views (Business Owner Panel)
"""
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import timedelta
from businesses.models import Business, Staff
from businesses.serializers import (
    BusinessDetailSerializer,
    BusinessCreateSerializer,
    StaffSerializer,
    StaffCreateSerializer
)
from services.models import Service
from services.serializers import ServiceListSerializer, ServiceCreateSerializer
from bookings.models import Booking
from bookings.serializers import (
    BookingListSerializer,
    BookingDetailSerializer,
    BookingStatusUpdateSerializer
)


class IsBusinessOwner(permissions.BasePermission):
    """Check if user is business owner"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'business_owner'


class PartnerDashboardStatsView(generics.GenericAPIView):
    """Get dashboard statistics"""
    permission_classes = [IsBusinessOwner]
    
    def get(self, request):
        try:
            business = Business.objects.get(owner=request.user)
        except Business.DoesNotExist:
            return Response(
                {'error': 'Business not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Date range
        period = request.query_params.get('period', 'month')  # week, month, year
        
        if period == 'week':
            start_date = timezone.now() - timedelta(days=7)
        elif period == 'year':
            start_date = timezone.now() - timedelta(days=365)
        else:  # month
            start_date = timezone.now() - timedelta(days=30)
        
        # Get bookings in period
        bookings = Booking.objects.filter(
            business=business,
            created_at__gte=start_date
        )
        
        # Calculate stats
        total_bookings = bookings.count()
        completed_bookings = bookings.filter(status='completed').count()
        cancelled_bookings = bookings.filter(is_cancelled=True).count()
        pending_bookings = bookings.filter(status='pending').count()
        
        # Revenue
        total_revenue = bookings.filter(
            status='completed'
        ).aggregate(total=Sum('final_price'))['total'] or 0
        
        # Average rating
        avg_rating = business.average_rating
        
        # Today's bookings
        today = timezone.now().date()
        today_bookings = Booking.objects.filter(
            business=business,
            date=today,
            is_cancelled=False
        ).count()
        
        return Response({
            'total_bookings': total_bookings,
            'completed_bookings': completed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'pending_bookings': pending_bookings,
            'total_revenue': float(total_revenue),
            'average_rating': float(avg_rating),
            'today_bookings': today_bookings,
            'period': period
        })


class PartnerRecentBookingsView(generics.ListAPIView):
    """Get recent bookings"""
    serializer_class = BookingListSerializer
    permission_classes = [IsBusinessOwner]
    
    def get_queryset(self):
        try:
            business = Business.objects.get(owner=self.request.user)
            return Booking.objects.filter(business=business).order_by('-created_at')[:10]
        except Business.DoesNotExist:
            return Booking.objects.none()


class PartnerBusinessView(generics.RetrieveUpdateAPIView):
    """Get/Update business profile"""
    permission_classes = [IsBusinessOwner]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BusinessDetailSerializer
        return BusinessCreateSerializer
    
    def get_object(self):
        return Business.objects.get(owner=self.request.user)


class PartnerBookingsView(generics.ListAPIView):
    """List all bookings"""
    serializer_class = BookingListSerializer
    permission_classes = [IsBusinessOwner]
    
    def get_queryset(self):
        try:
            business = Business.objects.get(owner=self.request.user)
            queryset = Booking.objects.filter(business=business)
            
            # Filter by status
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            # Filter by date
            date = self.request.query_params.get('date')
            if date:
                queryset = queryset.filter(date=date)
            
            return queryset.order_by('-date', '-time')
        except Business.DoesNotExist:
            return Booking.objects.none()


class PartnerBookingDetailView(generics.RetrieveAPIView):
    """Get booking detail"""
    serializer_class = BookingDetailSerializer
    permission_classes = [IsBusinessOwner]
    
    def get_queryset(self):
        try:
            business = Business.objects.get(owner=self.request.user)
            return Booking.objects.filter(business=business)
        except Business.DoesNotExist:
            return Booking.objects.none()


@api_view(['PATCH'])
def update_booking_status(request, pk):
    """Update booking status"""
    try:
        business = Business.objects.get(owner=request.user)
        booking = Booking.objects.get(pk=pk, business=business)
    except (Business.DoesNotExist, Booking.DoesNotExist):
        return Response(
            {'error': 'Booking not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = BookingStatusUpdateSerializer(
        booking,
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Booking status updated successfully',
            'booking': BookingDetailSerializer(booking).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PartnerServicesView(generics.ListCreateAPIView):
    """List/Create services"""
    permission_classes = [IsBusinessOwner]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceCreateSerializer
        return ServiceListSerializer
    
    def get_queryset(self):
        try:
            business = Business.objects.get(owner=self.request.user)
            return Service.objects.filter(business=business)
        except Business.DoesNotExist:
            return Service.objects.none()
    
    def perform_create(self, serializer):
        business = Business.objects.get(owner=self.request.user)
        serializer.save(business=business)


class PartnerServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get/Update/Delete service"""
    permission_classes = [IsBusinessOwner]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ServiceCreateSerializer
        return ServiceListSerializer
    
    def get_queryset(self):
        try:
            business = Business.objects.get(owner=self.request.user)
            return Service.objects.filter(business=business)
        except Business.DoesNotExist:
            return Service.objects.none()


class PartnerStaffView(generics.ListCreateAPIView):
    """List/Create staff"""
    permission_classes = [IsBusinessOwner]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StaffCreateSerializer
        return StaffSerializer
    
    def get_queryset(self):
        try:
            business = Business.objects.get(owner=self.request.user)
            return Staff.objects.filter(business=business)
        except Business.DoesNotExist:
            return Staff.objects.none()
    
    def perform_create(self, serializer):
        business = Business.objects.get(owner=self.request.user)
        serializer.save(business=business)


class PartnerStaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get/Update/Delete staff"""
    serializer_class = StaffCreateSerializer
    permission_classes = [IsBusinessOwner]
    
    def get_queryset(self):
        try:
            business = Business.objects.get(owner=self.request.user)
            return Staff.objects.filter(business=business)
        except Business.DoesNotExist:
            return Staff.objects.none()


@api_view(['GET'])
def partner_calendar(request):
    """Get calendar events"""
    try:
        business = Business.objects.get(owner=request.user)
    except Business.DoesNotExist:
        return Response(
            {'error': 'Business not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get date range
    start_date = request.query_params.get('start')
    end_date = request.query_params.get('end')
    
    if not start_date or not end_date:
        return Response(
            {'error': 'start and end dates are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get bookings
    bookings = Booking.objects.filter(
        business=business,
        date__gte=start_date,
        date__lte=end_date,
        is_cancelled=False
    ).select_related('customer', 'service', 'staff')
    
    # Format for calendar
    events = []
    for booking in bookings:
        events.append({
            'id': booking.id,
            'title': f"{booking.service.name} - {booking.customer.get_full_name()}",
            'start': f"{booking.date}T{booking.time}",
            'end': f"{booking.date}T{booking.end_time}",
            'status': booking.status,
            'customer': booking.customer.phone_number,
            'service': booking.service.name,
            'staff': booking.staff.name if booking.staff else None,
        })
    
    return Response({'events': events})
