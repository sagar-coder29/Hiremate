from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import redirect, render

from profiles.models import CustomerProfile, WorkerProfile

from .forms import CustomerRegistrationForm, LoginForm, WorkerRegistrationForm


def home(request):
    return render(request, 'home.html')


def register_customer(request):
    if request.method == 'POST':
        form = CustomerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            CustomerProfile.objects.create(user=user)
            login(request, user)
            return redirect('accounts:dashboard')
    else:
        form = CustomerRegistrationForm()
    return render(request, 'accounts/register.html', {'form': form, 'role': 'customer'})


def register_worker(request):
    if request.method == 'POST':
        form = WorkerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            WorkerProfile.objects.create(
                user=user,
                service_type='electrician',
                city='',
                state='maharashtra',
            )
            login(request, user)
            return redirect('profiles:edit_worker_profile')
    else:
        form = WorkerRegistrationForm()
    return render(request, 'accounts/register.html', {'form': form, 'role': 'worker'})


class UserLoginView(LoginView):
    form_class = LoginForm
    template_name = 'accounts/login.html'


class UserLogoutView(LogoutView):
    next_page = '/'


@login_required
def dashboard(request):
    user = request.user
    context = {'user': user}

    if user.is_worker():
        profile = WorkerProfile.objects.filter(user=user).first()
        context['profile'] = profile
        if profile:
            from bookings.models import Booking
            context['pending_bookings'] = Booking.objects.filter(
                worker=profile, status='pending'
            ).count()
            context['active_bookings'] = Booking.objects.filter(
                worker=profile, status='accepted'
            ).count()
            context['completed_bookings'] = Booking.objects.filter(
                worker=profile, status='completed'
            ).count()
    else:
        profile = CustomerProfile.objects.filter(user=user).first()
        context['profile'] = profile
        from bookings.models import Booking
        context['my_bookings'] = Booking.objects.filter(customer=user).count()
        context['pending_bookings'] = Booking.objects.filter(
            customer=user, status='pending'
        ).count()
        context['completed_bookings'] = Booking.objects.filter(
            customer=user, status='completed'
        ).count()

    return render(request, 'accounts/dashboard.html', context)
