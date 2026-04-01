from django.conf import settings
from django.db import models

from profiles.models import WorkerProfile


class Booking(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings_as_customer",
    )
    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    description = models.TextField(help_text="Describe the work you need done")
    preferred_date = models.DateField()
    preferred_time = models.TimeField(blank=True, null=True)
    service_subtype = models.CharField(max_length=30, blank=True)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.pk} - {self.customer.get_full_name()} → {self.worker}"


class BookingTimeSlot(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="time_slots",
    )
    time = models.TimeField()

    class Meta:
        ordering = ["time"]

    def __str__(self):
        return f"{self.booking} - {self.time}"
