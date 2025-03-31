from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from school_data.models import TeacherProfile, SchoolClass
from .models import TeacherClassAccess
from .serializers import TeacherAccessRequestSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

class RequestTeacherAccessView(GenericAPIView):
    """
    Endpoint for a teacher to request access to a class.
    Expects:
      - teacher_id: ID of the TeacherProfile (in request.data)
      - school_class_id: ID of the SchoolClass (in request.data)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherAccessRequestSerializer

    def post(self, request, format=None):
        teacher_id = request.data.get('teacher_id')
        school_class_id = request.data.get('school_class_id')
        if not teacher_id or not school_class_id:
            return Response({"error": "teacher_id and school_class_id are required."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        teacher_profile = get_object_or_404(TeacherProfile, pk=teacher_id)
        school_class = get_object_or_404(SchoolClass, pk=school_class_id)
        
        # Create a new access request (status defaults to 'pending')
        access_request = TeacherClassAccess.objects.create(
            teacher=teacher_profile,
            school_class=school_class,
        )
        serializer = self.get_serializer(access_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ListTeacherAccessRequestsView(ListAPIView):
    """
    Endpoint to list teacher access requests.
    Optionally filter by teacher_id via query parameter.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherAccessRequestSerializer

    def get_queryset(self):
        teacher_id = self.request.query_params.get('teacher_id')
        if teacher_id:
            return TeacherClassAccess.objects.filter(teacher_id=teacher_id)
        return TeacherClassAccess.objects.all()

class UpdateTeacherAccessRequestView(GenericAPIView):
    """
    Endpoint for an admin to update an access request.
    Expects:
      - action: 'approve' or 'deny' in request.data
      - (Optional) duration_days: number of days access is granted (if approving)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherAccessRequestSerializer

    def put(self, request, pk, format=None):
        action = request.data.get('action')
        valid_actions = ['approve', 'deny', 'pending']
        if action not in valid_actions:
            return Response({"error": "Action must be 'approve', 'deny', or 'pending'."},
                            status=status.HTTP_400_BAD_REQUEST)

        access_request = get_object_or_404(TeacherClassAccess, pk=pk)

        if action == 'approve':
            duration_days = int(request.data.get('duration_days', 1))
            access_request.approve(duration_days=duration_days)
        elif action == 'deny':
            access_request.deny()
        elif action == 'pending':
            access_request.status = 'pending'
            access_request.approved_at = None
            access_request.expiry_at = None
            access_request.save()

        serializer = self.get_serializer(access_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
