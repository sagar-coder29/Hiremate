from django.urls import path

from . import views

app_name = 'profiles'

urlpatterns = [
    path('workers/', views.worker_list, name='worker_list'),
    path('workers/<int:pk>/', views.worker_detail, name='worker_detail'),
    path('edit/worker/', views.edit_worker_profile, name='edit_worker_profile'),
    path('edit/customer/', views.edit_customer_profile, name='edit_customer_profile'),
]
