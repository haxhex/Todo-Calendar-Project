# Generated by Django 4.2.3 on 2023-07-26 12:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0008_task_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='duration',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='task',
            name='end_time',
            field=models.TimeField(blank=True, null=True),
        ),
    ]