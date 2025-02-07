from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.urls import reverse

signer = TimestampSigner()

def send_verification_email(user, request):
    token = signer.sign(user.pk)
    # Create a URL for the verification endpoint; make sure you have added its URL later.
    relative_link = reverse("verify-email")
    verify_url = request.build_absolute_uri(f"{relative_link}?token={token}")
    subject = "Verify your email"
    message = (
        f"Hi {user.username},\n\n"
        f"Please click the link below to verify your email address:\n{verify_url}\n\n"
        "If you did not register, please ignore this email."
    )
    # Ensure you have DEFAULT_FROM_EMAIL and email backend configured in settings.
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
