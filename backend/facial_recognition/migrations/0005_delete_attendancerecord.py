# Generated by Django 5.1.7 on 2025-04-03 16:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('facial_recognition', '0004_remove_reviewface_note_remove_reviewface_student_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='AttendanceRecord',
        ),
    ]
