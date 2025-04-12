from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import AttendanceRecord
from rest_framework.permissions import IsAuthenticated
from .permissions import TeacherOrAdminPermission
from .serializers import AttendanceRecordSerializer
import django_filters.rest_framework as df_filters
from django.shortcuts import get_object_or_404
from school_data.models import StudentProfile

class AttendanceRecordFilter(df_filters.FilterSet):
    school_class = df_filters.NumberFilter(field_name='student__school_class')

    class Meta:
        model = AttendanceRecord
        fields = ['date', 'status', 'school_class']

class AttendanceRecordListCreateAPIView(generics.ListCreateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AttendanceRecordFilter
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]

class AttendanceRecordDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]

class StudentAttendanceListAPIView(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'status']

    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(StudentProfile, id=student_id)
        user = self.request.user

        # Permission logic
        if user.role == 'student' and user.studentprofile == student:
            # Student viewing their own records
            return AttendanceRecord.objects.filter(student=student)
        elif user.role == 'teacher' and student.school_class in user.teacherprofile.classes.all():
            # Teacher viewing a student in their class
            return AttendanceRecord.objects.filter(student=student)
        elif user.role == 'parent' and student in user.parentprofile.children.all():
            # Parent viewing their child's records
            return AttendanceRecord.objects.filter(student=student)
        elif user.role == 'admin':
            # Admin can view any student's records
            return AttendanceRecord.objects.filter(student=student)
        else:
            # Deny access
            return AttendanceRecord.objects.none()