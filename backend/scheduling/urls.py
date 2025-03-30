from django.urls import path
from .views import DayOffListCreateAPIView, RoutineEntryListCreateAPIView

urlpatterns = [
    path('dayoffs/', DayOffListCreateAPIView.as_view(), name='dayoff-list'),
    path('routines/', RoutineEntryListCreateAPIView.as_view(), name='routine-list'),
]
