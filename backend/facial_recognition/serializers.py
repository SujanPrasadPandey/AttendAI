from rest_framework import serializers
from .models import FaceImage, UnrecognizedFace, ReviewFace, StudentProfile

# Serializer for enrolling a face image
class EnrollFaceSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    image = serializers.ImageField()

# Serializer for marking attendance
class MarkAttendanceSerializer(serializers.Serializer):
    images = serializers.ListField(child=serializers.ImageField(), allow_empty=False)
    status = serializers.ChoiceField(choices=['onTime', 'late'], default='onTime')

# Serializer for assigning an unrecognized face
class AssignUnrecognizedFaceSerializer(serializers.Serializer):
    face_id = serializers.IntegerField()
    student_id = serializers.IntegerField(required=False, allow_null=True)

# Serializer for confirming a review face
class ConfirmReviewFaceSerializer(serializers.Serializer):
    face_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['confirm', 'reassign', 'discard'])
    confirmed_student_id = serializers.IntegerField(required=False, allow_null=True)

# Serializer for listing face images of a student
class FaceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceImage
        fields = ['id', 'image', 'created_at']

# Serializer for listing unrecognized faces
class UnrecognizedFaceSerializer(serializers.ModelSerializer):
    identified_student_name = serializers.CharField(source='identified_student.user.username', read_only=True, allow_null=True)
    class Meta:
        model = UnrecognizedFace
        fields = ['id', 'image', 'timestamp', 'identified_student', 'identified_student_name', 'discarded']

# Serializer for listing review faces
class ReviewFaceSerializer(serializers.ModelSerializer):
    suggested_student_name = serializers.CharField(source='suggested_student.user.username', read_only=True)
    confirmed_student_name = serializers.CharField(source='confirmed_student.user.username', read_only=True, allow_null=True)

    class Meta:
        model = ReviewFace
        fields = ['id', 'image', 'similarity', 'timestamp', 'suggested_student', 'suggested_student_name', 'confirmed_student', 'confirmed_student_name', 'discarded']