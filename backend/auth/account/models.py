from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from taggit.managers import TaggableManager


class UserManager(BaseUserManager):
    
    def create_user(self, email, name, tc, password=None, password2=None):
        if not email:
            raise ValueError("User must have an email address")
        user = self.model(
            email=self.normalize_email(email),
            name=name,
            tc=tc,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, tc, password=None):
        user = self.create_user(
            email,
            password=password,
            name=name,
            tc=tc,
        )   
        user.is_admin = True
        user.save(using=self._db)
        return user 


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='Email',
        max_length=255,
        unique=True,
    )
    name = models.CharField(max_length=200)
    tc = models.BooleanField()
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'tc']
    
    def __str__(self):
        return self.email
    
    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    def has_module_perms(self, app_label):
        return True
    
    @property
    def is_staff(self):
        return self.is_admin

def task_file_upload_to(instance, filename):
    return f'tasks/{instance.user.email}/{filename}'


def task_file_upload_to(instance, filename):
    return f'tasks/{instance.task.user.email}/{filename}'

class TaskList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Task(models.Model):
    task_list = models.ForeignKey(TaskList, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True) 
    end_time = models.TimeField(null=True, blank=True)
    tags = TaggableManager(blank=True)
    completed = models.BooleanField(default=False)
    is_event = models.BooleanField(default=False)
    send_email_notification = models.BooleanField(default=True)

    def __str__(self):
        return self.title
    
    
class File(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=task_file_upload_to, null=True, blank=True)

    def __str__(self):
        return f"{self.task.title} - {self.file.name}"


