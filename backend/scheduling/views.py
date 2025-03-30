from rest_framework import generics
from .models import DayOff, RoutineEntry
from .serializers import DayOffSerializer, RoutineEntrySerializer

# View for listing and creating DayOff events
class DayOffListCreateAPIView(generics.ListCreateAPIView):
    queryset = DayOff.objects.all()
    serializer_class = DayOffSerializer

# View for listing and creating Routine entries
class RoutineEntryListCreateAPIView(generics.ListCreateAPIView):
    queryset = RoutineEntry.objects.all()
    serializer_class = RoutineEntrySerializer
