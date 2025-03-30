from rest_framework import generics
from .models import AuditLog
from .serializers import AuditLogSerializer
from rest_framework.permissions import IsAuthenticated

class AuditLogListAPIView(generics.ListAPIView):
    """
    API endpoint to list all audit log entries.
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
