import pytz
import json
import uuid
import random
import string
from datetime import datetime
# RestFramework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
# Session
from django_axor_auth.users.api import get_request_user
from django_axor_auth.users.permissions import IsAuthenticated
from django_axor_auth.security.hashing import hash_this
from django_axor_auth.utils.error_handling.error_message import ErrorMessage
# Models & Serializers
from .models import Note, ShareExternal
from .serializers import NoteListSerializer, ShareExternalSerializer
from .utils import encrypt_note, decrypt_note, InvalidKeyException


# Create a note
# -----------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_note(request):
    try:
        # -- user data & hash password
        timestamp = datetime.now(pytz.utc)
        note = Note.objects.create(
            id=uuid.uuid4(),
            title=request.data['title'],
            content=encrypt_note(request.data['content']),
            user=get_request_user(request),
            created=timestamp,
            updated=timestamp
        )
        note.save()
        return Response(
            data = {"content": json.dumps(request.data['content']), **NoteListSerializer(note).data},
            status=status.HTTP_201_CREATED
        )
    except Note.DoesNotExist:
        return ErrorMessage(
            title="Note not found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N0400",
            detail="The note could not be found."
        ).to_response()


# Get all notes
# -----------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes(request):
    try:
        notes = NoteListSerializer(
            Note.objects.filter(user=get_request_user(request)).order_by('updated'),
            many=True
        )
        return Response(data={"notes": notes.data}, status=status.HTTP_200_OK)
    except Note.DoesNotExist:
        return ErrorMessage(
            title="Notes not found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N0411",
            detail="The notes could not be found."
        ).to_response()


# Read, update, delete a note
# -----------------------------------------------
@api_view(['GET', 'DELETE', 'PUT', 'POST'])
@permission_classes([IsAuthenticated])
def note_ops(request, note_id):
    if request.method == 'GET':
        return read_note(request, note_id)
    elif request.method == 'PUT':
        return update_note_content(request, note_id)
    elif request.method == 'DELETE':
        return delete_note(request, note_id)
    return ErrorMessage(
        title="No Action Allowed",
        status=status.HTTP_400_BAD_REQUEST,
        instance=request.build_absolute_uri(),
        code="N0412",
        detail="Cannot perform note action."
    ).to_response()

# Read
def read_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=get_request_user(request))
        # Decrypt the note
        if note.content:
            content = decrypt_note(note.content)
        else:
            content = ""
        data = NoteListSerializer(note).data
        data['content'] = content
        return Response(data=data, status=status.HTTP_200_OK)
    except Note.DoesNotExist:
        return ErrorMessage(
            title="No note found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N0404",
            detail="This note does not exist."
        ).to_response()
    except InvalidKeyException:
        return ErrorMessage(
            title="Failed reading note",
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            instance=request.build_absolute_uri(),
            code="N0549",
            detail="This note cannot be retrieved."
        ).to_response()

# Delete
def delete_note(request, note_id):
    try:
        Note.objects.get(id=note_id, user=get_request_user(request)).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Note.DoesNotExist:
        return ErrorMessage(
            title="No note found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N0407",
            detail="This note does not exist."
        ).to_response()


# Update
def update_note_content(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=get_request_user(request))
        note.content = encrypt_note(request.data['content'])
        note.updated = datetime.now(pytz.utc)
        note.save()

        data = NoteListSerializer(note).data
        # We send json string of the content
        data['content'] = json.dumps(request.data['content'])

        return Response(data=data, status=status.HTTP_200_OK)
    except Note.DoesNotExist:
        return ErrorMessage(
            title="No note found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N0403",
            detail="This note does not exist."
        ).to_response()


# Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_note_title(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=get_request_user(request))
        note.title = request.data['title']
        note.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
    except Note.DoesNotExist:
        return ErrorMessage(
            title="No note found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N0549",
            detail="This note cannot be retrieved."
        ).to_response()


# Share a note via unique URL
# -----------------------------------------------
# Create a URL
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_note_share_link(request, note_id):
    try:
        note = Note.objects.select_related('user').get(id=note_id)
        note_owner = note.user
        # Check if the user requesting is the owner
        if get_request_user(request) == note_owner:
            rid = ''.join(random.choice(string.ascii_letters+"0123456789$")
                          for m in range(6))
            active = request.data['active'] if type(
                request.data['active']) is bool else True
            title = request.data['title']
            anon = request.data['anonymous'] if type(
                request.data['anonymous']) is bool else True
            created = datetime.now(pytz.utc)
            db_id = uuid.uuid4()
            is_password = 'password' in request.data and request.data['password'] is not None and len(
                request.data['password']) > 1
            row = ShareExternal(
                id=db_id,
                title=title,
                passkey=hash_this(rid),
                password=hash_this(request.data['password']) if is_password else "",
                note=note,
                active=active,
                user=note_owner,
                created=created,
                anonymous=anon
            )
            row.save()

            data = dict(
                title=title,
                urlkey=rid,
                active=active,
                anonymous=anon,
                isPasswordProtected=is_password,
                id=db_id,
                created=created
            )
            return Response(data=data, status=status.HTTP_201_CREATED)
    except Note.DoesNotExist:
        return ErrorMessage(
            title="Note not found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N1012",
            detail="This note cannot be retrieved."
        ).to_response()
    return ErrorMessage(
        title="Failed to create share link",
        status=status.HTTP_400_BAD_REQUEST,
        instance=request.build_absolute_uri(),
        code="N1001",
        detail="Failed to create share link."
    ).to_response()


# Read the note
@api_view(['POST'])
def read_note_via_share_link(request, perm_key):
    try:
        query = ShareExternal.objects.select_related('note', 'user').get(
            passkey=hash_this(perm_key), active=1)

        # Password is required
        if len(query.password) > 0 and ('password' not in request.data or len(request.data['password']) < 1):
            return ErrorMessage(
                title="Access Denied",
                status=status.HTTP_401_UNAUTHORIZED,
                instance=request.build_absolute_uri(),
                code="N1401",
                detail="Password is required."
            ).to_response()

        # Check password
        if len(query.password) > 0 and query.password != hash_this(request.data['password']):
            return ErrorMessage(
                title="Incorrect Password",
                status=status.HTTP_401_UNAUTHORIZED,
                instance=request.build_absolute_uri(),
                code="N1402",
                detail="Provided password is incorrect."
            ).to_response()

        # We keep person who externally shared the note anonymous
        response = dict(
            noteTitle=query.note.title,
            noteContent=decrypt_note(query.note.content),
            noteCreated=query.note.created,
            noteUpdated=query.note.updated,
            noteSharedOn=query.created,
        )
        # If person explicitly asked not to be anonymous
        if query.anonymous is False:
            response['noteSharedBy'] = query.user.first_name + " " + query.user.last_name
            response['noteSharedByUID'] = query.user.id

        return Response(data=response, status=status.HTTP_200_OK)
    except (ShareExternal.DoesNotExist, Note.DoesNotExist):
        return ErrorMessage(
            title="Failed reading note",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N1404",
            detail="This note cannot be retrieved."
        ).to_response()


# Read all share links for the note
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_note_share_links(request, note_id):
    links = ShareExternal.objects.filter(note=note_id, user=get_request_user(request)).values(
        'id', 'anonymous', 'created', 'title', 'active', 'password').order_by('-created')

    result = []

    for link in links:
        result.append({**ShareExternalSerializer(link).data,
                      'isPasswordProtected': True if len(link['password']) > 0 else False})

    return Response(data=result, status=status.HTTP_200_OK)


# Disable a share link
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def disable_note_share_link(request):
    try:
        query = ShareExternal.objects.get(
            id=request.data['id'], user=get_request_user(request))
        query.active = False
        query.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ShareExternal.DoesNotExist:
        return ErrorMessage(
            title="No Share Link found",
            status=status.HTTP_404_NOT_FOUND,
            instance=request.build_absolute_uri(),
            code="N1411",
            detail="The link could not be found."
        ).to_response()
