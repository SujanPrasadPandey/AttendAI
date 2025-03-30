import uuid
import numpy as np
import cv2
from PIL import Image
import logging
from django.utils.timezone import now

from django.conf import settings
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from school_data.models import StudentProfile
from .models import FaceEmbedding, UnrecognizedFace, ReviewFace
from .serializers import (
    EnrollFaceSerializer,
    MarkAttendanceSerializer,
    BatchEnrollFaceSerializer,
    ReviewFaceSerializer,
    UnrecognizedFaceSerializer,
    ReviewFaceAssignmentSerializer,
    FaceEmbeddingSerializer,
)

# Import your existing attendance model (from your attendance app)
from attendance.models import AttendanceRecord

# Facial recognition libraries
from insightface.app import FaceAnalysis
import onnxruntime as ort
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Thresholds (adjust as needed)
SIMILARITY_THRESHOLD = 0.3      # minimum threshold to consider a candidate match
HIGH_CONFIDENCE_THRESHOLD = 0.6   # above this threshold, automatically accept

# Set up providers: use GPU if available, otherwise CPU
available_providers = ort.get_available_providers()
providers = ['CUDAExecutionProvider'] if 'CUDAExecutionProvider' in available_providers else ['CPUExecutionProvider']

# Initialize the face analysis application with the 'buffalo_l' model
app = FaceAnalysis(name='buffalo_l', providers=providers)
app.prepare(ctx_id=0, det_size=(640, 640), det_thresh=0.4)

# Helper function to convert an uploaded image to OpenCV format
def load_image_from_request(image_file):
    image = Image.open(image_file)
    image = image.convert('RGB')
    image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    return image


class EnrollFaceView(GenericAPIView):
    """
    Endpoint to enroll or update a student's face embedding.
    Expects:
      - student_id (in request.data)
      - image file (in request.FILES with key "image")
    """
    serializer_class = EnrollFaceSerializer

    def post(self, request, format=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            student_id = serializer.validated_data.get("student_id")
            image_file = serializer.validated_data.get("image")
            try:
                student_profile = StudentProfile.objects.get(pk=student_id)
            except StudentProfile.DoesNotExist:
                return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
            image = load_image_from_request(image_file)
            faces = app.get(image)
            if len(faces) != 1:
                # Save the full image as an unrecognized face
                UnrecognizedFace.objects.create(
                    image=image_file,
                    note=f"Expected 1 face, detected {len(faces)}."
                )
                return Response({"error": "Image must contain exactly one face."}, status=status.HTTP_400_BAD_REQUEST)
            
            embedding = faces[0].normed_embedding.tolist()
            face_embedding, created = FaceEmbedding.objects.get_or_create(student=student_profile)
            if face_embedding.avg_embedding:
                current_avg = np.array(face_embedding.avg_embedding)
                num_samples = face_embedding.num_samples
                new_avg = (current_avg * num_samples + np.array(embedding)) / (num_samples + 1)
                face_embedding.avg_embedding = new_avg.tolist()
                face_embedding.num_samples = num_samples + 1
            else:
                face_embedding.avg_embedding = embedding
                face_embedding.num_samples = 1

            face_embedding.embeddings[str(face_embedding.num_samples)] = embedding
            face_embedding.save()
            return Response({
                "message": "Enrollment updated.",
                "avg_embedding": face_embedding.avg_embedding,
                "num_samples": face_embedding.num_samples
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BatchEnrollFaceView(GenericAPIView):
    """
    Endpoint for batch enrollment.
    Expects a JSON payload:
      {
         "enrollments": [
              {
                  "student_id": 1,
                  "images": [<image1>, <image2>, ...]
              },
              {
                  "student_id": 2,
                  "images": [<image1>, <image2>, ...]
              },
              ...
         ]
      }
    """
    serializer_class = BatchEnrollFaceSerializer

    def post(self, request, format=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            results = []
            for enrollment in serializer.validated_data['enrollments']:
                student_id = enrollment.get("student_id")
                image_files = enrollment.get("images")
                try:
                    student_profile = StudentProfile.objects.get(pk=student_id)
                except StudentProfile.DoesNotExist:
                    results.append({
                        "student_id": student_id,
                        "status": "error",
                        "message": "Student profile not found"
                    })
                    continue

                face_embedding, created = FaceEmbedding.objects.get_or_create(student=student_profile)
                enrollment_success = 0
                for image_file in image_files:
                    image = load_image_from_request(image_file)
                    faces = app.get(image)
                    if len(faces) != 1:
                        UnrecognizedFace.objects.create(
                            image=image_file,
                            note=f"Expected 1 face, detected {len(faces)}."
                        )
                        continue
                    embedding = faces[0].normed_embedding.tolist()
                    if face_embedding.avg_embedding:
                        current_avg = np.array(face_embedding.avg_embedding)
                        num_samples = face_embedding.num_samples
                        new_avg = (current_avg * num_samples + np.array(embedding)) / (num_samples + 1)
                        face_embedding.avg_embedding = new_avg.tolist()
                        face_embedding.num_samples = num_samples + 1
                    else:
                        face_embedding.avg_embedding = embedding
                        face_embedding.num_samples = 1

                    face_embedding.embeddings[str(face_embedding.num_samples)] = embedding
                    face_embedding.save()
                    enrollment_success += 1

                results.append({
                    "student_id": student_id,
                    "status": "success" if enrollment_success > 0 else "failed",
                    "processed_images": enrollment_success
                })

            return Response({"results": results}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MarkAttendanceView(GenericAPIView):
    """
    Endpoint to mark attendance by analyzing one or multiple uploaded classroom images.
    Expects:
      {
         "images": [<image1>, <image2>, ...]
      }
    Processes all images to recognize faces, deduplicates recognized students, marks attendance
    for today using the existing AttendanceRecord model, and saves unrecognized or low-confidence
    images for review.
    """
    serializer_class = MarkAttendanceSerializer

    def post(self, request, format=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            image_files = serializer.validated_data.get("images")
            recognized_user_ids = set()  # IDs for high-confidence recognized faces

            # Process each image
            for image_file in image_files:
                image = load_image_from_request(image_file)
                faces = app.get(image)

                if not faces:
                    # Save the full image as unrecognized if no face is detected
                    UnrecognizedFace.objects.create(
                        image=image_file,
                        note="No face detected."
                    )
                    continue

                all_embeddings = FaceEmbedding.objects.filter(avg_embedding__isnull=False)
                for face in faces:
                    face_emb = face.normed_embedding
                    best_match = None
                    best_similarity = 0.0
                    for fe in all_embeddings:
                        stored_emb = np.array(fe.avg_embedding)
                        sim = cosine_similarity([face_emb], [stored_emb])[0][0]
                        if sim > best_similarity:
                            best_similarity = sim
                            best_match = fe

                    if best_similarity >= HIGH_CONFIDENCE_THRESHOLD and best_match:
                        recognized_user_ids.add(best_match.student.user.id)
                    elif SIMILARITY_THRESHOLD <= best_similarity < HIGH_CONFIDENCE_THRESHOLD:
                        # Save this face for review (low confidence)
                        ReviewFace.objects.create(
                            student=best_match.student if best_match else None,
                            image=image_file,
                            similarity=best_similarity,
                            note="Low confidence recognition."
                        )
                    else:
                        # If similarity is below the minimum threshold, treat as unrecognized.
                        UnrecognizedFace.objects.create(
                            image=image_file,
                            note=f"Low similarity: {best_similarity:.2f}"
                        )

            # Mark attendance using the existing AttendanceRecord model.
            today = now().date()
            attendance_records = []
            for user_id in recognized_user_ids:
                record, created = AttendanceRecord.objects.get_or_create(
                    student_id=user_id,
                    date=today,
                    defaults={'status': 'present', 'note': 'Auto marked via facial recognition'}
                )
                attendance_records.append({
                    "student_id": user_id,
                    "date": str(today),
                    "recorded": created  # True if a new record was created
                })

            return Response({
                "date": str(today),
                "attendance_records": attendance_records,
                "recognized_students": list(recognized_user_ids)
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# New endpoints for review functionality

class ReviewFaceListView(ListAPIView):
    """
    List all review face records (low-confidence images) that need manual assignment.
    """
    queryset = ReviewFace.objects.all()
    serializer_class = ReviewFaceSerializer


class UnrecognizedFaceListView(ListAPIView):
    """
    List all unrecognized face records.
    """
    queryset = UnrecognizedFace.objects.all()
    serializer_class = UnrecognizedFaceSerializer


class ReviewFaceAssignmentView(APIView):
    """
    Endpoint to assign a review face to a student.
    Expects a payload:
    {
        "review_face_id": <id>,
        "student_id": <id>
    }
    This view will reprocess the review face image to extract its embedding and then update the student's FaceEmbedding record.
    After assignment, the review face record is deleted.
    """
    serializer_class = ReviewFaceAssignmentSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            review_face_id = serializer.validated_data.get("review_face_id")
            student_id = serializer.validated_data.get("student_id")
            try:
                review_face = ReviewFace.objects.get(pk=review_face_id)
            except ReviewFace.DoesNotExist:
                return Response({"error": "Review face not found."}, status=status.HTTP_404_NOT_FOUND)
            try:
                student_profile = StudentProfile.objects.get(pk=student_id)
            except StudentProfile.DoesNotExist:
                return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
            # Reprocess the review face image to extract the embedding
            image = load_image_from_request(review_face.image)
            faces = app.get(image)
            if not faces or len(faces) != 1:
                return Response({"error": "The review face does not contain exactly one face."},
                                status=status.HTTP_400_BAD_REQUEST)
            embedding = faces[0].normed_embedding.tolist()
            face_embedding, created = FaceEmbedding.objects.get_or_create(student=student_profile)
            if face_embedding.avg_embedding:
                current_avg = np.array(face_embedding.avg_embedding)
                num_samples = face_embedding.num_samples
                new_avg = (current_avg * num_samples + np.array(embedding)) / (num_samples + 1)
                face_embedding.avg_embedding = new_avg.tolist()
                face_embedding.num_samples = num_samples + 1
            else:
                face_embedding.avg_embedding = embedding
                face_embedding.num_samples = 1

            face_embedding.embeddings[str(face_embedding.num_samples)] = embedding
            face_embedding.save()
            # Remove the review face record after assignment
            review_face.delete()
            return Response({"message": "Review face assigned and enrollment updated."},
                            status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
