# Generated by Django 4.2.3 on 2023-07-28 20:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0014_remove_task_tags_mytag_tasks'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mytag',
            name='tasks',
        ),
        migrations.CreateModel(
            name='TaskTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='account.mytag')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='account.task')),
            ],
        ),
        migrations.AddField(
            model_name='task',
            name='tags',
            field=models.ManyToManyField(related_name='tasks', through='account.TaskTag', to='account.mytag'),
        ),
    ]