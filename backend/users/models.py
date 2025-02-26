from django.contrib.auth.models import AbstractUser
from django.db import models

ROLE_CHOICES = (
    ('student', 'Student'),
    ('teacher', 'Teacher'),
    ('parent', 'Parent'),
    ('admin', 'Admin'),
)

class CustomUser(AbstractUser):
    email = models.EmailField("email address", blank=True, null=True, unique=True)
    email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
