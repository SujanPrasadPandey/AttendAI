from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls', namespace='users')),
    path('api-auth/', include('rest_framework.urls')),

    path('api/school_data/', include('school_data.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/scheduling/', include('scheduling.urls')),
    path('api/facial_recognition/', include('facial_recognition.urls')),
    path('api/teacher_access/', include('teacher_access.urls')),
    path('api/leave_requests/', include('leave_requests.urls')),
    path('api/policies/', include('policies.urls')),
    path('api/audit/', include('audit.urls')),
    
    # drf-spectacular endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
