from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'expenses', views.ExpenseItemViewSet, basename='expense')

urlpatterns = [
	path('add_income/', views.add_income),
	path('get_incomes/<str:date_start>/<str:date_end>/', views.get_incomes),
	path('add_expense/', views.add_expense),
	path('get_expenses/<str:date_start>/<str:date_end>/', views.get_expenses),
	path('get_expense_tags/', views.get_expense_tags),
	path('', include(router.urls)),
]