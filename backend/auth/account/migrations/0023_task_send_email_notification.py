# Generated by Django 4.2.3 on 2023-08-06 21:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0022_task_is_event'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='send_email_notification',
            field=models.BooleanField(default=True),
        ),
    ]
