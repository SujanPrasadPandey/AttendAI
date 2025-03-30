from enum import Enum
from rest_framework import serializers
from .models import TeacherClassAccess

# Define a custom enum for teacher access status.
class TeacherAccessStatusEnum(Enum):
    pending = 'pending'
    approved = 'approved'
    denied = 'denied'

class TeacherAccessRequestSerializer(serializers.ModelSerializer):
    # Use the custom enum for the status field.
    status = serializers.ChoiceField(
        choices=[(tag.value, tag.name) for tag in TeacherAccessStatusEnum]
    )

    class Meta:
        model = TeacherClassAccess
        fields = '__all__'
