from django.contrib.auth import get_user_model
from celery import shared_task
from django.core.mail import send_mail
from auth import settings
from datetime import datetime, timedelta
from .models import *	

@shared_task(bind=True)
def send_mail_func(self):
    current_date_time = datetime.now()
    current_date_time = current_date_time.replace(second=0, microsecond=0)
    my_target_time = current_date_time + timedelta(minutes=60)
    filtered_tasks = Task.objects.filter(due_date=current_date_time.date(), end_time__gte=current_date_time.time(), end_time__lte=my_target_time.time(), send_email_notification=True)
    if len(filtered_tasks) > 0:
        for task in filtered_tasks:
            mail_subject = "یادآوری انجام کار"
            message = f"موعد {task.title}  به زودی به اتمام می رسد"
            to_email = task.user.email
            send_mail(
                subject=mail_subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[to_email],
                fail_silently=True,
                )
            # Update the task object attribute
            print("Make send notid false!")
            task.send_email_notification = False
            task.save()
        return "Task Successfull"
