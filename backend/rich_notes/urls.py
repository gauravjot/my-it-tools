from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.get_notes),
    path('create/', views.create_note),
    path('<note_id>/', views.note_ops),
    path('share/<note_id>/', views.create_note_share_link),
    path('share/links/disable/', views.disable_note_share_link),
    path('share/links/<note_id>/', views.get_note_share_links),
    path('shared/<perm_key>/', views.read_note_via_share_link),
    path('<note_id>/edit/title/', views.update_note_title),
]
