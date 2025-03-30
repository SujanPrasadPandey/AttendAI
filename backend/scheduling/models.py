from django.db import models
from django.conf import settings
from datetime import date

# Model for Day Off events
class DayOff(models.Model):
    DAYOFF_TYPE_CHOICES = (
        ('closed', 'School Closed'),
        ('no_attendance', 'Attendance Not Required'),
    )
    date = models.DateField(default=date.today)
    dayoff_type = models.CharField(max_length=20, choices=DAYOFF_TYPE_CHOICES)
    # Optionally, you can restrict a day off to a specific class; null means applies to entire school.
    school_class = models.ForeignKey('school_data.SchoolClass', on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        if self.school_class:
            return f"{self.date} - {self.dayoff_type} for {self.school_class}"
        return f"{self.date} - {self.dayoff_type} (Entire School)"

# Model for Weekly Routine or Schedule entries
class RoutineEntry(models.Model):
    # Link to the class from school_data app
    school_class = models.ForeignKey('school_data.SchoolClass', on_delete=models.CASCADE)
    # Link to a subject from school_data app
    subject = models.ForeignKey('school_data.Subject', on_delete=models.CASCADE)
    # The teacher for the subject
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    # The day of the week (0=Monday, 6=Sunday)
    day_of_week = models.IntegerField()  
    # Time slot for the class (for example "09:00 - 10:00")
    time_slot = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.school_class} - {self.subject} on day {self.day_of_week}"
