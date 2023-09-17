# Generated by Django 4.2.3 on 2023-08-03 17:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0019_task_tags'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('tasks', models.ManyToManyField(to='account.task')),
            ],
        ),
    ]