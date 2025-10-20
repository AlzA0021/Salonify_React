"""
Location URLs
"""
from django.urls import path
from .views import CityListView, AreaListView, CategoryListView

app_name = 'locations'

urlpatterns = [
    path('cities/', CityListView.as_view(), name='city_list'),
    path('cities/<int:city_id>/areas/', AreaListView.as_view(), name='area_list'),
]
