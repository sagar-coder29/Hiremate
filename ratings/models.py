from django.conf import settings
from django.db import models

from profiles.models import WorkerProfile


class Rating(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given',
    )
    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name='ratings',
    )
    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='rating',
    )
    score = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'booking')
        ordering = ['-created_at']

    def __str__(self):
        return f"Rating {self.score}/5 for {self.worker} by {self.customer}"
