from django.conf import settings
from django.db import models


SERVICE_CHOICES = (
    ("electrician", "Electrician"),
    ("plumber", "Plumber"),
    ("carpenter", "Carpenter"),
    ("painter", "Painter"),
    ("cleaner", "Cleaner"),
    ("mechanic", "Mechanic"),
    ("gardener", "Gardener"),
    ("mover", "Mover"),
    ("pest_control", "Pest Control"),
    ("ac_repair", "AC Repair"),
)

STATE_CHOICES = (
    ("maharashtra", "Maharashtra"),
    ("delhi", "Delhi"),
    ("karnataka", "Karnataka"),
    ("tamil_nadu", "Tamil Nadu"),
    ("uttar_pradesh", "Uttar Pradesh"),
    ("west_bengal", "West Bengal"),
    ("rajasthan", "Rajasthan"),
    ("gujarat", "Gujarat"),
    ("telangana", "Telangana"),
    ("kerala", "Kerala"),
)


class WorkerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="worker_profile",
    )
    service_type = models.CharField(
        max_length=20, choices=SERVICE_CHOICES, db_index=True
    )
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=30, choices=STATE_CHOICES, db_index=True)
    experience_years = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    is_available = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["service_type", "state", "is_available"]),
            models.Index(fields=["service_type", "price_per_hour"]),
            models.Index(fields=["is_available", "-created_at"]),
        ]

    @property
    def average_rating(self):
        from ratings.models import Rating

        ratings = Rating.objects.filter(worker=self)
        if ratings.exists():
            return round(ratings.aggregate(models.Avg("score"))["score__avg"], 1)
        return 0.0

    @property
    def total_ratings(self):
        from ratings.models import Rating

        return Rating.objects.filter(worker=self).count()

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_service_type_display()}"


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )
    phone = models.CharField(max_length=15, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=30, choices=STATE_CHOICES, blank=True)
    address_line = models.CharField(max_length=255, blank=True)
    locality = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - Customer"


class SavedAddress(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_addresses",
    )
    label = models.CharField(max_length=50)
    address_line = models.CharField(max_length=255)
    locality = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=30, choices=STATE_CHOICES)
    pincode = models.CharField(max_length=10, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.label} - {self.city}"


SERVICE_SUBTYPES = {
    "electrician": [
        ("wiring", "Wiring"),
        ("installation", "Installation"),
        ("repair", "Repair"),
        ("maintenance", "Maintenance"),
    ],
    "plumber": [
        ("leakage", "Leakage Fix"),
        ("installation", "Installation"),
        ("unblocking", "Unblocking"),
        ("maintenance", "Maintenance"),
    ],
    "carpenter": [
        ("furniture", "Furniture Making"),
        ("repair", "Repair"),
        ("assembly", "Assembly"),
        ("polishing", "Polishing"),
    ],
    "painter": [
        ("interior", "Interior"),
        ("exterior", "Exterior"),
        ("texture", "Texture"),
        ("waterproofing", "Waterproofing"),
    ],
    "cleaner": [
        ("home", "Home Cleaning"),
        ("office", "Office Cleaning"),
        ("deep", "Deep Cleaning"),
        ("post_construction", "Post-Construction"),
    ],
    "mechanic": [
        ("service", "Service"),
        ("repair", "Repair"),
        ("diagnosis", "Diagnosis"),
        ("tuning", "Tuning"),
    ],
    "gardener": [
        ("landscape", "Landscaping"),
        ("maintenance", "Maintenance"),
        ("pruning", "Pruning"),
        ("pest", "Pest Control"),
    ],
    "mover": [
        ("local", "Local Moving"),
        ("packing", "Packing"),
        ("loading", "Loading/Unloading"),
        ("storage", "Storage"),
    ],
    "pest_control": [
        ("spraying", "Spraying"),
        ("gel", "Gel Treatment"),
        ("rodent", "Rodent Control"),
        ("termite", "Termite Treatment"),
    ],
    "ac_repair": [
        ("installation", "Installation"),
        ("service", "Service"),
        ("gas_refill", "Gas Refill"),
        ("repair", "Repair"),
    ],
}
