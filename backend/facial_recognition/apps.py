from django.apps import AppConfig


class FacialRecognitionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'facial_recognition'

    def ready(self):
        import facial_recognition.signals