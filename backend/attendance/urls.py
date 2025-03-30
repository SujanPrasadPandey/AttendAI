from django.urls import path
from .views import AttendanceRecordListCreateAPIView

urlpatterns = [
    path('records/', AttendanceRecordListCreateAPIView.as_view(), name='attendance-record-list'),
]
