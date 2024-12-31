import uuid
from django.db import models
from django.utils.timezone import now
from django_axor_auth.users.models import User


class Income(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    amount = models.FloatField()
    date = models.DateField()
    added_at = models.DateTimeField(default=now)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repeat_choices = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    name = models.CharField(max_length=255)
    amount = models.FloatField()
    date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    added_at = models.DateTimeField(default=now)
    repeat = models.BooleanField(default=False)
    repeat_interval = models.CharField(max_length=255, choices=repeat_choices, default='monthly')


class ExpenseTags(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    expense_id = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='tags')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
