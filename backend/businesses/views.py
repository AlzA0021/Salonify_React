"""
Business Views (Customer Facing) - FIXED VERSION
"""

from rest_framework import generics, filters, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, timedelta

from .models import Business, Staff, Category, City, Area
from .serializers import (
    BusinessListSerializer,
    BusinessDetailSerializer,
    CategorySerializer,
    CitySerializer,
    AreaSerializer,
    StaffSerializer,
)
from services.models import Service
from services.serializers import ServiceListSerializer
from reviews.models import Review
from reviews.serializers import ReviewListSerializer


class CategoryListView(generics.ListAPIView):
    """List all categories"""

    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CityListView(generics.ListAPIView):
    """List all cities"""

    queryset = City.objects.filter(is_active=True)
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]


class AreaListView(generics.ListAPIView):
    """List areas by city"""

    serializer_class = AreaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        city_id = self.kwargs.get("city_id")
        return Area.objects.filter(city_id=city_id, is_active=True)


class BusinessListView(generics.ListAPIView):
    """Search and list businesses - FIXED"""

    serializer_class = BusinessListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "city", "area", "gender_target"]
    search_fields = ["name", "description"]
    ordering_fields = ["average_rating", "total_bookings", "created_at"]
    ordering = ["-is_featured", "-average_rating"]

    def get_queryset(self):
        queryset = Business.objects.filter(
            is_active=True, status="approved", allow_online_booking=True
        )

        # Handle 'q' parameter for search
        search_query = self.request.query_params.get("q")
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )

        # Handle 'sort' parameter (custom sorting)
        sort_param = self.request.query_params.get("sort")
        if sort_param:
            if sort_param == "popular":
                queryset = queryset.order_by("-total_bookings", "-average_rating")
            elif sort_param == "rating":
                queryset = queryset.order_by("-average_rating", "-total_reviews")
            elif sort_param == "newest":
                queryset = queryset.order_by("-created_at")
            elif sort_param == "price_low":
                queryset = queryset.order_by("services__price")
            elif sort_param == "price_high":
                queryset = queryset.order_by("-services__price")

        # Handle 'featured' parameter
        featured = self.request.query_params.get("featured")
        if featured == "true":
            queryset = queryset.filter(is_featured=True)

        # Filter by min rating
        min_rating = self.request.query_params.get("min_rating")
        if min_rating:
            try:
                queryset = queryset.filter(average_rating__gte=float(min_rating))
            except (ValueError, TypeError):
                pass

        # Filter by price range
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        if min_price or max_price:
            service_filters = Q(services__is_active=True)
            if min_price:
                try:
                    service_filters &= Q(services__price__gte=int(min_price))
                except (ValueError, TypeError):
                    pass
            if max_price:
                try:
                    service_filters &= Q(services__price__lte=int(max_price))
                except (ValueError, TypeError):
                    pass
            queryset = queryset.filter(service_filters).distinct()

        # Apply distinct to avoid duplicates
        queryset = queryset.distinct()

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Handle 'limit' parameter
        limit = self.request.query_params.get("limit")
        if limit:
            try:
                queryset = queryset[: int(limit)]
            except (ValueError, TypeError):
                pass

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class BusinessDetailView(generics.RetrieveAPIView):
    """Get business detail"""

    queryset = Business.objects.filter(is_active=True, status="approved")
    serializer_class = BusinessDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"


class BusinessServicesView(generics.ListAPIView):
    """List business services"""

    serializer_class = ServiceListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business_id = self.kwargs.get("business_id")
        return Service.objects.filter(business_id=business_id, is_active=True).order_by(
            "-is_popular", "order", "name"
        )


class BusinessStaffView(generics.ListAPIView):
    """List business staff"""

    serializer_class = StaffSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business_id = self.kwargs.get("business_id")
        return Staff.objects.filter(
            business_id=business_id, is_active=True, can_accept_bookings=True
        )


class BusinessReviewsView(generics.ListAPIView):
    """List business reviews"""

    serializer_class = ReviewListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["rating", "created_at", "helpful_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        business_id = self.kwargs.get("business_id")
        return Review.objects.filter(business_id=business_id, is_approved=True)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def get_available_slots(request, business_id):
    """Get available time slots for booking"""
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response(
            {"error": "Business not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Get parameters
    service_id = request.query_params.get("service")
    staff_id = request.query_params.get("staff")
    date_str = request.query_params.get("date")

    if not service_id or not date_str:
        return Response(
            {"error": "service and date are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        service = Service.objects.get(id=service_id, business=business)
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except (Service.DoesNotExist, ValueError):
        return Response(
            {"error": "Invalid service or date"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Get staff if specified
    staff = None
    if staff_id:
        try:
            staff = Staff.objects.get(id=staff_id, business=business)
        except Staff.DoesNotExist:
            return Response(
                {"error": "Invalid staff"}, status=status.HTTP_400_BAD_REQUEST
            )

    # Generate time slots
    from bookings.models import Booking

    slots = []
    slot_duration = business.slot_duration_minutes
    service_duration = service.duration_minutes

    # Get business hours
    start_time = business.opens_at
    end_time = business.closes_at

    # Check if date is closed
    weekday = booking_date.weekday()
    if weekday in business.closed_days:
        return Response({"slots": []})

    # Generate all possible slots
    current_time = datetime.combine(booking_date, start_time)
    end_datetime = datetime.combine(booking_date, end_time)

    while current_time < end_datetime:
        slot_end = current_time + timedelta(minutes=service_duration)

        # Check if slot is within business hours
        if slot_end.time() <= end_time:
            # Check for existing bookings
            overlapping = Booking.objects.filter(
                business=business,
                date=booking_date,
                status__in=["pending", "confirmed"],
                is_cancelled=False,
                time__lt=slot_end.time(),
                end_time__gt=current_time.time(),
            )

            if staff:
                overlapping = overlapping.filter(staff=staff)

            is_available = not overlapping.exists()

            slots.append(
                {"time": current_time.strftime("%H:%M"), "available": is_available}
            )

        current_time += timedelta(minutes=slot_duration)

    return Response({"slots": slots})
