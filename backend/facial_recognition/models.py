from django.db import models
from school_data.models import StudentProfile

from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.core.files.storage import default_storage

class FaceImage(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='face_images')
    image = models.ImageField(upload_to='student_faces/')
    embedding = models.JSONField(null=True, blank=True)  # Face embedding as JSON
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"FaceImage for {self.student.user.username} - {self.id}"
    
@receiver(post_delete, sender=FaceImage)
def delete_face_image_file(sender, instance, **kwargs):
    if instance.image:
        default_storage.delete(instance.image.name)

class FaceEmbedding(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name='face_embedding')
    avg_embedding = models.JSONField(null=True, blank=True)  # Average embedding for recognition
    num_samples = models.PositiveIntegerField(default=0)  # Number of samples used

    def __str__(self):
        return f"FaceEmbedding for {self.student.user.username}"

class UnrecognizedFace(models.Model):
    image = models.ImageField(upload_to='unrecognized_faces/')  # Cropped face image
    embedding = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    identified_student = models.ForeignKey(StudentProfile, on_delete=models.SET_NULL, null=True, blank=True)
    discarded = models.BooleanField(default=False)  # Soft-delete flag for admin review

    def __str__(self):
        return f"UnrecognizedFace {self.id} at {self.timestamp}"

class ReviewFace(models.Model):
    suggested_student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, null=True, blank=True, related_name='review_faces')
    image = models.ImageField(upload_to='review_faces/')  # Cropped face image
    embedding = models.JSONField(null=True, blank=True)
    similarity = models.FloatField()  # Similarity score to suggested student
    timestamp = models.DateTimeField(auto_now_add=True)
    confirmed_student = models.ForeignKey(StudentProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='confirmed_review_faces')
    discarded = models.BooleanField(default=False)  # Soft-delete flag

    def __str__(self):
        return f"ReviewFace {self.id} at {self.timestamp}"