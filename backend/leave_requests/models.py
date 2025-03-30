from django.db import models
from school_data.models import StudentProfile
from django.utils import timezone

LEAVE_STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('denied', 'Denied'),
)

class LeaveRequest(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=LEAVE_STATUS_CHOICES, default='pending')
    admin_comment = models.TextField(blank=True, null=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"LeaveRequest by {self.student.user.username} from {self.start_date} to {self.end_date}"
