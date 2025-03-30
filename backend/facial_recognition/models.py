from django.db import models
from school_data.models import StudentProfile

class FaceEmbedding(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE)
    avg_embedding = models.JSONField(null=True, blank=True)  # Stores a list of floats
    num_samples = models.PositiveIntegerField(default=0)
    # Dictionary to store individual embeddings; keys can be sample numbers, values are lists of floats
    embeddings = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"FaceEmbedding for {self.student.user.username}"


# New model to store images with no recognized face (or problematic detections)
class UnrecognizedFace(models.Model):
    image = models.ImageField(upload_to='unrecognized_faces/')
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)  # e.g., "No face detected" or "Multiple faces detected"

    def __str__(self):
        return f"UnrecognizedFace {self.id} at {self.timestamp}"


# New model to store low-confidence (review) faces for later manual update
class ReviewFace(models.Model):
    # Optionally associate with a student if a candidate match is available
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='review_faces/')
    similarity = models.FloatField()  # similarity score computed from cosine similarity
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"ReviewFace (Student: {self.student}, similarity: {self.similarity})"
