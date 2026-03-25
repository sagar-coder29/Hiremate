from django.contrib import admin

from .models import CustomerProfile, WorkerProfile


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'service_type', 'price_per_hour', 'city', 'state', 'is_available')
    list_filter = ('service_type', 'state', 'is_available')
    search_fields = ('user__first_name', 'user__last_name', 'city')


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'city', 'state')
    search_fields = ('user__first_name', 'user__last_name')
