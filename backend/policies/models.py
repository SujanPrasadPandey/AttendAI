from django.db import models

class AttendancePolicy(models.Model):
    # Number of late attendances that equal one absence (e.g., 3 means 3 lates = 1 absent)
    late_to_absent_ratio = models.PositiveIntegerField(default=3)
    # Maximum allowed absences in a year (or specified period)
    max_allowed_absences = models.PositiveIntegerField(default=10)
    # Optional: warning threshold (e.g., if a student reaches 80% of allowed absences)
    warning_threshold = models.FloatField(default=0.8, help_text="Enter a decimal value (e.g., 0.8 for 80%)")

    # A timestamp to know when the policy was last updated
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Attendance Policy Settings"

    class Meta:
        verbose_name_plural = "Attendance Policies"
