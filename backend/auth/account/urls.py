from django.urls import path, include
from .views import *
from rest_framework import routers
from . import views
from django.conf.urls.static import static
from django.conf import settings


router = routers.DefaultRouter()
router.register(r'task', views.TaskView, 'task')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'), 
    path('login/', UserLoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'), 
    path('changepassword/', UserChangePasswordView.as_view(), name='changepassword'), 
    path('send-reset-password-email/', SendPasswordResetView.as_view(), name='send-reset-password-email'), 
    path('reset-password/<uid>/<token>/', UserPasswordResetView.as_view(), name='reset-password'), 
    path('edit-profile/', EditUserProfileView.as_view(), name='edit-profile'),
    path('tasks/', TaskListView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('api/', include(router.urls)),
    path('tasklists/', TaskListView.as_view(), name='tasklists'),
    path('tasklists/<int:pk>/', TaskListDetailView.as_view(), name='tasklist-detail'),]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

