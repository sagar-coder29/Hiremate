from django.test import TestCase

from django.contrib.auth import get_user_model
from .models import Booking, Payment, BookingTimeSlot
from profiles.models import WorkerProfile
from .forms import PaymentForm

User = get_user_model()


class PaymentModelTest(TestCase):
    def test_payment_model_str(self):
        """Test Payment model string representation"""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        worker = WorkerProfile.objects.create(
            user=user, service_type="cleaning", phone="1234567890"
        )
        booking = Booking.objects.create(
            customer=user,
            worker=worker,
            description="Test booking",
            preferred_date="2026-04-01",
            address="Test address",
        )
        payment = Payment.objects.create(
            booking=booking,
            razorpay_order_id="order_123",
            amount=100.00,
            status="pending",
        )
        self.assertEqual(str(payment), f"Payment #{payment.id} - {booking}")


class PaymentFormTest(TestCase):
    def test_payment_form_fields(self):
        """Test PaymentForm has required fields"""
        form = PaymentForm()
        expected_fields = [
            "amount",
            "razorpay_order_id",
            "razorpay_payment_id",
            "razorpay_signature",
        ]
        for field in expected_fields:
            self.assertIn(field, form.fields)


class BookingLocationFieldsTest(TestCase):
    def test_booking_location_fields(self):
        """Test Booking model has location fields"""
        self.assertTrue(hasattr(Booking, "_meta"))
        field_names = [f.name for f in Booking._meta.get_fields()]
        self.assertIn("latitude", field_names)
        self.assertIn("longitude", field_names)
        self.assertIn("map_address", field_names)


class BookingIsPaidTest(TestCase):
    def test_booking_is_paid_default_false(self):
        """Test Booking is_paid defaults to False"""
        user = User.objects.create_user(
            username="testuser2", email="test2@example.com", password="testpass123"
        )
        worker = WorkerProfile.objects.create(
            user=user, service_type="cleaning", phone="1234567890"
        )
        booking = Booking.objects.create(
            customer=user,
            worker=worker,
            description="Test booking",
            preferred_date="2026-04-01",
            address="Test address",
        )
        self.assertFalse(booking.is_paid)
