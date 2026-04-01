from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from profiles.models import WorkerProfile

from .forms import BookingForm
from .models import Booking


@login_required
def create_booking(request, worker_pk):
    if not request.user.is_customer():
        messages.error(request, "Only customers can create bookings.")
        return redirect("profiles:worker_list")

    worker = get_object_or_404(WorkerProfile, pk=worker_pk)

    if request.method == "POST":
        form = BookingForm(request.POST, service_type=worker.service_type)
        time_slots_data = request.POST.getlist("time_slots")

        if form.is_valid():
            booking = form.save(commit=False)
            booking.customer = request.user
            booking.worker = worker
            booking.service_subtype = form.cleaned_data.get("service_subtype", "")
            booking.save()

            for time_str in time_slots_data:
                if time_str:
                    from .models import BookingTimeSlot

                    BookingTimeSlot.objects.create(booking=booking, time=time_str)

            if form.cleaned_data.get("save_address") and form.cleaned_data.get(
                "address"
            ):
                from profiles.models import SavedAddress

                SavedAddress.objects.create(
                    customer=request.user,
                    label=form.cleaned_data.get("address_label", "My Address"),
                    address_line=form.cleaned_data.get("address", ""),
                    locality="",
                    city=worker.city,
                    state=worker.state,
                    pincode="",
                )

            messages.success(request, "Booking request sent successfully!")
            return redirect("bookings:booking_list")
    else:
        form = BookingForm(service_type=worker.service_type)

        customer_profile = getattr(request.user, "customer_profile", None)
        initial_address = ""
        if customer_profile and customer_profile.address_line:
            initial_address = customer_profile.address_line
            if customer_profile.locality:
                initial_address += f", {customer_profile.locality}"

        if initial_address:
            form.fields["address"].initial = initial_address

    from profiles.models import SavedAddress, SERVICE_CHOICES

    saved_addresses = SavedAddress.objects.filter(customer=request.user)

    return render(
        request,
        "bookings/create_booking.html",
        {
            "form": form,
            "worker": worker,
            "saved_addresses": saved_addresses,
            "service_choices": SERVICE_CHOICES,
        },
    )


@login_required
def booking_list(request):
    user = request.user
    if user.is_worker():
        profile = get_object_or_404(WorkerProfile, user=user)
        bookings = Booking.objects.filter(worker=profile)
    else:
        bookings = Booking.objects.filter(customer=user)

    status_filter = request.GET.get("status", "")
    if status_filter:
        bookings = bookings.filter(status=status_filter)

    return render(
        request,
        "bookings/booking_list.html",
        {
            "bookings": bookings,
            "current_status": status_filter,
        },
    )


@login_required
def booking_detail(request, pk):
    booking = get_object_or_404(Booking, pk=pk)

    if request.user != booking.customer and (
        not request.user.is_worker()
        or not hasattr(request.user, "worker_profile")
        or request.user.worker_profile != booking.worker
    ):
        messages.error(request, "You do not have permission to view this booking.")
        return redirect("bookings:booking_list")

    from ratings.models import Rating

    rating = Rating.objects.filter(booking=booking).first()

    customer_profile = getattr(booking.customer, "customer_profile", None)
    customer_phone = customer_profile.phone if customer_profile else None

    return render(
        request,
        "bookings/booking_detail.html",
        {
            "booking": booking,
            "rating": rating,
            "customer_phone": customer_phone,
        },
    )


@login_required
def update_booking_status(request, pk, status):
    if request.method != "POST":
        return redirect("bookings:booking_detail", pk=pk)

    booking = get_object_or_404(Booking, pk=pk)

    if status in ("accepted", "rejected"):
        if (
            not request.user.is_worker()
            or request.user.worker_profile != booking.worker
        ):
            messages.error(request, "Only the assigned worker can accept or reject.")
            return redirect("bookings:booking_list")

    if status == "completed":
        if request.user != booking.customer and (
            not request.user.is_worker()
            or request.user.worker_profile != booking.worker
        ):
            messages.error(request, "You cannot mark this booking as completed.")
            return redirect("bookings:booking_list")

    if status == "cancelled":
        if request.user != booking.customer:
            messages.error(request, "Only the customer can cancel a booking.")
            return redirect("bookings:booking_list")

    valid_transitions = {
        "pending": ["accepted", "rejected", "cancelled"],
        "accepted": ["completed", "cancelled"],
    }

    if status in valid_transitions.get(booking.status, []):
        booking.status = status
        booking.save()
        messages.success(request, f"Booking has been {status}.")
    else:
        messages.error(request, "Invalid status transition.")

    return redirect("bookings:booking_detail", pk=pk)
