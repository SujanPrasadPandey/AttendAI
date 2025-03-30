# school_data/urls.py
from django.urls import path
from .views import SchoolClassListAPIView

urlpatterns = [
    path('classes/', SchoolClassListAPIView.as_view(), name='schoolclass-list'),
]
