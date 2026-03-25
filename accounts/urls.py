from django.urls import path

from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('register/customer/', views.register_customer, name='register_customer'),
    path('register/worker/', views.register_worker, name='register_worker'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
