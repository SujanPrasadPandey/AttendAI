from rest_framework.generics import RetrieveAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import AttendancePolicy
from .serializers import AttendancePolicySerializer
from rest_framework.permissions import IsAuthenticated

class RetrievePolicyView(RetrieveAPIView):
    """
    Endpoint to retrieve the current attendance policy settings.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AttendancePolicySerializer

    def get_object(self):
        policy, created = AttendancePolicy.objects.get_or_create(id=1)
        return policy

class UpdatePolicyView(GenericAPIView):
    """
    Endpoint to update the attendance policy settings.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AttendancePolicySerializer

    def put(self, request, format=None):
        policy, created = AttendancePolicy.objects.get_or_create(id=1)
        serializer = self.get_serializer(policy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
