from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView, ListAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404
from .models import FaceImage, FaceEmbedding, StudentProfile, UnrecognizedFace, ReviewFace
from .serializers import (
    EnrollFaceSerializer, MarkAttendanceSerializer, AssignUnrecognizedFaceSerializer,
    ConfirmReviewFaceSerializer, FaceImageSerializer, UnrecognizedFaceSerializer, ReviewFaceSerializer
)
from attendance.models import AttendanceRecord as CentralAttendanceRecord
from insightface.app import FaceAnalysis
import numpy as np
import cv2
from PIL import Image
from datetime import date
from sklearn.metrics.pairwise import cosine_similarity
import uuid
from PIL import Image as PilImage
from io import BytesIO
from django.core.files import File
from django.core.files.base import ContentFile
from .utils import recalculate_embedding

# Initialize InsightFace model
app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640), det_thresh=0.4)

# Thresholds
SIMILARITY_THRESHOLD = 0.4
HIGH_CONFIDENCE_THRESHOLD = 0.9

# Helper functions
def compute_embedding(image_file):
    image = Image.open(image_file).convert('RGB')
    image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    faces = app.get(image)
    if len(faces) != 1:
        return None
    return faces[0].normed_embedding.tolist()

def crop_face(image_file):
    image = Image.open(image_file).convert('RGB')
    image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    faces = app.get(image)
    if not faces:
        return None
    face = faces[0]
    bbox = face.bbox.astype(int)
    cropped = Image.fromarray(cv2.cvtColor(image[bbox[1]:bbox[3], bbox[0]:bbox[2]], cv2.COLOR_BGR2RGB))
    return cropped

def update_embedding_with_new_face(student, new_embedding):
    face_embedding, created = FaceEmbedding.objects.get_or_create(student=student)
    if not face_embedding.avg_embedding:
        face_embedding.avg_embedding = new_embedding
        face_embedding.num_samples = 1
    else:
        current_embedding = np.array(face_embedding.avg_embedding)
        new_embedding = np.array(new_embedding)
        avg_embedding = (current_embedding * face_embedding.num_samples + new_embedding) / (face_embedding.num_samples + 1)
        face_embedding.avg_embedding = avg_embedding.tolist()
        face_embedding.num_samples += 1
    face_embedding.save()

def save_pil_image_to_file(pil_image, filename):
    buffer = BytesIO()
    pil_image.save(buffer, format='JPEG')
    buffer.seek(0)
    return File(buffer, name=filename)

def compress_image(image_file, max_size=(640, 640), quality=85):
    img = PilImage.open(image_file)
    img.thumbnail(max_size, PilImage.Resampling.LANCZOS)  # Resize while preserving aspect ratio
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality)  # Compress to JPEG
    output.seek(0)
    return ContentFile(output.read(), name=image_file.name)


# Enroll a single face image
class EnrollFaceView(GenericAPIView):
    serializer_class = EnrollFaceSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            student_id = serializer.validated_data['student_id']
            image_file = serializer.validated_data['image']
            compressed_image = compress_image(image_file)  # Compress the image
            student = get_object_or_404(StudentProfile, pk=student_id)
            embedding = compute_embedding(compressed_image)  # Use compressed image
            if not embedding:
                return Response({"error": "Image must contain exactly one face."}, status=status.HTTP_400_BAD_REQUEST)
            FaceImage.objects.create(student=student, image=compressed_image, embedding=embedding)
            update_embedding_with_new_face(student, embedding)
            return Response({"message": "Image enrolled successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Remove a face image
class RemoveFaceImageView(DestroyAPIView):
    queryset = FaceImage.objects.all()
    serializer_class = FaceImageSerializer
    lookup_field = 'pk'

    def destroy(self, request, *args, **kwargs):
        face_image = self.get_object()
        student = face_image.student
        face_image.delete()
        # Recalculate average embedding
        face_images = student.face_images.all()
        embeddings = [img.embedding for img in face_images if img.embedding]
        if embeddings:
            avg_embedding = np.mean(embeddings, axis=0).tolist()
            face_embedding = student.face_embedding
            face_embedding.avg_embedding = avg_embedding
            face_embedding.num_samples = len(embeddings)
            face_embedding.save()
        return Response({"message": "Image removed successfully."}, status=status.HTTP_200_OK)

# List a student’s face images
class StudentFaceImagesView(ListAPIView):
    serializer_class = FaceImageSerializer

    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(StudentProfile, pk=student_id)
        return student.face_images.all()


class MarkAttendanceView(GenericAPIView):
    serializer_class = MarkAttendanceSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            images = serializer.validated_data['images']
            status_input = serializer.validated_data['status']
            today = date.today()
            recognized_student_ids = set()

            # Process each uploaded image for face recognition
            for image_file in images:
                # Convert uploaded image to a format suitable for face detection
                image = Image.open(image_file).convert('RGB')
                image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                faces = app.get(image)  # Detect all faces in the image

                for face in faces:
                    embedding = face.normed_embedding.tolist()
                    students = StudentProfile.objects.filter(face_embedding__isnull=False)
                    best_match = None
                    highest_similarity = 0

                    # Find the best match among enrolled students
                    for student in students:
                        avg_embedding = student.face_embedding.avg_embedding
                        if avg_embedding:
                            similarity = cosine_similarity([embedding], [avg_embedding])[0][0]
                            if similarity > highest_similarity:
                                highest_similarity = similarity
                                best_match = student

                    # Crop the face using its bounding box
                    bbox = face.bbox.astype(int)
                    cropped = image[bbox[1]:bbox[3], bbox[0]:bbox[2]]
                    cropped_pil = Image.fromarray(cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB))

                    # Process based on similarity
                    if best_match and highest_similarity >= SIMILARITY_THRESHOLD:  # 0.4 or higher
                        # Mark attendance
                        recognized_student_ids.add(best_match.id)
                        
                        if highest_similarity >= HIGH_CONFIDENCE_THRESHOLD:  # 0.9 or higher
                            # High confidence: update embedding automatically
                            update_embedding_with_new_face(best_match, embedding)
                        else:  # Between 0.4 and 0.9
                            # Medium confidence: save for admin review
                            filename = f'review_{uuid.uuid4()}.jpg'
                            image_file_review = save_pil_image_to_file(cropped_pil, filename)
                            ReviewFace.objects.create(
                                suggested_student=best_match,
                                image=image_file_review,
                                embedding=embedding,
                                similarity=highest_similarity
                            )
                    else:
                        # No match or similarity < 0.4: save as unrecognized
                        filename = f'unrecognized_{uuid.uuid4()}.jpg'
                        image_file_unrec = save_pil_image_to_file(cropped_pil, filename)
                        UnrecognizedFace.objects.create(
                            image=image_file_unrec,
                            embedding=embedding
                        )

            # Mark attendance for recognized students using the attendance app's model
            for student_id in recognized_student_ids:
                student = StudentProfile.objects.get(id=student_id)
                CentralAttendanceRecord.objects.get_or_create(
                    student=student,  # Assumes StudentProfile has a 'user' field linked to User
                    date=today,
                    defaults={
                        'status': 'present' if status_input == 'onTime' else 'late',
                        'recorded_by': None,  # Automated marking, no specific user
                        'note': 'Marked via facial recognition'
                    }
                )

            # Return success response2
            return Response({
                "message": f"Attendance marked for {len(recognized_student_ids)} students.",
                "recognized_students": list(recognized_student_ids),
                "status": status_input
            }, status=status.HTTP_200_OK)

        # Return validation errors if serializer is invalid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# List unrecognized faces
class UnrecognizedFaceListView(ListAPIView):
    serializer_class = UnrecognizedFaceSerializer
    queryset = UnrecognizedFace.objects.filter(identified_student__isnull=True, discarded=False)

# Assign unrecognized face to a student
class AssignUnrecognizedFaceView(GenericAPIView):
    serializer_class = AssignUnrecognizedFaceSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            face_id = serializer.validated_data['face_id']
            student_id = serializer.validated_data.get('student_id')
            face = get_object_or_404(UnrecognizedFace, pk=face_id)

            if student_id:
                student = get_object_or_404(StudentProfile, pk=student_id)
                face.identified_student = student
                face.save()
                update_embedding_with_new_face(student, face.embedding)
                return Response({"message": "Face assigned and embedding updated."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Face remains unassigned for admin review."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# List review faces
class ReviewFaceListView(ListAPIView):
    serializer_class = ReviewFaceSerializer
    queryset = ReviewFace.objects.filter(discarded=False)

# Confirm or correct review face
class ConfirmReviewFaceView(GenericAPIView):
    serializer_class = ConfirmReviewFaceSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            face_id = serializer.validated_data['face_id']
            action = serializer.validated_data['action']
            confirmed_student_id = serializer.validated_data.get('confirmed_student_id')
            face = get_object_or_404(ReviewFace, pk=face_id)

            if action in ['confirm', 'reassign']:
                if not confirmed_student_id:
                    return Response({"error": "confirmed_student_id required."}, status=400)
                confirmed_student = get_object_or_404(StudentProfile, pk=confirmed_student_id)
                old_student = None

                if face.confirmed_student and face.confirmed_student != confirmed_student:
                    # Reassignment: Adjust embeddings for old and new students
                    old_student = face.confirmed_student
                    if face.face_image:
                        # Move the FaceImage to the new student
                        face.face_image.student = confirmed_student
                        face.face_image.save()
                        # Recalculate embeddings
                        recalculate_embedding(old_student)
                        recalculate_embedding(confirmed_student)
                    else:
                        # Shouldn’t happen, but create FaceImage if missing
                        face_image = FaceImage.objects.create(
                            student=confirmed_student,
                            image=face.image,
                            embedding=face.embedding
                        )
                        face.face_image = face_image
                        recalculate_embedding(confirmed_student)
                else:
                    # First confirmation or same student
                    if not face.face_image:
                        face_image = FaceImage.objects.create(
                            student=confirmed_student,
                            image=face.image,
                            embedding=face.embedding
                        )
                        face.face_image = face_image
                        recalculate_embedding(confirmed_student)
                    # If face_image exists, no action needed unless student changed

                face.confirmed_student = confirmed_student
                face.save()
                return Response({"message": f"Review face {'confirmed' if action == 'confirm' else 'reassigned'}."}, status=200)

            elif action == 'discard':
                if face.face_image:
                    student = face.face_image.student
                    face.face_image.delete()
                    recalculate_embedding(student)
                face.discarded = True
                face.save()
                return Response({"message": "Review face discarded."}, status=200)

            return Response({"error": "Invalid action."}, status=400)
        return Response(serializer.errors, status=400)