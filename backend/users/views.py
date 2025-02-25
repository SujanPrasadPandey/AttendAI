import os
from rest_framework import generics, viewsets
from .serializers import (
    UserSerializer,
    EmailUpdateSerializer,
    AdminUserSerializer,
    UserProfileSerializer,
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


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response({"detail": "Token is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            user_pk = signer.unsign(token, max_age=86400)
            user = CustomUser.objects.get(pk=user_pk)
            user.email_verified = True
            user.save()
            return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)
        except SignatureExpired:
            return Response({"detail": "Token has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (BadSignature, CustomUser.DoesNotExist):
            return Response({"detail": "Invalid token or user not found."},
                            status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User with this email does not exist."},
                            status=status.HTTP_400_BAD_REQUEST)
        if not user.email_verified:
            return Response({"detail": "Email is not verified. Cannot reset password."},
                            status=status.HTTP_400_BAD_REQUEST)
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # relative_link = reverse("users:password-reset-confirm")
        # reset_url = request.build_absolute_uri(f"{relative_link}?uid={uid}&token={token}")

        frontend_url = os.getenv("FRONTEND_URL") 
        reset_url = f"{frontend_url}/reset-password-confirm/?uid={uid}&token={token}"

        subject = "Password Reset Request"
        message = (
            f"Hi {user.username},\n\n"
            f"Please click the link below to reset your password:\n{reset_url}\n\n"
            "If you did not request a password reset, please ignore this email."
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({"detail": "Password reset email sent."})
    

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.query_params.get("uid")
        token = request.query_params.get("token")
        new_password = request.data.get("new_password")
        new_password2 = request.data.get("new_password2")

        if not uidb64 or not token:
            return Response({"detail": "uid and token are required."},
                            status=status.HTTP_400_BAD_REQUEST)
        if new_password != new_password2:
            return Response({"detail": "Passwords do not match."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"detail": "Invalid user id."},
                            status=status.HTTP_400_BAD_REQUEST)
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."},
                            status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset successfully."})
    

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        new_password2 = request.data.get("new_password2")

        user = request.user
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."},
                            status=status.HTTP_400_BAD_REQUEST)
        if new_password != new_password2:
            return Response({"detail": "New passwords do not match."},
                            status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
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
    permission_classes = [IsAdminUser]

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


class ProfilePictureUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("profile_picture")
        if not file_obj:
            return Response({"detail": "No file provided."},
                            status=status.HTTP_400_BAD_REQUEST)

        allowed_extensions = ['.jpg', '.jpeg', '.png']
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in allowed_extensions:
            return Response(
                {"detail": "Unsupported file type. Only JPG and PNG files are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            compressed_file = compress_image(file_obj)
        except Exception as e:
            return Response(
                {"detail": "Error processing image: " + str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        if user.profile_picture:
            try:
                default_storage.delete(user.profile_picture.name)
            except Exception as e:
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
