from rest_framework import serializers
from .models import Run


class RunListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Run
        fields = ['id', 'user', 'title', 'added_on', 'distance', 'time_start', 'time_end', 'is_interval']


class RunSerializer(serializers.ModelSerializer):
    class Meta:
        model = Run
        fields = '__all__'
