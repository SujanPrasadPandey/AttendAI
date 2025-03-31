# school_data/views.py
from rest_framework import generics
from .models import SchoolClass, Subject, TeacherProfile
from .serializers import SchoolClassSerializer, SubjectSerializer, TeacherProfileSerializer
from rest_framework.permissions import IsAdminUser

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
    permission_classes = [IsAdminUser]  # Restrict to admins

class TeacherProfileRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAdminUser]  # Restrict to admins