# Generated by Django 5.1.7 on 2025-04-02 18:00

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('facial_recognition', '0003_remove_faceembedding_embeddings_and_more'),
        ('school_data', '0002_remove_parentprofile_phone_number_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reviewface',
            name='note',
        ),
        migrations.RemoveField(
            model_name='reviewface',
            name='student',
        ),
        migrations.RemoveField(
            model_name='unrecognizedface',
            name='note',
        ),
        migrations.AddField(
            model_name='reviewface',
            name='confirmed_student',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='confirmed_review_faces', to='school_data.studentprofile'),
        ),
        migrations.AddField(
            model_name='reviewface',
            name='discarded',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='reviewface',
            name='embedding',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reviewface',
            name='suggested_student',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='review_faces', to='school_data.studentprofile'),
        ),
        migrations.AddField(
            model_name='unrecognizedface',
            name='discarded',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='unrecognizedface',
            name='embedding',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='unrecognizedface',
            name='identified_student',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='school_data.studentprofile'),
        ),
    ]
