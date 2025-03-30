from django.urls import path
from .views import RetrievePolicyView, UpdatePolicyView

urlpatterns = [
    path('get/', RetrievePolicyView.as_view(), name='get-policy'),
    path('update/', UpdatePolicyView.as_view(), name='update-policy'),
]
