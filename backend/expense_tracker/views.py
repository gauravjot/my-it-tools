from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils.encoding import force_str
from django_axor_auth.users.permissions import IsAuthenticated
from django_axor_auth.users.api import get_request_user
from django_axor_auth.utils.error_handling.error_message import ErrorMessage

from .models import Income, Expense, ExpenseTags
from .serializers import IncomeSerializer, ExpenseSerializer, ExpenseTagsSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_income(request):
    user = get_request_user(request)
    name = force_str(request.data.get('name'))
    amount = request.data.get('amount')
    date = request.data.get('date')
    # Check if amount is valid
    try:
        amount = float(amount)
    except ValueError:
        return ErrorMessage(
            title='Invalid Amount',
            detail='Amount should be a number',
            status=400,
            code='invalid_amount',
            instance=request.build_absolute_uri()
        ).to_response()
    # Check if date is valid
    try:
        date_obj = datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return ErrorMessage(
            title='Invalid Date',
            detail='Date should be in the format YYYY-MM-DD',
            status=400,
            code='invalid_date',
            instance=request.build_absolute_uri()
        ).to_response()
    # Save to database
    income = Income.objects.create(name=name, amount=amount, date=date_obj.date(), user=user)
    # Serialize and return response
    serializer = IncomeSerializer(income)
    return Response(serializer.data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_incomes(request, date_start=None, date_end=None):
    user = get_request_user(request)
    # Check if date is valid
    try:
        date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
        date_end = datetime.strptime(date_end, '%Y-%m-%d').date()
    except ValueError:
        return ErrorMessage(
            title='Invalid Date',
            detail='Date should be in the format YYYY-MM-DD',
            status=400,
            code='invalid_date',
            instance=request.build_absolute_uri()
        ).to_response()
    income = Income.objects.filter(user=user, date__range=(date_start, date_end)).order_by('-date')
    serializer = IncomeSerializer(income, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_expense(request):
    user = get_request_user(request)
    amount = request.data.get('amount')
    date = request.data.get('date')
    name = force_str(request.data.get('name'))
    repeat = request.data.get('repeat')
    repeat_interval = force_str(request.data.get('repeat_interval'))
    tags = request.data.get('tags')
    # Check if amount is valid
    try:
        amount = float(amount)
        date_obj = datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return ErrorMessage(
            title='Invalid Amount or Date',
            detail='Amount should be a number and Date should be in the format YYYY-MM-DD',
            status=400,
            code='invalid_amount_date',
            instance=request.build_absolute_uri()
        ).to_response()
    # Check if repeat is valid
    if isinstance(repeat, bool) is False:
        repeat = False
    interval_choices = [x for x, y in Expense().repeat_choices]
    if repeat_interval not in interval_choices:
        return ErrorMessage(
            title='Invalid Repeat Interval',
            detail='Repeat interval should be daily, weekly, monthly or yearly',
            status=400,
            code='invalid_repeat_interval',
            instance=request.build_absolute_uri()
        ).to_response()
    # Save to database
    expense = Expense.objects.create(
        amount=amount,
        date=date_obj.date(),
        name=name,
        repeat=repeat,
        repeat_interval=repeat_interval,
        user=user
    )
    # Save tags
    added_tags = []
    if tags:
        for tag in tags:
            if isinstance(tag, str) and len(tag) > 0:
                tag_obj = ExpenseTags.objects.create(name=force_str(tag), user=user, expense_id=expense)
                added_tags.append(ExpenseTagsSerializer(tag_obj).data)
    # Serialize and return response
    serializer = ExpenseSerializer(expense)
    return Response({**serializer.data, 'tags': added_tags}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expenses(request, date_start=None, date_end=None):
    user = get_request_user(request)
    # Check if date is valid
    try:
        date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
        date_end = datetime.strptime(date_end, '%Y-%m-%d').date()
    except ValueError:
        return ErrorMessage(
            title='Invalid Date',
            detail='Date should be in the format YYYY-MM-DD',
            status=400,
            code='invalid_date',
            instance=request.build_absolute_uri()
        ).to_response()
    expense = Expense.objects.prefetch_related('tags').filter(
        user=user, date__range=(date_start, date_end)).order_by('-date')
    serializer = ExpenseSerializer(expense, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_expense_tag(request):
    user = get_request_user(request)
    name = force_str(request.data.get('name'))
    expense_id = request.data.get('expense_id')
    # Save to database
    tag = ExpenseTags.objects.create(name=name, user=user, expense_id=expense_id)
    # Serialize and return response
    serializer = ExpenseTagsSerializer(tag)
    return Response(serializer.data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expense_tags(request):
    user = get_request_user(request)
    tag = ExpenseTags.objects.filter(user=user)
    serializer = ExpenseTagsSerializer(tag, many=True)
    return Response(serializer.data)
