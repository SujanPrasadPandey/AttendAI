from rest_framework import generics
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer

# This view will allow listing all attendance records and creating new ones.
class AttendanceRecordListCreateAPIView(generics.ListCreateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
