from django.urls import path
from .views import LeaveRequestCreateView, LeaveRequestListView, LeaveRequestUpdateView

urlpatterns = [
    path('create/', LeaveRequestCreateView.as_view(), name='leave-request-create'),
    path('list/', LeaveRequestListView.as_view(), name='leave-request-list'),
    path('update/<int:pk>/', LeaveRequestUpdateView.as_view(), name='leave-request-update'),
]
