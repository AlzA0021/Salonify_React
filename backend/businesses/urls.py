"""
Business URLs (Customer Facing)
"""
from django.urls import path
from .views import (
    CategoryListView,
    BusinessListView,
    BusinessDetailView,
    BusinessServicesView,
    BusinessStaffView,
    BusinessReviewsView,
    get_available_slots
)

app_name = 'businesses'

urlpatterns = [
    # Business URLs
    path('', BusinessListView.as_view(), name='business_list'),
    path('<int:id>/', BusinessDetailView.as_view(), name='business_detail'),
    path('<int:business_id>/services/', BusinessServicesView.as_view(), name='business_services'),
    path('<int:business_id>/staff/', BusinessStaffView.as_view(), name='business_staff'),
    path('<int:business_id>/reviews/', BusinessReviewsView.as_view(), name='business_reviews'),
    path('<int:business_id>/available-slots/', get_available_slots, name='available_slots'),
]
