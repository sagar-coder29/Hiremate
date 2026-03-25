from django.contrib import admin

from .models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('customer', 'worker', 'score', 'booking', 'created_at')
    list_filter = ('score',)
