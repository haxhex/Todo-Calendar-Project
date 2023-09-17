from rest_framework import serializers
from account.models import *
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .utils import Util
from taggit.serializers import TagListSerializerField, TaggitSerializer
from taggit.models import Tag


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'password2', 'tc']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        if password!=password2:
            raise serializers.ValidationError("رمز عبور و تأیید رمز عبور مطابقت ندارد")
        return attrs
    def create(self, validate_data):
        return User.objects.create_user(**validate_data)
        
class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255)
    class Meta:
        model = User
        fields = ['email', 'password']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name']

class UserChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    password2 = serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    class Meta:
        fields = ['password', 'password2']
    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        user = self.context.get('user')
        if password != password2:
            raise serializers.ValidationError("رمز عبور و تأیید رمز عبور مطابقت ندارد")
        user.set_password(password)
        user.save()
        return attrs
    
class SendPasswordResetEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)
    class Meta:
        fields = ['email']

    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            link = 'http://localhost:3000/api/user/reset/'+uid+'/'+token
            print("LINK=======",link)
            body = 'برای بازیابی رمز عبور روی لینک کلیک کنید\n' + link            
            data = {
                'subject': 'بازیابی رمز عبور ',
                'body': body,
                'to_email': user.email
            }
            Util.send_email(data)
            return attrs
        else:
            raise serializers.ValidationError("ایمیل شما ثبت نشده است!")
        
class UserPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    password2 = serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    class Meta:
        fields = ['password', 'password2']

    def validate(self, attrs):
        try:
            password = attrs.get('password')
            password2 = attrs.get('password2')
            uid = self.context.get('uid')
            token = self.context.get('token')
            if password != password2:
                raise serializers.ValidationError("رمز عبور و تأیید رمز عبور مطابقت ندارد.")
            id = smart_str(urlsafe_base64_decode(uid))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError("توکن معتبر نیست یا منقضی شده است")
            user.set_password(password)
            user.save()
            return attrs
        except DjangoUnicodeDecodeError as identifier:
            PasswordResetTokenGenerator().check_token(user, token)
            raise serializers.ValidationError("توکن معتبر نیست یا منقضی شده است")


class UserEditProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('name', 'email')

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'file',)  # Add any other fields you want to include in the FileSerializer
   
     
class TaskSerializer(TaggitSerializer, serializers.ModelSerializer):
    files = FileSerializer(many=True, required=False)  # Use the FileSerializer for the nested relationship
    tags = TagListSerializerField(required=False)  # Add the tags field

    class Meta:
        model = Task
        fields = '__all__'

    def create(self, validated_data):
        print('validated_data: ', validated_data)
        files_data = validated_data.pop('files', [])  # Get the files data (if any)
        tags_data = validated_data.pop('tags', [])  # Get the tags data (if any)
        # Convert the received tags (array of strings) into a list of tag objects
        task = Task.objects.create(**validated_data)
        # Create File objects for each uploaded file
        for file_data in files_data:
            File.objects.create(task=task, **file_data)
        return task

    def update(self, instance, validated_data):
        print('validated_data: ', validated_data)
        files_data = validated_data.pop('files', None)  # Get the files data (if any)
        print('files_data: ' , files_data)

        # Update the Task instance with the validated data
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        # Update other fields as needed...
        instance.duration = validated_data.get('duration', instance.duration)
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.completed = validated_data.get('completed', instance.completed)
        instance.is_event = validated_data.get('is_event', instance.is_event)
        instance.send_email_notification = validated_data.get('send_email_notification', instance.send_email_notification)
        
        
        # Save the updated Task instance
        instance.save()

        if files_data is not None:
            # Clear existing files if any
            # instance.files.all().delete()

            # Create new File objects for each uploaded file
            for file_data in files_data:
                File.objects.create(task=instance, **file_data)
                

        return instance
    
class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskList
        fields = '__all__'