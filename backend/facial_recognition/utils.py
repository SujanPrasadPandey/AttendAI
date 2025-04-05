import numpy as np
from django.core.files.storage import default_storage
from .models import FaceEmbedding

def recalculate_embedding(student):
    face_images = student.face_images.all()
    embeddings = [img.embedding for img in face_images if img.embedding]
    if embeddings:
        avg_embedding = np.mean(embeddings, axis=0).tolist()
        face_embedding, created = FaceEmbedding.objects.get_or_create(student=student)
        face_embedding.avg_embedding = avg_embedding
        face_embedding.num_samples = len(embeddings)
        face_embedding.save()
    else:
        FaceEmbedding.objects.filter(student=student).delete()