from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.views import APIView
from .serializers import *
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from .models import Task                     # add this
from rest_framework import viewsets          # add this
from taggit.models import Tag
from django.http import Http404
from django.http import HttpResponse
from .tasks import send_mail_func


def send_mail_to_al_users(request):
    send_mail_func.delay()
    return HttpResponse("Email has been sent successfully!")

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return{
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class UserRegistrationView(APIView):
    def post(self, request, format=None):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = get_tokens_for_user(user)
        return Response({'token': token, 'msg': 'ثبت نام با موفقیت انجام شد'}, status=status.HTTP_201_CREATED)
    

class UserLoginView(APIView):
    def post(self, request, format=None):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.data.get('email')
        password = serializer.data.get('password')
        user = authenticate(email=email, password=password)
        if user is not None:
            token = get_tokens_for_user(user)
            return Response({'token': token, 'msg': 'ورود با موفقیت انجام شد!'}, status=status.HTTP_200_OK)
        else:
            return Response({'errors': {'non_field_errors': ['ایمیل یا رمزعبور نا معتبر است!']}}, status=status.HTTP_404_NOT_FOUND)
        
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        serializer = UserChangePasswordSerializer(data=request.data, context={'user': request.user})
        serializer.is_valid(raise_exception=True)
        return Response({'msg': 'رمز عبور با موفقیت تغییر کرد.'}, status=status.HTTP_200_OK)
    
class SendPasswordResetView(APIView):
    def post(self, request, format=None):
        serializer = SendPasswordResetEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'msg': 'پیوند بازنشانی رمز عبور ارسال شد. لطفا ایمیل خود را چک کنید.'}, status=status.HTTP_200_OK)
    
class UserPasswordResetView(APIView):
    def post(self, request, uid, token, format=None):
        serializer = UserPasswordResetSerializer(data=request.data, context={'uid': uid, 'token': token})
        serializer.is_valid(raise_exception=True)
        return Response({'msg': 'رمز عبور با موفقیت بازنشانی شد!'}, status=status.HTTP_200_OK)
    

class EditUserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def put(self, request, format=None):
        user_id = request.user.id
        user = self.get_user(user_id)
        
        if user is None:
            return Response({'error': 'کاربر پیدا نشد.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({'msg': 'پروفایل با موفقیت به‌روزرسانی شد.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'مشکلی در به‌روزرسانی پروفایل به وجود آمد.'}, status=status.HTTP_400_BAD_REQUEST)

class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        # Retrieve a specific task by its primary key (pk)
        task = get_object_or_404(Task, pk=pk, user=request.user)
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk, format=None):
        # Update a specific task by its primary key (pk)
        task = get_object_or_404(Task, pk=pk, user=request.user)
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        # Delete a specific task by its primary key (pk)
        task = get_object_or_404(Task, pk=pk, user=request.user)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)     
        
class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Retrieve tasks related to the authenticated user
        tasks = Task.objects.filter(user=request.user)
        print('tasks: ', tasks.tags)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        # Create a new task for the authenticated user
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        print("-----")
        print(request.user)
        # Create a new task for the authenticated user
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from rest_framework.viewsets import ModelViewSet

class TaskView(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        user_id = self.request.user.id
        task_list_id = self.request.query_params.get('task_list', None)
        if user_id is not None:  # Change 'is not (None or 'udefined')' to 'is not None'
            queryset = Task.objects.filter(user__id=user_id)
            if task_list_id:
                # Get the specific TaskList based on the task_list_id
                task_list = get_object_or_404(TaskList, id=task_list_id, user__id=user_id)
                # Filter tasks based on the retrieved TaskList
                return queryset.filter(task_list=task_list_id)
            return queryset

    def create(self, request, *args, **kwargs):
        
        data = request.data.copy()
        print('Sent Data: ' ,data)
        user_id = request.user.id
        data['user'] = user_id
        tags = data.pop('tags', [])  # Get the tags data (if any)
        print('-- Data: ', data)
        print('tags', tags)            
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        print("No Exp.")
        task = serializer.save()
        
        for tag in tags:
            task.tags.add(tag)

        # Handle multiple file uploads
        self.handle_files(task, request.FILES.getlist('files'))
            
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        data = request.data.copy()
        print('DATA: ', data)
        tags = data.pop('tags', [])  # Get the tags data (if any)
        task = self.get_object()
        print('Task-data: ', data)
        serializer = self.get_serializer(instance=task, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        
        # Separate existing file URLs and new file objects
        existing_file_urls = [file for file in data.pop('files', []) if isinstance(file, str)]
        new_files = request.FILES.getlist('files', [])

        # Remove duplicates and combine existing file URLs and new file objects
        all_files = list(set(existing_file_urls + new_files))

        # Handle multiple file uploads
        self.handle_files(task, all_files)
        
        # Handle tags
        task.tags.clear()  # Clear existing tags
        # for tag_name in tags:
        for tag in tags:
            task.tags.add(tag)
        print(task.tags.all())

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        self.handle_files(task, None)  # Pass None to delete all associated files
        return super().destroy(request, *args, **kwargs)

    def handle_files(self, task, files):
        print('** ', files)
        print('*** ', task.files.all())
        if files ==  None:
            task.files.all().delete()
        else:
            fn = []
            for file in files:
                if isinstance(file, str):
                    fn.append(file.split('/')[-1]) 
            
            nfn = []
            for file in files:
                if not isinstance(file, str):
                    nfn.append(file.name)
                            
            not_rep = []
            for nf in nfn:
                if nf not in fn :
                    not_rep.append(nf)
                        
            
            # Get a list of existing file names in the task.files queryset
            existing_file_names = [file.file.name.split('/')[-1] for file in task.files.all()]

            # Clear existing files if any, except those that exist in the files list
            for existing_file in task.files.all():
                if existing_file.file.name.split('/')[-1] not in fn:
                    print('del: ', existing_file)
                    existing_file.delete()
                
            print(existing_file_names)
            # Clear existing files if any
            # task.files.all().delete()

            if files:
                # Create new File objects for each uploaded file
                for file in files:
                    if not isinstance(file, str) and file.name in not_rep:
                        # file = file.split('/')[-1]
                        File.objects.create(task=task, file=file)


class TaskListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskListSerializer

    def get_queryset(self):
        user_id = self.request.user.id
        if user_id is not None:
            return TaskList.objects.filter(user__id=user_id)
        
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        user_id = request.user.id
        data['user'] = user_id        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True) 
        task_list = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
class TaskListDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskListSerializer

    def get_queryset(self):
        user_id = self.request.user.id
        return TaskList.objects.filter(user__id=user_id)