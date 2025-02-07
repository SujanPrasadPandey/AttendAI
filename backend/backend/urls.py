from django.contrib import admin
from django.urls import path, include
from users.views import (
    CreateUserView,
    UserListView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordChangeView,
    VerifyEmailView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import UserListView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', CreateUserView.as_view(), name="register"),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path('users/', UserListView.as_view(), name="user-list"),
    path('api/user/verify-email/', VerifyEmailView.as_view(), name="verify-email"),
    path('api/user/request-reset/', PasswordResetRequestView.as_view(), name="password-reset-request"),
    path('api/user/reset-password-confirm/', PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path('api/user/change-password/', PasswordChangeView.as_view(), name="password-change"),
]