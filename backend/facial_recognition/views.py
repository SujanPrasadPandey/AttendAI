from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView, ListAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404
from .models import FaceImage, FaceEmbedding, StudentProfile, UnrecognizedFace, ReviewFace
from .serializers import (
    EnrollFaceSerializer, MarkAttendanceSerializer, AssignUnrecognizedFaceSerializer,
    ConfirmReviewFaceSerializer, FaceImageSerializer, UnrecognizedFaceSerializer, ReviewFaceSerializer, MarkAttendanceVideoSerializer
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

from rest_framework.permissions import IsAuthenticated
from .permissions import AdminOnlyPermission, TeacherOrAdminPermission


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
    img = img.convert('RGB')
    img.thumbnail(max_size, PilImage.Resampling.LANCZOS)  # Resize while preserving aspect ratio
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality)  # Compress to JPEG
    output.seek(0)
    return ContentFile(output.read(), name=image_file.name)


# Enroll a single face image
class EnrollFaceView(GenericAPIView):
    permission_classes = [IsAuthenticated, AdminOnlyPermission]
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
    permission_classes = [IsAuthenticated, AdminOnlyPermission]
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
    permission_classes = [IsAuthenticated, AdminOnlyPermission]
    serializer_class = FaceImageSerializer

    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(StudentProfile, pk=student_id)
        return student.face_images.all()


class MarkAttendanceView(GenericAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
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
                    bbox = face.bbox.astype(int)
                    # Get image dimensions
                    h, w = image.shape[:2]
                    # Clip bounding box coordinates to image boundaries
                    left = max(0, bbox[0])
                    top = max(0, bbox[1])
                    right = min(w, bbox[2])
                    bottom = min(h, bbox[3])
                    # Check if the cropped region would be empty
                    if right <= left or bottom <= top:
                        continue  # Skip this face
                    # Crop the face using the validated bounding box
                    cropped = image[top:bottom, left:right]
                    cropped_pil = Image.fromarray(cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB))

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

            # Return success response
            return Response({
                "message": f"Attendance marked for {len(recognized_student_ids)} students.",
                "recognized_students": list(recognized_student_ids),
                "status": status_input
            }, status=status.HTTP_200_OK)

        # Return validation errors if serializer is invalid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# List unrecognized faces
class UnrecognizedFaceListView(ListAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
    serializer_class = UnrecognizedFaceSerializer
    queryset = UnrecognizedFace.objects.filter(identified_student__isnull=True, discarded=False)

# Assign unrecognized face to a student
class AssignUnrecognizedFaceView(GenericAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
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
                # Create a FaceImage object to make the photo visible in the frontend
                FaceImage.objects.create(
                    student=student,
                    image=face.image,
                    embedding=face.embedding
                )
                # Optionally, mark the UnrecognizedFace as discarded
                # face.discarded = True
                # face.save()
                return Response(
                    {"message": "Face assigned, embedding updated, and image added to student's photos."},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"message": "Face remains unassigned for admin review."},
                    status=status.HTTP_200_OK
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# List review faces
class ReviewFaceListView(ListAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
    serializer_class = ReviewFaceSerializer
    
    def get_queryset(self):
        include_discarded = self.request.query_params.get('include_discarded', 'false').lower() == 'true'
        if include_discarded:
            return ReviewFace.objects.all()
        return ReviewFace.objects.filter(discarded=False)

# Confirm or correct review face
class ConfirmReviewFaceView(GenericAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
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

import logging
import traceback
import os

logger = logging.getLogger(__name__)

class MarkAttendanceVideoView(GenericAPIView):
    permission_classes = [IsAuthenticated, TeacherOrAdminPermission]
    serializer_class = MarkAttendanceVideoSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            video_file = serializer.validated_data['video']
            status_input = serializer.validated_data['status']
            today = date.today()
            recognized_student_ids = set()

            try:
                # Log video file details
                logger.info(f"Received video: name={video_file.name}, size={video_file.size} bytes")

                # Save video file temporarily to disk
                temp_video_path = f"/tmp/{uuid.uuid4()}.mp4"
                logger.info(f"Saving video to: {temp_video_path}")
                with open(temp_video_path, 'wb') as f:
                    for chunk in video_file.chunks():
                        f.write(chunk)

                # Verify file was written
                if not os.path.exists(temp_video_path):
                    logger.error(f"Temporary video file not created: {temp_video_path}")
                    return Response({"error": "Failed to save video file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Open video with OpenCV
                logger.info("Opening video with cv2.VideoCapture")
                cap = cv2.VideoCapture(temp_video_path)
                if not cap.isOpened():
                    logger.error(f"Failed to open video file: {temp_video_path}")
                    cap.release()
                    os.remove(temp_video_path)
                    return Response({"error": "Unable to open video file."}, status=status.HTTP_400_BAD_REQUEST)

                # Get video properties
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                logger.info(f"Video properties: frame_count={frame_count}, fps={fps}")

                if frame_count <= 0 or fps <= 0:
                    logger.error("Invalid video: zero frames or invalid FPS")
                    cap.release()
                    os.remove(temp_video_path)
                    return Response({"error": "Invalid video: zero frames or invalid FPS."}, status=status.HTTP_400_BAD_REQUEST)

                # Calculate frame indices to extract (5 frames evenly spaced)
                num_frames_to_extract = 5
                if frame_count < num_frames_to_extract:
                    logger.error(f"Video has too few frames: {frame_count}")
                    cap.release()
                    os.remove(temp_video_path)
                    return Response({"error": "Video has too few frames."}, status=status.HTTP_400_BAD_REQUEST)

                step = frame_count // num_frames_to_extract
                frame_indices = [i * step for i in range(num_frames_to_extract)]
                logger.info(f"Extracting frames at indices: {frame_indices}")

                # Process each selected frame
                for idx in frame_indices:
                    logger.info(f"Processing frame {idx}")
                    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                    ret, frame = cap.read()
                    if not ret:
                        logger.warning(f"Failed to read frame {idx}")
                        continue

                    # Convert frame to PIL Image for processing
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_image = Image.fromarray(frame_rgb)

                    # Detect faces in the frame
                    logger.info(f"Detecting faces in frame {idx}")
                    faces = app.get(frame)
                    logger.info(f"Found {len(faces)} faces in frame {idx}")
                    for face in faces:
                        embedding = face.normed_embedding.tolist()
                        bbox = face.bbox.astype(int)
                        h, w = frame.shape[:2]
                        left = max(0, bbox[0])
                        top = max(0, bbox[1])
                        right = min(w, bbox[2])
                        bottom = min(h, bbox[3])
                        if right <= left or bottom <= top:
                            logger.warning(f"Invalid bounding box for face in frame {idx}")
                            continue

                        # Crop face
                        cropped = frame[top:bottom, left:right]
                        cropped_pil = Image.fromarray(cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB))

                        # Find best match
                        students = StudentProfile.objects.filter(face_embedding__isnull=False)
                        best_match = None
                        highest_similarity = 0
                        for student in students:
                            avg_embedding = student.face_embedding.avg_embedding
                            if avg_embedding:
                                similarity = cosine_similarity([embedding], [avg_embedding])[0][0]
                                if similarity > highest_similarity:
                                    highest_similarity = similarity
                                    best_match = student

                        # Process based on similarity
                        if best_match and highest_similarity >= SIMILARITY_THRESHOLD:
                            recognized_student_ids.add(best_match.id)
                            if highest_similarity >= HIGH_CONFIDENCE_THRESHOLD:
                                update_embedding_with_new_face(best_match, embedding)
                            else:
                                filename = f'review_{uuid.uuid4()}.jpg'
                                image_file_review = save_pil_image_to_file(cropped_pil, filename)
                                ReviewFace.objects.create(
                                    suggested_student=best_match,
                                    image=image_file_review,
                                    embedding=embedding,
                                    similarity=highest_similarity
                                )
                        else:
                            filename = f'unrecognized_{uuid.uuid4()}.jpg'
                            image_file_unrec = save_pil_image_to_file(cropped_pil, filename)
                            UnrecognizedFace.objects.create(
                                image=image_file_unrec,
                                embedding=embedding
                            )

                # Release video capture and clean up
                cap.release()
                if os.path.exists(temp_video_path):
                    os.remove(temp_video_path)
                    logger.info(f"Cleaned up temporary file: {temp_video_path}")

                # Mark attendance for recognized students
                for student_id in recognized_student_ids:
                    student = StudentProfile.objects.get(id=student_id)
                    CentralAttendanceRecord.objects.get_or_create(
                        student=student,
                        date=today,
                        defaults={
                            'status': 'present' if status_input == 'onTime' else 'late',
                            'recorded_by': None,
                            'note': 'Marked via facial recognition (video)'
                        }
                    )

                logger.info(f"Attendance marked for {len(recognized_student_ids)} students")
                return Response({
                    "message": f"Attendance marked for {len(recognized_student_ids)} students from video.",
                    "recognized_students": list(recognized_student_ids),
                    "status": status_input
                }, status=status.HTTP_200_OK)

            except Exception as e:
                logger.error(f"Error processing video: {str(e)}\n{traceback.format_exc()}")
                if 'cap' in locals():
                    cap.release()
                if 'temp_video_path' in locals() and os.path.exists(temp_video_path):
                    os.remove(temp_video_path)
                return Response({"error": f"Error processing video: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)