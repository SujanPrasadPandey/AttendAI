from rest_framework import serializers
from .models import FaceEmbedding, UnrecognizedFace, ReviewFace

class EnrollFaceSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    image = serializers.ImageField()


class MarkAttendanceSerializer(serializers.Serializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        help_text="List of class photos"
    )


# Serializers for batch enrollment
class StudentEnrollmentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    images = serializers.ListField(
        child=serializers.ImageField(),
        help_text="List of images for the student"
    )


class BatchEnrollFaceSerializer(serializers.Serializer):
    enrollments = StudentEnrollmentSerializer(many=True)


# Optional: Debug serializer for FaceEmbedding
class FaceEmbeddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceEmbedding
        fields = '__all__'


# New serializers for review endpoints
class ReviewFaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewFace
        fields = '__all__'


class UnrecognizedFaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnrecognizedFace
        fields = '__all__'


class ReviewFaceAssignmentSerializer(serializers.Serializer):
    review_face_id = serializers.IntegerField()
    student_id = serializers.IntegerField()
