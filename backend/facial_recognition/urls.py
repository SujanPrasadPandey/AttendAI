from django.urls import path
from .views import (
    EnrollFaceView,
    RemoveFaceImageView,
    StudentFaceImagesView,
    MarkAttendanceView,
    UnrecognizedFaceListView,
    AssignUnrecognizedFaceView,
    ReviewFaceListView,
    ConfirmReviewFaceView,
)

urlpatterns = [
    path('enroll/', EnrollFaceView.as_view(), name='enroll-face'),
    path('remove-image/<int:pk>/', RemoveFaceImageView.as_view(), name='remove-face-image'),
    path('student/<int:student_id>/images/', StudentFaceImagesView.as_view(), name='student-face-images'),
    path('mark/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('unrecognized/list/', UnrecognizedFaceListView.as_view(), name='unrecognized-face-list'),
    path('unrecognized/assign/', AssignUnrecognizedFaceView.as_view(), name='assign-unrecognized-face'),
    path('review/list/', ReviewFaceListView.as_view(), name='review-face-list'),
    path('review/confirm/', ConfirmReviewFaceView.as_view(), name='confirm-review-face'),
]