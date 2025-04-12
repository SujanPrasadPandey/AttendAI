# backend/attendance/urls.py
from django.urls import path
from .views import (
    AttendanceRecordListCreateAPIView,
    AttendanceRecordDetailAPIView,
    StudentAttendanceListAPIView,
)

urlpatterns = [
    path('records/', AttendanceRecordListCreateAPIView.as_view(), name='attendance-records-list-create'),
    path('records/<int:pk>/', AttendanceRecordDetailAPIView.as_view(), name='attendance-records-detail'),
    path('students/<int:student_id>/records/', StudentAttendanceListAPIView.as_view(), name='student-attendance-list'),
]