from django.contrib import admin
from django.urls import include, path

from accounts.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('accounts/', include('accounts.urls')),
    path('profiles/', include('profiles.urls')),
    path('bookings/', include('bookings.urls')),
    path('ratings/', include('ratings.urls')),
]
