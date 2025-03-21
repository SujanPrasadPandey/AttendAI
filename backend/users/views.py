import os
import csv, io
from rest_framework import generics, viewsets
from .serializers import (
    UserSerializer,
    EmailUpdateSerializer,
    AdminUserSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ProfilePictureUploadSerializer,
    VerifyEmailQuerySerializer,
    EmptySerializer,
)
from .utils import (
    send_verification_email,
    compress_image
)
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
# from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.generics import UpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView

CustomUser = get_user_model()
signer = TimestampSigner()


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        if user.email:
            send_verification_email(user, self.request)


class VerifyEmailView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyEmailQuerySerializer

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data.get("token")
        try:
            user_pk = signer.unsign(token, max_age=86400)
            user = CustomUser.objects.get(pk=user_pk)
            user.email_verified = True
            user.save()
            return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)
        except SignatureExpired:
            return Response({"detail": "Token has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (BadSignature, CustomUser.DoesNotExist):
            return Response({"detail": "Invalid token or user not found."}, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationEmailView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EmptySerializer

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.email_verified:
            return Response({"detail": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            send_verification_email(user, request)
            return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "Error sending email: " + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetRequestView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get("email")
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.email_verified:
            return Response({"detail": "Email is not verified. Cannot reset password."}, status=status.HTTP_400_BAD_REQUEST)
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = os.getenv("FRONTEND_URL")
        reset_url = f"{frontend_url}/reset-password-confirm/?uid={uid}&token={token}"
        subject = "Password Reset Request"
        message = (
            f"Hi {user.username},\n\n"
            f"Please click the link below to reset your password:\n{reset_url}\n\n"
            "If you did not request a password reset, please ignore this email."
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({"detail": "Password reset email sent."}, status=status.HTTP_200_OK)
    

class PasswordResetConfirmView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        uidb64 = request.query_params.get("uid")
        token = request.query_params.get("token")
        if not uidb64 or not token:
            return Response({"detail": "uid and token are required."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"detail": "Invalid user id."}, status=status.HTTP_400_BAD_REQUEST)
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)


    
class PasswordChangeView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password has been changed successfully."})


class UpdateEmailView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EmailUpdateSerializer

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = self.get_object()
        old_email = user.email
        updated_user = serializer.save()

        if updated_user.email and updated_user.email != old_email:
            updated_user.email_verified = False
            updated_user.save()
            send_verification_email(updated_user, self.request)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]  # Replace with [IsAdminUser] later

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        class_filter = self.request.query_params.get('class')
        
        if role:
            queryset = queryset.filter(role=role)
        
        if class_filter:
            queryset = queryset.filter(studentprofile__class_name=class_filter)
        
        return queryset.distinct()

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"detail": "CSV file is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            data = csv_file.read().decode('utf-8')
            io_string = io.StringIO(data)
            reader = csv.DictReader(io_string)
        except Exception as e:
            return Response({"detail": f"Error reading CSV file: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        created_users = []
        errors = []
        for index, row in enumerate(reader, start=1):
            serializer = AdminUserSerializer(data=row)
            if serializer.is_valid():
                user = serializer.save()
                if user.email:
                    user.email_verified = False
                    user.save()
                    send_verification_email(user, request)
                created_users.append(serializer.data)
            else:
                errors.append({"row": index, "errors": serializer.errors})
        
        if errors:
            return Response({"created": created_users, "errors": errors},
                            status=status.HTTP_207_MULTI_STATUS)
        return Response({"created": created_users}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        user_ids = request.data.get('user_ids', [])
        if not user_ids or not isinstance(user_ids, list):
            return Response({"detail": "A list of user_ids is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        deleted_count, _ = CustomUser.objects.filter(id__in=user_ids).delete()
        return Response({"deleted_count": deleted_count}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        user = serializer.save()
        if user.email:
            user.email_verified = False
            user.save()
            send_verification_email(user, self.request)

    def perform_update(self, serializer):
        old_email = serializer.instance.email
        updated_user = serializer.save()
        if "email" in serializer.validated_data:
            new_email = serializer.validated_data.get("email")
            if new_email and new_email != old_email:
                updated_user.email_verified = False
                updated_user.save()
                send_verification_email(updated_user, self.request)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProfilePictureUploadView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfilePictureUploadSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.validated_data.get("profile_picture")
        allowed_extensions = ['.jpg', '.jpeg', '.png']
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in allowed_extensions:
            return Response({"detail": "Unsupported file type. Only JPG and PNG files are allowed."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            compressed_file = compress_image(file_obj)
        except Exception as e:
            return Response({"detail": "Error processing image: " + str(e)}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if user.profile_picture:
            try:
                default_storage.delete(user.profile_picture.name)
            except Exception:
                pass
        filename = f"profile_pictures/{user.id}_{compressed_file.name}"
        file_path = default_storage.save(filename, compressed_file)
        file_url = default_storage.url(file_path)
        user.profile_picture = file_path
        user.save()
        return Response({
            "detail": "Profile picture uploaded.",
            "url": request.build_absolute_uri(file_url)
        }, status=status.HTTP_200_OK)
