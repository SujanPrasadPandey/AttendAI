from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .utils import send_verification_email
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.urls import reverse
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings




CustomUser = get_user_model()
signer = TimestampSigner()

class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # If the user provided an email, send a verification email.
        if user.email:
            request = self.request  # needed to build absolute URL
            send_verification_email(user, request)


class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response({"detail": "Token is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            # Allow tokens to be valid for 1 day (86400 seconds)
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
        # Build the password reset confirmation URL.
        relative_link = reverse("password-reset-confirm")
        reset_url = request.build_absolute_uri(f"{relative_link}?uid={uid}&token={token}")
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
