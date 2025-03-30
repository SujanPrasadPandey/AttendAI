import os
from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
# from django.urls import reverse
from PIL import Image
import io
from django.core.files.uploadedfile import InMemoryUploadedFile


signer = TimestampSigner()

def send_verification_email(user, request):
    token = signer.sign(user.pk)

    # relative_link = reverse("users:verify-email")
    # verify_url = request.build_absolute_uri(f"{relative_link}?token={token}")

    frontend_url = os.getenv("FRONTEND_URL")
    verify_url = f"{frontend_url}/verify-email/?token={token}"

    subject = "Verify your email"
    message = (
        f"Hi {user.username},\n\n"
        f"Please click the link below to verify your email address:\n{verify_url}\n\n"
        "If you did not register, please ignore this email."
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


def compress_image(image_file, quality=70, max_size=(800, 800)):
    img = Image.open(image_file)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    img_io = io.BytesIO()
    img.save(img_io, format="JPEG", quality=quality)
    img_io.seek(0)

    compressed_image = InMemoryUploadedFile(
        img_io,
        None,
        image_file.name,
        'image/jpeg',
        img_io.getbuffer().nbytes,
        None
    )
    return compressed_image
