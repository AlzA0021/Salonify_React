"""
Service Category URLs
"""
from django.urls import path
from businesses.views import CategoryListView

app_name = 'services'

urlpatterns = [
    path('', CategoryListView.as_view(), name='category_list'),
]
