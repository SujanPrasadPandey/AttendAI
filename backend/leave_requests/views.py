from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsStudent, IsAdmin
from rest_framework.exceptions import PermissionDenied
from school_data.models import StudentProfile
from datetime import timedelta

class LeaveRequestCreateView(GenericAPIView):
    """
    Endpoint for students to submit a new leave request for themselves.
    Expects JSON data with:
    - start_date: "YYYY-MM-DD"
    - end_date: "YYYY-MM-DD"
    - reason: string
    """
    permission_classes = [IsStudent]
    serializer_class = LeaveRequestSerializer

    def post(self, request, format=None):
        # Ensure the user has a StudentProfile
        try:
            student_profile = request.user.studentprofile
        except StudentProfile.DoesNotExist:
            return Response(
                {"error": "Student profile not found for this user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Set student to the authenticated user's StudentProfile and status to 'pending'
            serializer.save(student=student_profile, status='pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LeaveRequestListView(ListAPIView):
    """
    Endpoint to list leave requests based on user role.
    - Students: See only their own requests.
    - Admins: See all requests, optionally filtered by student ID via ?student=<id>.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            # Students see only their own requests
            try:
                student_profile = user.studentprofile
                return LeaveRequest.objects.filter(student=student_profile)
            except StudentProfile.DoesNotExist:
                raise PermissionDenied("Student profile not found.")
        elif user.role == 'admin':
            # Admins can see all or filter by student ID
            student_id = self.request.query_params.get('student')
            if student_id:
                return LeaveRequest.objects.filter(student_id=student_id)
            return LeaveRequest.objects.all()
        else:
            # Deny access to other roles (e.g., teacher, parent) for now
            raise PermissionDenied("You do not have permission to view leave requests.")

# class LeaveRequestUpdateView(GenericAPIView):
#     """
#     Endpoint for admins to approve or deny a leave request.
#     Expects JSON data with:
#     - action: 'approve' or 'deny'
#     - (Optional) admin_comment: string
#     """
#     permission_classes = [IsAdmin]
#     serializer_class = LeaveRequestSerializer

#     def put(self, request, pk, format=None):
#         leave_request = get_object_or_404(LeaveRequest, pk=pk)
#         action = request.data.get('action')
#         if action not in ['approve', 'deny']:
#             return Response(
#                 {"error": "Action must be 'approve' or 'deny'."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         if action == 'approve':
#             leave_request.status = 'approved'
#         else:
#             leave_request.status = 'denied'
#         leave_request.admin_comment = request.data.get('admin_comment', '')
#         leave_request.save()
#         serializer = self.get_serializer(leave_request)
#         return Response(serializer.data, status=status.HTTP_200_OK)


class LeaveRequestUpdateView(GenericAPIView):
    """
    Endpoint for admins to approve or deny a leave request.
    Expects JSON data with:
    - action: 'approve' or 'deny'
    - (Optional) admin_comment: string
    """
    permission_classes = [IsAdmin]
    serializer_class = LeaveRequestSerializer

    def put(self, request, pk, format=None):
        leave_request = get_object_or_404(LeaveRequest, pk=pk)
        action = request.data.get('action')
        if action not in ['approve', 'deny']:
            return Response(
                {"error": "Action must be 'approve' or 'deny'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if action == 'approve':
            leave_request.status = 'approved'
            # Update attendance records for the approved leave
            self.update_attendance_records(leave_request)
        else:
            leave_request.status = 'denied'
        
        leave_request.admin_comment = request.data.get('admin_comment', '')
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update_attendance_records(self, leave_request):
        """
        Create attendance records for the approved leave days.
        """
        from attendance.models import AttendanceRecord

        start_date = leave_request.start_date
        end_date = leave_request.end_date
        student = leave_request.student

        # Iterate through each day in the leave period
        current_date = start_date
        while current_date <= end_date:
            AttendanceRecord.objects.create(
                student=student,
                date=current_date,
                status='leave',  # Use the 'Leave Approved' status
                note=f"Leave approved for reason: {leave_request.reason}",
                recorded_by=None  # Optional: Set the admin user if needed
            )
            current_date += timedelta(days=1)