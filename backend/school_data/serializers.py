# school_data/serializers.py
from rest_framework import serializers
from .models import SchoolClass, Subject, TeacherProfile, StudentProfile
from users.models import CustomUser  # Assuming CustomUser is in users.models
from users.serializers import UserSerializer  # Assuming UserSerializer exists

class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Nested user details for reading
    subjects = SubjectSerializer(many=True, read_only=True)  # Full subject details for reading
    classes = SchoolClassSerializer(many=True, read_only=True)  # Full class details for reading
    user_phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(role='teacher'),  # Only teachers
        source='user',  # Maps to the user field
        write_only=True  # For creating/updating
    )
    subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        many=True,
        source='subjects',  # Maps to the subjects many-to-many field
        required=False  # Optional during creation/update
    )
    class_ids = serializers.PrimaryKeyRelatedField(
        queryset=SchoolClass.objects.all(),
        many=True,
        source='classes',  # Maps to the classes many-to-many field
        required=False  # Optional during creation/update
    )

    class Meta:
        model = TeacherProfile
        fields = ['id', 'user', 'user_id', 'subjects', 'subject_ids', 'classes', 'class_ids', 'user_phone_number']

    def validate(self, data):
        # Ensure the user doesn't already have a teacher profile during creation
        user = data.get('user')
        if self.instance is None and user and TeacherProfile.objects.filter(user=user).exists():
            raise serializers.ValidationError("This user already has a teacher profile.")
        return data
    
class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Nested user details for reading
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(role='student'),  # Only allow students
        source='user',  # Maps to the user field
        write_only=True
    )
    school_class = SchoolClassSerializer(read_only=True)  # Nested school class details for reading
    school_class_id = serializers.PrimaryKeyRelatedField(
        queryset=SchoolClass.objects.all(),
        source='school_class',  # Maps to the school_class field
        write_only=True,
        required=False
    )
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 
            'user', 
            'user_id', 
            'school_class', 
            'school_class_id', 
            'roll_number', 
            'address'
        ]