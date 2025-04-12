from enum import Enum
from rest_framework import serializers
from .models import LeaveRequest

# Define a custom enum for leave request status.
class LeaveStatusEnum(Enum):
    pending = 'pending'
    approved = 'approved'
    denied = 'denied'

class LeaveRequestSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    # Use the custom enum for the status field.
    status = serializers.ChoiceField(
        choices=[(tag.value, tag.name) for tag in LeaveStatusEnum],
        read_only=True
    )

    class Meta:
        model = LeaveRequest
        fields = '__all__'
