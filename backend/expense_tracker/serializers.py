from rest_framework import serializers
from .models import Income, Expense, ExpenseTags


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'


class ExpenseTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseTags
        fields = '__all__'


class ExpenseSerializer(serializers.ModelSerializer):
    tags = ExpenseTagsSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'name', 'amount', 'date', 'repeat', 'repeat_interval', 'added_at', 'tags', 'user']
