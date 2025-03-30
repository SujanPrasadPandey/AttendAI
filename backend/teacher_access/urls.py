from django.urls import path
from .views import (
    RequestTeacherAccessView,
    ListTeacherAccessRequestsView,
    UpdateTeacherAccessRequestView
)

urlpatterns = [
    path('request/', RequestTeacherAccessView.as_view(), name='request-teacher-access'),
    path('list/', ListTeacherAccessRequestsView.as_view(), name='list-teacher-access'),
    path('update/<int:pk>/', UpdateTeacherAccessRequestView.as_view(), name='update-teacher-access'),
]
