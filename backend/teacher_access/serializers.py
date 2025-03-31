from enum import Enum
from rest_framework import serializers
from .models import TeacherClassAccess

# Define a custom enum for teacher access status.
class TeacherAccessStatusEnum(Enum):
    pending = 'pending'
    approved = 'approved'
    denied = 'denied'

class TeacherAccessRequestSerializer(serializers.ModelSerializer):
    teacher_username = serializers.CharField(source='teacher.user.username', read_only=True)
    school_class_name = serializers.CharField(source='school_class.name', read_only=True)
    status = serializers.ChoiceField(
        choices=[(tag.value, tag.name) for tag in TeacherAccessStatusEnum]
    )

    class Meta:
        model = TeacherClassAccess
        fields = ['id', 'teacher', 'teacher_username', 'school_class', 'school_class_name', 
                  'status', 'requested_at', 'approved_at', 'expiry_at', 'note']