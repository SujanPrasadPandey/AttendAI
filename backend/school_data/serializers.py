# school_data/serializers.py
from rest_framework import serializers
from .models import SchoolClass

class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = '__all__'
