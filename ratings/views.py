from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from bookings.models import Booking

from .forms import RatingForm
from .models import Rating


@login_required
def rate_worker(request, booking_pk):
    booking = get_object_or_404(Booking, pk=booking_pk)

    if request.user != booking.customer:
        messages.error(request, 'Only the customer can rate this booking.')
        return redirect('bookings:booking_list')

    if booking.status != 'completed':
        messages.error(request, 'You can only rate completed bookings.')
        return redirect('bookings:booking_detail', pk=booking_pk)

    if Rating.objects.filter(booking=booking).exists():
        messages.info(request, 'You have already rated this booking.')
        return redirect('bookings:booking_detail', pk=booking_pk)

    if request.method == 'POST':
        form = RatingForm(request.POST)
        if form.is_valid():
            rating = form.save(commit=False)
            rating.customer = request.user
            rating.worker = booking.worker
            rating.booking = booking
            rating.save()
            messages.success(request, 'Thank you for your rating!')
            return redirect('bookings:booking_detail', pk=booking_pk)
    else:
        form = RatingForm()

    return render(request, 'ratings/rate_worker.html', {
        'form': form,
        'booking': booking,
    })
