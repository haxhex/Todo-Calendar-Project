# Generated by Django 4.2.3 on 2023-07-28 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0012_remove_task_files_file_task'),
    ]

    operations = [
        migrations.CreateModel(
            name='MyTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.AddField(
            model_name='task',
            name='tags',
            field=models.ManyToManyField(to='account.mytag'),
        ),
    ]
