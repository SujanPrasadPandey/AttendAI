from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.core.files.storage import default_storage
from .models import FaceImage
from .utils import recalculate_embedding

@receiver(post_delete, sender=FaceImage)
def delete_face_image_file(sender, instance, **kwargs):
    if instance.image:
        default_storage.delete(instance.image.name)
    recalculate_embedding(instance.student)