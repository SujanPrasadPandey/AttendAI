from django.conf import settings
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .utils import compress_image
from django.core.files.storage import default_storage

CustomUser = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)

    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True, "style": {"input_type": "password"}},
        }

    def validate_email(self, value):
        if value and CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "email_verified",
            "phone_number",
            "profile_picture",
        ]
        read_only_fields = ["id", "email_verified", "username", "profile_picture"]


class EmailUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email']

    def validate_email(self, value):
        if value and CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=False)
    role = serializers.ChoiceField(
        choices=[('student', 'Student'), ('teacher', 'Teacher'), ('parent', 'Parent'), ('admin', 'Admin')],
        required=True
    )

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'password',
            'role',
            'is_active',
            'is_staff',
            'first_name',
            'last_name',
            'phone_number',
            'profile_picture',
        ]
        read_only_fields = ['id']

    def validate_email(self, value):
        # If updating an instance, exclude its own email from the uniqueness check
        if self.instance:
            if value and CustomUser.objects.exclude(pk=self.instance.pk).filter(email=value).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        else:
            if value and CustomUser.objects.filter(email=value).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # Extract the profile picture if provided
        profile_picture = validated_data.pop('profile_picture', None)
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        
        if profile_picture:
            # Compress the image before saving it
            user.profile_picture = compress_image(profile_picture)
            
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        # Extract the profile picture if provided
        profile_picture = validated_data.pop('profile_picture', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if profile_picture:
            # Delete the previous profile picture file if it exists
            if instance.profile_picture:
                try:
                    default_storage.delete(instance.profile_picture.name)
                except Exception as e:
                    # Log the exception or handle it as needed
                    pass

            # Compress and set the new profile picture
            instance.profile_picture = compress_image(profile_picture)
            
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(style={'input_type': 'password'})
    new_password = serializers.CharField(style={'input_type': 'password'})
    new_password2 = serializers.CharField(style={'input_type': 'password'})

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError("New passwords do not match.")
        return data
    

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(style={'input_type': 'password'})
    new_password2 = serializers.CharField(style={'input_type': 'password'})

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data


class ProfilePictureUploadSerializer(serializers.Serializer):
    profile_picture = serializers.ImageField()


class VerifyEmailQuerySerializer(serializers.Serializer):
    token = serializers.CharField(required=True)


class EmptySerializer(serializers.Serializer):
    pass
