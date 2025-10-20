"""
Booking Views
"""
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Booking
from .serializers import (
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCreateSerializer,
    BookingCancelSerializer
)


class MyBookingsView(generics.ListAPIView):
    """List customer's bookings"""
    serializer_class = BookingListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'date']
    
    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).order_by('-date', '-time')


class BookingDetailView(generics.RetrieveAPIView):
    """Get booking detail"""
    serializer_class = BookingDetailSerializer
    
    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user)


class BookingCreateView(generics.CreateAPIView):
    """Create new booking"""
    serializer_class = BookingCreateSerializer
    
    def perform_create(self, serializer):
        booking = serializer.save()
        
        # TODO: Send confirmation notification
        # send_booking_confirmation(booking)
        
        return booking


@api_view(['POST'])
def cancel_booking(request, pk):
    """Cancel a booking"""
    try:
        booking = Booking.objects.get(pk=pk, customer=request.user)
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = BookingCancelSerializer(
        booking,
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Booking cancelled successfully',
            'booking': BookingDetailSerializer(booking).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def rate_booking(request, pk):
    """Rate a completed booking"""
    from reviews.serializers import ReviewCreateSerializer
    
    try:
        booking = Booking.objects.get(
            pk=pk,
            customer=request.user,
            status='completed'
        )
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found or not completed'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if already reviewed
    if hasattr(booking, 'review'):
        return Response(
            {'error': 'This booking has already been reviewed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = ReviewCreateSerializer(
        data=request.data,
        context={'request': request, 'booking': booking}
    )
    
    if serializer.is_valid():
        review = serializer.save()
        return Response({
            'message': 'Review submitted successfully',
            'review_id': review.id
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
