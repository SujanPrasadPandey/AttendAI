# school_data/urls.py
from django.urls import path
from .views import (
    SchoolClassListCreateAPIView, 
    SchoolClassRetrieveUpdateDestroyAPIView,
    SubjectListCreateAPIView,
    SubjectRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path('classes/', SchoolClassListCreateAPIView.as_view(), name='schoolclass-list-create'),
    path('classes/<int:pk>/', SchoolClassRetrieveUpdateDestroyAPIView.as_view(), name='schoolclass-detail'),
    path('subjects/', SubjectListCreateAPIView.as_view(), name='subject-list-create'),
    path('subjects/<int:pk>/', SubjectRetrieveUpdateDestroyAPIView.as_view(), name='subject-detail'),
]
