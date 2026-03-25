from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('pk', 'customer', 'worker', 'status', 'preferred_date', 'created_at')
    list_filter = ('status', 'preferred_date')
    search_fields = ('customer__first_name', 'customer__last_name')
