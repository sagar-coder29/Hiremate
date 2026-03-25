from django.urls import path

from . import views

app_name = 'ratings'

urlpatterns = [
    path('rate/<int:booking_pk>/', views.rate_worker, name='rate_worker'),
]
