from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.get_runs),
    path('add/', views.add_run),
    path('<run_id>/', views.get_run),
    path('<run_id>/delete/', views.delete_run),
]
