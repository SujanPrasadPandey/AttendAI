from django.db import models
from django.conf import settings
from datetime import date

# Define choices for attendance status
ATTENDANCE_STATUS_CHOICES = (
    ('present', 'Present'),
    ('late', 'Late'),
    ('absent', 'Absent'),
    ('leave', 'Leave Approved'),
)

class AttendanceRecord(models.Model):
    # Reference to the student user. (You may later switch this to StudentProfile if desired.)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField(default=date.today)
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES)
    # The user (e.g., a teacher) who recorded this attendance; can be null if AI processed.
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name='attendance_recorded',
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.date} - {self.status}"
    