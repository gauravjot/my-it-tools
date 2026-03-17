from django.db import models
from django_axor_auth.users.models import User


class Run(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, default="Untitled")
    added_on = models.DateTimeField(auto_now_add=True)
    tcx = models.JSONField()
    distance = models.FloatField()
    time_start = models.DateTimeField()
    time_end = models.DateTimeField()
    is_interval = models.BooleanField(default=False)
    intervals = models.JSONField(null=True, blank=True)
    laps = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"id:{self.id}, {self.user}, {self.title}, {self.added_on}"
