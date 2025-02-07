from django.contrib.auth.models import AbstractUser
from django.db import models

# class CustomUser(AbstractUser):
#     email_verified = models.BooleanField(default=False)

class CustomUser(AbstractUser):
    email = models.EmailField("email address", blank=True, null=True, unique=True)
    email_verified = models.BooleanField(default=False)
    