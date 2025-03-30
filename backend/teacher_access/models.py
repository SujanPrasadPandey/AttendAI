from django.db import models
from school_data.models import TeacherProfile, SchoolClass
from django.utils import timezone
from datetime import timedelta

# Define the status choices for teacher access requests.
STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('denied', 'Denied'),
)

class TeacherClassAccess(models.Model):
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE)
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    expiry_at = models.DateTimeField(null=True, blank=True)
    note = models.TextField(blank=True, null=True)

    def approve(self, duration_days=1):
        self.status = 'approved'
        self.approved_at = timezone.now()
        self.expiry_at = self.approved_at + timedelta(days=duration_days)
        self.save()

    def deny(self):
        self.status = 'denied'
        self.approved_at = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.teacher.user.username} access for {self.school_class} - {self.status}"
