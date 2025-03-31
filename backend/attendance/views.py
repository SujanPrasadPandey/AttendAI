# backend/attendance/views.py
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer
import django_filters.rest_framework as df_filters

class AttendanceRecordFilter(df_filters.FilterSet):
    school_class = df_filters.NumberFilter(field_name='student__studentprofile__school_class')

    class Meta:
        model = AttendanceRecord
        fields = ['date', 'status', 'school_class']

class AttendanceRecordListCreateAPIView(generics.ListCreateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AttendanceRecordFilter

class AttendanceRecordDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer