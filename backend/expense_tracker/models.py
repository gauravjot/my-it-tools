from django.db import models
from django.utils.timezone import now
from django_axor_auth.users.models import User

# Create your models here.

class Income(models.Model):
	amount = models.FloatField()
	date = models.DateField()
	added_at = models.DateTimeField(default=now)
	user = models.ForeignKey(User, on_delete=models.CASCADE)


class Expense(models.Model):
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
	name = models.CharField(max_length=255)
	expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
