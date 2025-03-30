from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from rest_framework.permissions import IsAuthenticated

class LeaveRequestCreateView(GenericAPIView):
    """
    Endpoint to submit a new leave request.
    Expects JSON data with:
      - student: the StudentProfile ID (as integer)
      - start_date: "YYYY-MM-DD"
      - end_date: "YYYY-MM-DD"
      - reason: string
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LeaveRequestSerializer

    def post(self, request, format=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Defaults to 'pending'
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LeaveRequestListView(ListAPIView):
    """
    Endpoint to list leave requests.
    You can optionally filter by student ID with the query parameter 'student'.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        student_id = self.request.query_params.get('student')
        if student_id:
            return LeaveRequest.objects.filter(student_id=student_id)
        return LeaveRequest.objects.all()

class LeaveRequestUpdateView(GenericAPIView):
    """
    Endpoint for an admin to update a leave request.
    Expects:
      - action: 'approve' or 'deny'
      - (Optional) admin_comment: a comment from the admin
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LeaveRequestSerializer

    def put(self, request, pk, format=None):
        leave_request = get_object_or_404(LeaveRequest, pk=pk)
        action = request.data.get('action')
        if action not in ['approve', 'deny']:
            return Response({"error": "Action must be 'approve' or 'deny'."},
                            status=status.HTTP_400_BAD_REQUEST)
        if action == 'approve':
            leave_request.status = 'approved'
        else:
            leave_request.status = 'denied'
        leave_request.admin_comment = request.data.get('admin_comment', '')
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
