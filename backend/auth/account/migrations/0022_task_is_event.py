# Generated by Django 4.2.3 on 2023-08-06 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0021_remove_tasklist_tasks_task_task_list_tasklist_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='is_event',
            field=models.BooleanField(default=False),
        ),
    ]
