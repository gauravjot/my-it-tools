import pytz
import uuid
from datetime import datetime
# RestFramework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
# Session
from django_axor_auth.users.api import get_request_user
from django_axor_auth.users.permissions import IsAuthenticated
from django_axor_auth.utils.error_handling.error_message import ErrorMessage


# Models & Serializers
from .models import Run
from .serializers import RunListSerializer, RunSerializer


# Create a note
# -----------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_run(request):
    # -- user data & hash password
    timestamp = datetime.now(pytz.utc)
    distance = request.data['distance']
    time_start = request.data['time_start']
    time_end = request.data['time_end']
    is_interval = request.data['is_interval']
    laps = request.data['laps'] if 'laps' in request.data else None
    intervals = request.data['intervals'] if 'intervals' in request.data else None
    tcx = request.data['tcx'] if 'tcx' in request.data else None

    run = Run.objects.create(
        id=uuid.uuid4(),
        user=get_request_user(request),
        title=request.data['title'],
        tcx=tcx,
        distance=distance,
        time_start=time_start,
        time_end=time_end,
        is_interval=is_interval,
        added_on=timestamp,
        laps=laps,
        intervals=intervals
    )
    run.save()
    return Response(
        data={},
        status=status.HTTP_201_CREATED
    )


# Return list of all runs
# -----------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_runs(request):
    try:
        runs = RunListSerializer(
            Run.objects.filter(user=get_request_user(request)).order_by('-time_end'),
            many=True
        )
        return Response(data={"runs": runs.data}, status=status.HTTP_200_OK)
    except Run.DoesNotExist:
        return ErrorMessage(
            title="Runs not found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="R0411",
            detail="The runs could not be found."
        ).to_response()


# Return a single run
# -----------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_run(request, run_id):
    try:
        run = Run.objects.get(id=run_id, user=get_request_user(request))
        return Response(data={"run": RunSerializer(run).data, "tcx": run.tcx}, status=status.HTTP_200_OK)
    except Run.DoesNotExist:
        return ErrorMessage(
            title="Run not found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="R0412",
            detail="The run could not be found."
        ).to_response()


# Delete a run
# -----------------------------------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_run(request, run_id):
    try:
        run = Run.objects.get(id=run_id, user=get_request_user(request))
        run.delete()
        return Response(data={}, status=status.HTTP_204_NO_CONTENT)
    except Run.DoesNotExist:
        return ErrorMessage(
            title="Run not found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="R0413",
            detail="The run could not be found."
        ).to_response()
