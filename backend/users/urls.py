from django.urls import path
from .views import (
    CreateUserView,
    VerifyEmailView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordChangeView,
    UpdateEmailView,
    AdminUserViewSet,
    UserProfileView,
    ProfilePictureUploadView,
    ResendVerificationEmailView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter

app_name = 'users'

urlpatterns = [
    path('register/', CreateUserView.as_view(), name="register"),
    path('verify-email/', VerifyEmailView.as_view(), name="verify-email"),
    path('resend-verification-email/', ResendVerificationEmailView.as_view(), name="resend-verification-email"),

    path('request-reset/', PasswordResetRequestView.as_view(), name="password-reset-request"),
    path('reset-password-confirm/', PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path('change-password/', PasswordChangeView.as_view(), name="password-change"),

    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),

    path('update-email/', UpdateEmailView.as_view(), name='update-email'),

    path('me/', UserProfileView.as_view(), name="profile"),
    path('me/upload-profile-picture/', ProfilePictureUploadView.as_view(), name="upload-profile-picture"),
]

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns += router.urls
