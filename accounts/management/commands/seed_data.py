import random

from django.core.management.base import BaseCommand

from accounts.models import User
from bookings.models import Booking
from profiles.models import (
    SERVICE_CHOICES,
    STATE_CHOICES,
    CustomerProfile,
    WorkerProfile,
)
from ratings.models import Rating

FIRST_NAMES = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh',
    'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Advik', 'Pranav',
    'Advaith', 'Aarush', 'Kabir', 'Ritvik', 'Anirudh', 'Dhruv',
    'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Isha', 'Anika',
    'Navya', 'Pari', 'Kiara', 'Riya', 'Priya', 'Neha', 'Sneha',
    'Pooja', 'Meera', 'Kavya', 'Tara', 'Zara', 'Nisha',
]

LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy',
    'Nair', 'Iyer', 'Joshi', 'Rao', 'Das', 'Mehta', 'Shah', 'Pillai',
    'Menon', 'Bhat', 'Desai', 'Patil', 'Chauhan', 'Mishra', 'Pandey',
    'Tiwari', 'Saxena', 'Agarwal',
]

CITIES = {
    'maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
    'delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh'],
    'karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
    'tamil_nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'],
    'uttar_pradesh': ['Lucknow', 'Noida', 'Agra', 'Varanasi', 'Kanpur'],
    'west_bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur', 'Ajmer', 'Kota'],
    'gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    'kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam'],
}

BIOS = [
    'Experienced professional with years of quality service. Customer satisfaction is my top priority.',
    'Reliable and punctual. I take pride in delivering excellent work every time.',
    'Skilled and certified. Available for both residential and commercial projects.',
    'Passionate about my craft. I ensure every job is done right the first time.',
    'Friendly and professional. Book with confidence — great reviews from happy customers.',
    'Dedicated to quality workmanship. No job is too big or too small.',
    'Trusted by hundreds of families. Licensed and insured for your peace of mind.',
    'Quick turnaround with attention to detail. Competitive pricing guaranteed.',
]


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create demo customer
        demo_customer, created = User.objects.get_or_create(
            username='demo_customer',
            defaults={
                'email': 'customer@demo.com',
                'first_name': 'Demo',
                'last_name': 'Customer',
                'role': 'customer',
            },
        )
        if created:
            demo_customer.set_password('demo1234')
            demo_customer.save()
            CustomerProfile.objects.create(
                user=demo_customer,
                phone='9876543210',
                city='Mumbai',
                state='maharashtra',
            )
            self.stdout.write(self.style.SUCCESS('Created demo_customer'))

        # Create demo worker
        demo_worker, created = User.objects.get_or_create(
            username='demo_worker',
            defaults={
                'email': 'worker@demo.com',
                'first_name': 'Demo',
                'last_name': 'Worker',
                'role': 'worker',
            },
        )
        if created:
            demo_worker.set_password('demo1234')
            demo_worker.save()
            WorkerProfile.objects.create(
                user=demo_worker,
                service_type='electrician',
                price_per_hour=350,
                city='Mumbai',
                state='maharashtra',
                experience_years=5,
                bio='Expert electrician with 5 years of experience. Specializing in residential wiring and repairs.',
                phone='9876543211',
                is_available=True,
            )
            self.stdout.write(self.style.SUCCESS('Created demo_worker'))

        # Create 50 random workers across states and services
        workers_created = 0
        worker_profiles = []
        for i in range(50):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            username = f'worker_{first.lower()}_{i}'
            state_key = random.choice([s[0] for s in STATE_CHOICES])
            city = random.choice(CITIES[state_key])
            service = random.choice([s[0] for s in SERVICE_CHOICES])

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@hiremate.demo',
                    'first_name': first,
                    'last_name': last,
                    'role': 'worker',
                },
            )
            if created:
                user.set_password('worker1234')
                user.save()
                profile = WorkerProfile.objects.create(
                    user=user,
                    service_type=service,
                    price_per_hour=random.randint(150, 800),
                    city=city,
                    state=state_key,
                    experience_years=random.randint(1, 15),
                    bio=random.choice(BIOS),
                    phone=f'98{random.randint(10000000, 99999999)}',
                    is_available=random.choice([True, True, True, False]),
                )
                worker_profiles.append(profile)
                workers_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {workers_created} worker profiles'))

        # Create 10 random customers
        customers_created = 0
        customer_users = [demo_customer]
        for i in range(10):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            username = f'customer_{first.lower()}_{i}'
            state_key = random.choice([s[0] for s in STATE_CHOICES])
            city = random.choice(CITIES[state_key])

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@hiremate.demo',
                    'first_name': first,
                    'last_name': last,
                    'role': 'customer',
                },
            )
            if created:
                user.set_password('customer1234')
                user.save()
                CustomerProfile.objects.create(
                    user=user,
                    phone=f'97{random.randint(10000000, 99999999)}',
                    city=city,
                    state=state_key,
                )
                customer_users.append(user)
                customers_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {customers_created} customer profiles'))

        # Create sample bookings and ratings
        all_workers = list(WorkerProfile.objects.all())
        bookings_created = 0
        ratings_created = 0

        if all_workers and customer_users:
            from datetime import date, time

            for _ in range(20):
                customer = random.choice(customer_users)
                worker = random.choice(all_workers)
                status = random.choice(['pending', 'accepted', 'completed', 'completed', 'completed'])

                booking, created = Booking.objects.get_or_create(
                    customer=customer,
                    worker=worker,
                    description=f'Need {worker.get_service_type_display().lower()} service at my place.',
                    defaults={
                        'status': status,
                        'preferred_date': date(2025, random.randint(1, 12), random.randint(1, 28)),
                        'preferred_time': time(random.randint(8, 18), 0),
                        'address': f'{random.randint(1, 500)}, Sector {random.randint(1, 50)}, {worker.city}',
                    },
                )
                if created:
                    bookings_created += 1

                    if status == 'completed' and not Rating.objects.filter(booking=booking).exists():
                        Rating.objects.create(
                            customer=customer,
                            worker=worker,
                            booking=booking,
                            score=random.choice([3, 4, 4, 5, 5, 5]),
                        )
                        ratings_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {bookings_created} bookings'))
        self.stdout.write(self.style.SUCCESS(f'Created {ratings_created} ratings'))
        self.stdout.write(self.style.SUCCESS('Database seeding complete!'))
