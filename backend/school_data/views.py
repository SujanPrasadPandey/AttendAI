# school_data/views.py
from rest_framework import generics
from .models import SchoolClass, Subject
from .serializers import SchoolClassSerializer, SubjectSerializer

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
