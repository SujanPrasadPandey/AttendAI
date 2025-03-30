from rest_framework import serializers
from .models import DayOff, RoutineEntry

class DayOffSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayOff
        fields = '__all__'

class RoutineEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutineEntry
        fields = '__all__'
