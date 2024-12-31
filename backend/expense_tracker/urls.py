from django.urls import path

from . import views

urlpatterns = [
	path('add_income/', views.add_income),
	path('get_incomes/<str:date_start>/<str:date_end>/', views.get_incomes),
	path('add_expense/', views.add_expense),
	path('get_expenses/<str:date_start>/<str:date_end>/', views.get_expenses),
	path('get_expense_tags/', views.get_expense_tags),
]