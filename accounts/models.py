from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('worker', 'Worker'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')

    def is_customer(self):
        return self.role == 'customer'

    def is_worker(self):
        return self.role == 'worker'
