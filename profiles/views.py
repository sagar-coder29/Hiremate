from django.contrib.auth.decorators import login_required
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.db.models import Avg, Q
from django.shortcuts import get_object_or_404, redirect, render

from .forms import CustomerProfileForm, WorkerProfileForm
from .models import SERVICE_CHOICES, STATE_CHOICES, CustomerProfile, WorkerProfile

WORKERS_PER_PAGE = 12


def worker_list(request):
    workers = WorkerProfile.objects.filter(is_available=True).select_related("user")

    service = request.GET.get("service", "")
    if service:
        workers = workers.filter(service_type=service)

    state = request.GET.get("state", "")
    if state:
        workers = workers.filter(state=state)

    city = request.GET.get("city", "")
    if city:
        workers = workers.filter(city__icontains=city)

    min_price = request.GET.get("min_price", "")
    if min_price:
        workers = workers.filter(price_per_hour__gte=min_price)

    max_price = request.GET.get("max_price", "")
    if max_price:
        workers = workers.filter(price_per_hour__lte=max_price)

    min_rating = request.GET.get("min_rating", "")
    if min_rating:
        from ratings.models import Rating

        worker_ids = (
            Rating.objects.values("worker")
            .annotate(avg=Avg("score"))
            .filter(avg__gte=min_rating)
            .values_list("worker", flat=True)
        )
        workers = workers.filter(pk__in=worker_ids)

    sort = request.GET.get("sort", "")
    if sort == "price_low":
        workers = workers.order_by("price_per_hour")
    elif sort == "price_high":
        workers = workers.order_by("-price_per_hour")
    elif sort == "experience":
        workers = workers.order_by("-experience_years")

    search = request.GET.get("q", "")
    if search:
        workers = workers.filter(
            Q(user__first_name__icontains=search)
            | Q(user__last_name__icontains=search)
            | Q(city__icontains=search)
            | Q(bio__icontains=search)
        )

    paginator = Paginator(workers, WORKERS_PER_PAGE)
    page = request.GET.get("page", 1)
    try:
        workers_page = paginator.page(page)
    except PageNotAnInteger:
        workers_page = paginator.page(1)
    except EmptyPage:
        workers_page = paginator.page(paginator.num_pages)

    current_filters = {
        "service": service,
        "state": state,
        "city": city,
        "min_price": min_price,
        "max_price": max_price,
        "min_rating": min_rating,
        "sort": sort,
        "q": search,
    }

    context = {
        "workers": workers_page,
        "service_choices": SERVICE_CHOICES,
        "state_choices": STATE_CHOICES,
        "current_filters": current_filters,
        "paginator": paginator,
    }
    return render(request, "profiles/worker_list.html", context)


def worker_detail(request, pk):
    worker = get_object_or_404(WorkerProfile, pk=pk)
    from ratings.models import Rating

    ratings = Rating.objects.filter(worker=worker)
    context = {
        "worker": worker,
        "ratings": ratings,
    }
    return render(request, "profiles/worker_detail.html", context)


@login_required
def edit_worker_profile(request):
    if not request.user.is_worker():
        return redirect("accounts:dashboard")
    profile = get_object_or_404(WorkerProfile, user=request.user)
    if request.method == "POST":
        form = WorkerProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            return redirect("accounts:dashboard")
    else:
        form = WorkerProfileForm(instance=profile)

    completion = 0
    fields = [
        profile.service_type,
        profile.price_per_hour,
        profile.city,
        profile.state,
        profile.experience_years,
        profile.bio,
        profile.phone,
    ]
    filled = sum(1 for f in fields if f and str(f).strip())
    completion = int((filled / len(fields)) * 100)

    return render(
        request,
        "profiles/edit_profile.html",
        {
            "form": form,
            "role": "worker",
            "profile": profile,
            "profile_completion": completion,
        },
    )


@login_required
def edit_customer_profile(request):
    if not request.user.is_customer():
        return redirect("accounts:dashboard")
    profile, _ = CustomerProfile.objects.get_or_create(user=request.user)
    if request.method == "POST":
        form = CustomerProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            return redirect("accounts:dashboard")
    else:
        form = CustomerProfileForm(instance=profile)
    return render(
        request, "profiles/edit_profile.html", {"form": form, "role": "customer"}
    )
