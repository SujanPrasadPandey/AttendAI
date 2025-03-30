# school_data/views.py
from rest_framework import generics
from .models import SchoolClass
from .serializers import SchoolClassSerializer

class SchoolClassListAPIView(generics.ListAPIView):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer
