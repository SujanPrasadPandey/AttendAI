# school_data/views.py
from rest_framework import generics
from .models import SchoolClass, Subject, TeacherProfile, StudentProfile
from .serializers import SchoolClassSerializer, SubjectSerializer, TeacherProfileSerializer, StudentProfileSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from .permissions import TeacherOrAdminPermission
from django_filters.rest_framework import DjangoFilterBackend

# SchoolClass views
class SchoolClassListCreateAPIView(generics.ListCreateAPIView):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer

class SchoolClassRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer

# Subject views
class SubjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class SubjectRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

# TeacherProfile views
class TeacherProfileListCreateAPIView(generics.ListCreateAPIView):
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']

class TeacherProfileRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAdminUser]

# StudentProfile views
class StudentProfileListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school_class']

class StudentProfileRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer