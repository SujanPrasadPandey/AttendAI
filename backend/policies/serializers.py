from rest_framework import serializers
from .models import AttendancePolicy

class AttendancePolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendancePolicy
        fields = '__all__'
