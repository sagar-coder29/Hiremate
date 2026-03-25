from django.urls import path

from . import views

app_name = 'bookings'

urlpatterns = [
    path('', views.booking_list, name='booking_list'),
    path('create/<int:worker_pk>/', views.create_booking, name='create_booking'),
    path('<int:pk>/', views.booking_detail, name='booking_detail'),
    path('<int:pk>/status/<str:status>/', views.update_booking_status, name='update_status'),
]
