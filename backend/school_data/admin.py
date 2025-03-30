from django.contrib import admin
from .models import SchoolClass, Subject, StudentProfile, TeacherProfile, ParentProfile

admin.site.register(SchoolClass)
admin.site.register(Subject)
admin.site.register(StudentProfile)
admin.site.register(TeacherProfile)
admin.site.register(ParentProfile)
