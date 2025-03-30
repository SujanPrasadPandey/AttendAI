from django.urls import path
from .views import (
    EnrollFaceView,
    BatchEnrollFaceView,
    MarkAttendanceView,
    ReviewFaceListView,
    UnrecognizedFaceListView,
    ReviewFaceAssignmentView
)

urlpatterns = [
    path('enroll/', EnrollFaceView.as_view(), name='enroll-face'),
    path('batch-enroll/', BatchEnrollFaceView.as_view(), name='batch-enroll-face'),
    path('mark/', MarkAttendanceView.as_view(), name='mark-attendance'),
    # New review endpoints:
    path('review/list/', ReviewFaceListView.as_view(), name='review-face-list'),
    path('unrecognized/list/', UnrecognizedFaceListView.as_view(), name='unrecognized-face-list'),
    path('review/assign/', ReviewFaceAssignmentView.as_view(), name='review-face-assign'),
]
