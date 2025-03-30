from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    # The user who performed the action (using your custom user model)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    # A short description of the action (e.g., "Updated Attendance", "Leave Request Approved")
    action = models.CharField(max_length=100)
    # A detailed description, if needed
    description = models.TextField(blank=True, null=True)
    # Timestamp of when the action occurred
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_str = self.user.username if self.user else "Unknown User"
        return f"{self.timestamp} - {user_str}: {self.action}"
