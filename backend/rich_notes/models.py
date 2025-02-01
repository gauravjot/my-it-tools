from django.db import models
from django_axor_auth.users.models import User


class Note(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, default="Untitled")
    created = models.DateTimeField()
    updated = models.DateTimeField()
    content = models.BinaryField()

    def __str__(self):
        return f"id:{self.id}, {self.user}, {self.title}, {self.created}"


class ShareExternal(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    passkey = models.CharField(max_length=72, unique=True)
    password = models.CharField(max_length=72, default="", blank=True)
    title = models.CharField(max_length=48, default="Note Share")
    anonymous = models.BooleanField(default=True)
    active = models.BooleanField(default=True)
    created = models.DateTimeField()

    def __str__(self):
        return f"id:{self.id}, {self.user}, {self.note}, {self.created}, {self.active}"