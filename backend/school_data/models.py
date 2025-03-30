from django.db import models
from django.conf import settings

# Model for Class or Section
class SchoolClass(models.Model):
    name = models.CharField(max_length=50)
    grade_level = models.IntegerField()

    def __str__(self):
        return f"{self.grade_level} - {self.name}"

# Model for Subject
class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# Student Profile: one-to-one with the CustomUser model
class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    school_class = models.ForeignKey(SchoolClass, on_delete=models.SET_NULL, null=True, blank=True)
    roll_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Student Profile: {self.user.username}"

# Teacher Profile: one-to-one with the CustomUser model
class TeacherProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subjects = models.ManyToManyField(Subject, blank=True)
    classes = models.ManyToManyField(SchoolClass, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Teacher Profile: {self.user.username}"

# Parent Profile: one-to-one with the CustomUser model
class ParentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # Allow a parent to be associated with multiple student profiles
    children = models.ManyToManyField(StudentProfile, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Parent Profile: {self.user.username}"
