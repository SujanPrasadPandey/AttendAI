from django.urls import path
from .views import (
    CreateUserView,
    UserListView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordChangeView,
    VerifyEmailView,
    UpdateEmailView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', CreateUserView.as_view(), name="register"),
    path('verify-email/', VerifyEmailView.as_view(), name="verify-email"),
    path('request-reset/', PasswordResetRequestView.as_view(), name="password-reset-request"),
    path('reset-password-confirm/', PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path('change-password/', PasswordChangeView.as_view(), name="password-change"),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('update-email/', UpdateEmailView.as_view(), name='update-email'),
]
