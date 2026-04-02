# HireMate Booking Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement multi-step booking wizard with service selection, Google Maps location picker, Razorpay payment integration, and extraordinary UI/UX animations

**Architecture:** Django backend with multi-step booking flow, Razorpay for payments, Google Maps JavaScript API for location, and enhanced glassmorphic UI with animations

**Tech Stack:** Django, JavaScript, Google Maps API, Razorpay SDK, Tailwind CSS, CSS Animations

---

## File Structure

| Category | Files |
|----------|-------|
| **New Models** | `bookings/models.py` (Payment, lat/lng fields) |
| **New Forms** | `bookings/forms.py` (PaymentForm, BookingForm updates) |
| **New Views** | `bookings/views.py` (payment views, order creation) |
| **URLs** | `bookings/urls.py` (payment endpoints) |
| **Templates** | `templates/bookings/create_booking.html`, `confirmation.html` |
| **Static JS** | `static/js/payment.js`, `static/js/booking-wizard.js`, `static/js/maps.js` |
| **Static CSS** | `static/css/style.css` (animations, wizard styles) |
| **Settings** | `hiremate/settings.py` (API keys) |

---

## Task 1: Database Models Update

**Files:**
- Modify: `bookings/models.py:1-54`
- Create: `bookings/migrations/0003_payment_and_location.py`

- [ ] **Step 1: Update Booking model with location fields**

Add to `Booking` model in `bookings/models.py`:

```python
latitude = models.FloatField(null=True, blank=True)
longitude = models.FloatField(null=True, blank=True)
map_address = models.TextField(blank=True)
estimated_hours = models.DecimalField(max_digits=4, decimal_places=1, default=1)
total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
is_paid = models.BooleanField(default=False)
```

- [ ] **Step 2: Add Payment model**

Add after `BookingTimeSlot` model in `bookings/models.py`:

```python
class Payment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    )
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=200, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Payment #{self.id} - {self.booking}"
```

- [ ] **Step 3: Create migration**

Run: `cd /Users/sagarkumarjha/Desktop/Hiremate && python manage.py makemigrations bookings`

Expected: Migration file created in `bookings/migrations/`

- [ ] **Step 4: Apply migration**

Run: `python manage.py migrate bookings`

Expected: Tables created successfully

---

## Task 2: Forms Update

**Files:**
- Modify: `bookings/forms.py`

- [ ] **Step 1: Read existing forms**

Run: `cat bookings/forms.py`

- [ ] **Step 2: Add PaymentForm**

Add at end of `bookings/forms.py`:

```python
class PaymentForm(forms.Form):
    amount = forms.DecimalField(widget=forms.HiddenInput())
    razorpay_order_id = forms.CharField(widget=forms.HiddenInput())
    razorpay_payment_id = forms.CharField(required=False, widget=forms.HiddenInput())
    razorpay_signature = forms.CharField(required=False, widget=forms.HiddenInput())
```

- [ ] **Step 3: Update BookingForm**

Add `latitude`, `longitude`, `map_address`, `estimated_hours` fields to BookingForm

---

## Task 3: Views - Payment Logic

**Files:**
- Modify: `bookings/views.py`

- [ ] **Step 1: Read existing views**

Run: `cat bookings/views.py`

- [ ] **Step 2: Add Razorpay imports**

Add at top of file:

```python
import razorpay
from django.conf import settings
from decimal import Decimal
```

- [ ] **Step 3: Add client initialization**

Add after imports:

```python
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)
```

- [ ] **Step 4: Add create_order view**

Add new view function:

```python
@login_required
def create_razorpay_order(request):
    if request.method == 'POST':
        booking_id = request.POST.get('booking_id')
        amount = request.POST.get('amount')
        
        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
        except Booking.DoesNotExist:
            return JsonResponse({'error': 'Booking not found'}, status=404)
        
        # Create Razorpay order
        order_data = {
            'amount': int(float(amount) * 100),  # Razorpay expects paise
            'currency': 'INR',
            'receipt': f'booking_{booking_id}',
            'notes': {
                'booking_id': str(booking_id),
                'customer': request.user.email
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        # Create payment record
        Payment.objects.create(
            booking=booking,
            razorpay_order_id=order['id'],
            amount=Decimal(amount),
            status='pending'
        )
        
        return JsonResponse({
            'order_id': order['id'],
            'amount': order_data['amount'],
            'currency': 'INR'
        })
    
    return JsonResponse({'error': 'Invalid request'}, status=400)
```

- [ ] **Step 5: Add verify_payment view**

Add new view function:

```python
@login_required
def verify_payment(request):
    if request.method == 'POST':
        razorpay_order_id = request.POST.get('razorpay_order_id')
        razorpay_payment_id = request.POST.get('razorpay_payment_id')
        razorpay_signature = request.POST.get('razorpay_signature')
        
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            
            # Verify signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            try:
                razorpay_client.utility.verify_payment_signature(params_dict)
                
                # Update payment and booking
                payment.razorpay_payment_id = razorpay_payment_id
                payment.razorpay_signature = razorpay_signature
                payment.status = 'completed'
                payment.save()
                
                payment.booking.is_paid = True
                payment.booking.save()
                
                return JsonResponse({'status': 'success', 'booking_id': payment.booking.id})
            
            except razorpay.errors.SignatureVerificationError:
                payment.status = 'failed'
                payment.save()
                return JsonResponse({'status': 'failed', 'error': 'Signature verification failed'}, status=400)
        
        except Payment.DoesNotExist:
            return JsonResponse({'error': 'Payment not found'}, status=404)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)
```

---

## Task 4: URLs Configuration

**Files:**
- Modify: `bookings/urls.py`

- [ ] **Step 1: Read existing urls**

Run: `cat bookings/urls.py`

- [ ] **Step 2: Add payment URLs**

Add to urlpatterns:

```python
path('payment/create-order/', views.create_razorpay_order, name='create_razorpay_order'),
path('payment/verify/', views.verify_payment, name='verify_payment'),
```

---

## Task 5: Settings - API Keys

**Files:**
- Modify: `hiremate/settings.py`

- [ ] **Step 1: Add Razorpay settings**

Add at end of settings.py:

```python
# Razorpay Configuration
RAZORPAY_KEY_ID = env('RAZORPAY_KEY_ID', default='rzp_test_xxxxxxxxxxxx')
RAZORPAY_KEY_SECRET = env('RAZORPAY_KEY_SECRET', default='xxxxxxxxxxxxxxxxxxxx')

# Google Maps API Key
GOOGLE_MAPS_API_KEY = env('GOOGLE_MAPS_API_KEY', default='YOUR_API_KEY_HERE')
```

- [ ] **Step 2: Add python-decimal**

Check if `decimal` is in requirements, add if missing:

Run: `grep -q "python-decimal" requirements.txt || echo "python-decimal" >> requirements.txt`

---

## Task 6: JavaScript - Booking Wizard

**Files:**
- Create: `static/js/booking-wizard.js`

- [ ] **Step 1: Create wizard JavaScript**

Create `static/js/booking-wizard.js` with:

```javascript
class BookingWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.formData = {};
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateProgress();
        this.initAnimations();
    }
    
    bindEvents() {
        // Next button
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        
        // Back button
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
        
        // Service selection
        document.querySelectorAll('.service-card-select').forEach(card => {
            card.addEventListener('click', () => this.selectService(card));
        });
        
        // Payment button
        document.getElementById('proceed-payment')?.addEventListener('click', () => this.initPayment());
    }
    
    nextStep() {
        if (this.validateStep(this.currentStep)) {
            const current = document.querySelector(`.step[data-step="${this.currentStep}"]`);
            const next = document.querySelector(`.step[data-step="${this.currentStep + 1}"]`);
            
            current.classList.add('step-exit');
            current.classList.remove('step-active');
            
            setTimeout(() => {
                current.style.display = 'none';
                next.style.display = 'block';
                next.classList.add('step-enter', 'step-active');
                
                this.currentStep++;
                this.updateProgress();
                this.animateStepElements();
            }, 300);
        }
    }
    
    prevStep() {
        const current = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        const prev = document.querySelector(`.step[data-step="${this.currentStep - 1}"]`);
        
        current.classList.add('step-exit-reverse');
        
        setTimeout(() => {
            current.style.display = 'none';
            prev.style.display = 'block';
            prev.classList.add('step-enter-reverse', 'step-active');
            
            this.currentStep--;
            this.updateProgress();
        }, 300);
    }
    
    selectService(card) {
        document.querySelectorAll('.service-card-select').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.service = card.dataset.service;
        this.animateSelection(card);
    }
    
    animateSelection(card) {
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.4)';
        
        setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '';
        }, 300);
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        
        document.querySelectorAll('.step-indicator').forEach((ind, i) => {
            ind.classList.toggle('active', i < this.currentStep);
            ind.classList.toggle('completed', i < this.currentStep - 1);
        });
    }
    
    validateStep(step) {
        // Add validation logic per step
        return true;
    }
    
    initAnimations() {
        // Service cards stagger animation
        const cards = document.querySelectorAll('.service-card-select');
        cards.forEach((card, i) => {
            card.style.animationDelay = `${i * 100}ms`;
            card.classList.add('fade-in-up');
        });
    }
    
    animateStepElements() {
        const elements = document.querySelectorAll(`.step[data-step="${this.currentStep}"] *`);
        elements.forEach((el, i) => {
            el.style.animationDelay = `${i * 50}ms`;
            el.classList.add('fade-in');
        });
    }
    
    async initPayment() {
        const btn = document.getElementById('proceed-payment');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            const response = await fetch('/bookings/payment/create-order/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: `booking_id=${this.formData.bookingId}&amount=${this.formData.amount}`
            });
            
            const data = await response.json();
            
            if (data.order_id) {
                this.openRazorpay(data);
            }
        } catch (error) {
            btn.disabled = false;
            btn.innerHTML = 'Proceed to Payment';
            this.showError('Payment initialization failed');
        }
    }
    
    openRazorpay(orderData) {
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'HireMate',
            description: 'Service Booking',
            order_id: orderData.order_id,
            handler: (response) => this.verifyPayment(response),
            theme: { color: '#7C3AED' }
        };
        
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response) => {
            this.showError('Payment failed: ' + response.error.description);
        });
        rzp.open();
    }
    
    async verifyPayment(response) {
        try {
            const result = await fetch('/bookings/payment/verify/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: `razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}`
            });
            
            const data = await result.json();
            
            if (data.status === 'success') {
                this.showSuccess(data.booking_id);
            } else {
                this.showError('Payment verification failed');
            }
        } catch (error) {
            this.showError('Verification failed');
        }
    }
    
    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
    
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    showSuccess(bookingId) {
        document.getElementById('booking-id').value = bookingId;
        this.nextStep();
        this.playConfetti();
    }
    
    playConfetti() {
        // Confetti animation implementation
        const colors = ['#7C3AED', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.booking-wizard')) {
        window.bookingWizard = new BookingWizard();
    }
});
```

---

## Task 7: JavaScript - Google Maps Integration

**Files:**
- Create: `static/js/maps.js`

- [ ] **Step 1: Create maps JavaScript**

Create `static/js/maps.js` with:

```javascript
class HireMateMap {
    constructor(mapContainerId, options = {}) {
        this.containerId = mapContainerId;
        this.options = {
            center: options.center || { lat: 20.5937, lng: 78.9629 },
            zoom: options.zoom || 5,
            styles: this.getCustomStyles()
        };
        this.map = null;
        this.marker = null;
        this.autocomplete = null;
        this.geocoder = null;
        this.onAddressSelect = options.onAddressSelect || (() => {});
    }
    
    init() {
        if (typeof google === 'undefined') {
            console.error('Google Maps API not loaded');
            return;
        }
        
        this.geocoder = new google.maps.Geocoder();
        this.map = new google.maps.Map(
            document.getElementById(this.containerId),
            {
                ...this.options,
                mapTypeControl: false,
                streetViewControl: false
            }
        );
        
        this.initAutocomplete();
        this.initLocationButton();
    }
    
    initAutocomplete() {
        const input = document.getElementById('address-search');
        if (!input) return;
        
        this.autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['address'],
            componentRestrictions: { country: 'in' }
        });
        
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace();
            if (place.geometry) {
                this.map.setCenter(place.geometry.location);
                this.map.setZoom(15);
                this.setMarker(place.geometry.location);
                this.geocodePosition(place.geometry.location);
            }
        });
    }
    
    initLocationButton() {
        const btn = document.getElementById('detect-location');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            if (navigator.geolocation) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        this.map.setCenter(pos);
                        this.map.setZoom(15);
                        this.setMarker(pos);
                        this.geocodePosition(pos);
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use My Location';
                    },
                    () => {
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use My Location';
                        this.showError('Location access denied');
                    }
                );
            }
        });
    }
    
    setMarker(position) {
        if (this.marker) {
            this.marker.setMap(null);
        }
        
        this.marker = new google.maps.Marker({
            position: position,
            map: this.map,
            draggable: true,
            animation: google.maps.Animation.BOUNCE
        });
        
        setTimeout(() => {
            this.marker.setAnimation(null);
        }, 2000);
        
        this.marker.addListener('dragend', () => {
            this.geocodePosition(this.marker.getPosition());
        });
        
        document.getElementById('map-lat').value = position.lat;
        document.getElementById('map-lng').value = position.lng;
    }
    
    geocodePosition(pos) {
        this.geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                document.getElementById('id_address').value = address;
                document.getElementById('address-search').value = address;
                this.onAddressSelect({
                    lat: pos.lat(),
                    lng: pos.lng(),
                    address: address
                });
            }
        });
    }
    
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    getCustomStyles() {
        return [
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#7C3AED' }, { lightness: 40 }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 16 }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#22C55E' }, { weight: 0.5 }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ];
    }
}

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('address-map')) {
        window.hireMateMap = new HireMateMap('address-map', {
            onAddressSelect: (data) => {
                console.log('Address selected:', data);
            }
        });
        
        // Load Google Maps callback
        window.initMap = () => window.hireMateMap.init();
    }
});
```

---

## Task 8: HTML - Multi-Step Booking Form

**Files:**
- Modify: `templates/bookings/create_booking.html`

- [ ] **Step 1: Complete rewrite of create_booking.html**

Create complete multi-step wizard form with:

1. **Progress Bar** - Glassmorphic with animated fill
2. **Step 1: Service Selection** - 8 service cards with icons
3. **Step 2: Service Details** - Subtype, description, duration
4. **Step 3: Date & Time** - Calendar picker, time slots
5. **Step 4: Location** - Map + autocomplete
6. **Step 5: Summary & Payment** - Order summary, Razorpay button
7. **Step 6: Confirmation** - Success animation, booking details

Key UI elements:
- Glassmorphic step cards
- Animated service selection cards
- Custom styled date picker
- Map container with custom controls
- Payment summary sidebar
- Confetti animation on success

- [ ] **Step 2: Add Razorpay SDK**

Add to extra_head block:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

- [ ] **Step 3: Add Google Maps script**

Add to extra_head block:
```html
<script src="https://maps.googleapis.com/maps/api/js?key={{ GOOGLE_MAPS_API_KEY }}&libraries=places&callback=initMap" async defer></script>
```

---

## Task 9: CSS - Animations & Styles

**Files:**
- Modify: `static/css/style.css`

- [ ] **Step 1: Add wizard progress styles**

```css
.wizard-progress {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 9999px;
    padding: 8px;
    margin-bottom: 32px;
}

.progress-bar {
    height: 8px;
    background: var(--primary);
    border-radius: 9999px;
    transition: width 0.5s ease;
}

.step-indicator {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    border: 3px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: all 0.3s ease;
}

.step-indicator.active {
    border-color: var(--primary);
    color: var(--primary);
}

.step-indicator.completed {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}
```

- [ ] **Step 2: Add step animation styles**

```css
.step {
    display: none;
}

.step-active {
    display: block;
}

.step-enter {
    animation: slideInLeft 0.4s ease-out;
}

.step-exit {
    animation: slideOutRight 0.3s ease-in;
}

.step-exit-reverse {
    animation: slideOutLeft 0.3s ease-in;
}

.step-enter-reverse {
    animation: slideInRight 0.4s ease-out;
}

@keyframes slideInLeft {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-50px); }
}

@keyframes slideInRight {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOutLeft {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(50px); }
}
```

- [ ] **Step 3: Add service card selection styles**

```css
.service-card-select {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 3px solid transparent;
}

.service-card-select:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(124, 58, 237, 0.2);
}

.service-card-select.selected {
    border-color: var(--primary);
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(34, 197, 94, 0.1));
    animation: selectPulse 0.5s ease;
}

@keyframes selectPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 4: Add confetti animation**

```css
.confetti {
    position: fixed;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: confettiFall 3s ease-out forwards;
    pointer-events: none;
    z-index: 9999;
}

@keyframes confettiFall {
    0% {
        transform: translateY(-100px) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}
```

- [ ] **Step 5: Add glassmorphic form styles**

```css
.glass-form {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
}

.floating-label-group {
    position: relative;
    margin-bottom: 24px;
}

.floating-label {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    transition: all 0.3s ease;
    pointer-events: none;
}

.floating-input:focus + .floating-label,
.floating-input:not(:placeholder-shown) + .floating-label {
    top: 0;
    font-size: 12px;
    background: white;
    padding: 0 8px;
    color: var(--primary);
}
```

---

## Task 10: Views - Update Create Booking

**Files:**
- Modify: `bookings/views.py`

- [ ] **Step 1: Update create_booking view to pass Google Maps API key**

Modify the create_booking view to include:
```python
from django.conf import settings

def create_booking(request, worker_id):
    worker = get_object_or_404(WorkerProfile, id=worker_id)
    # ... existing code ...
    
    context = {
        'worker': worker,
        'form': form,
        'saved_addresses': saved_addresses,
        'service_choices': json.dumps(SERVICE_SUBTYPES.get(worker.service_type, [])),
        'GOOGLE_MAPS_API_KEY': settings.GOOGLE_MAPS_API_KEY,
        'RAZORPAY_KEY_ID': settings.RAZORPAY_KEY_ID,
    }
    return render(request, 'bookings/create_booking.html', context)
```

---

## Task 11: Confirmation Template

**Files:**
- Create: `templates/bookings/confirmation.html`

- [ ] **Step 1: Create success/confirmation page**

Create with:
- Animated checkmark
- Booking details card
- Share buttons (WhatsApp, Email)
- Track booking button
- Browse more services CTA

---

## Task 12: Testing

**Files:**
- Create: `bookings/tests.py` updates

- [ ] **Step 1: Add payment tests**

Add test methods:
```python
def test_create_razorpay_order(self):
    # Test order creation
    
def test_verify_payment_success(self):
    # Test successful payment verification
    
def test_verify_payment_failure(self):
    # Test failed payment signature
```

- [ ] **Step 2: Run tests**

Run: `python manage.py test bookings`

---

## Summary Checklist

- [ ] Task 1: Database models updated
- [ ] Task 2: Forms updated
- [ ] Task 3: Payment views created
- [ ] Task 4: URLs configured
- [ ] Task 5: Settings updated with API keys
- [ ] Task 6: Booking wizard JS created
- [ ] Task 7: Google Maps JS created
- [ ] Task 8: HTML template updated
- [ ] Task 9: CSS animations added
- [ ] Task 10: Views updated
- [ ] Task 11: Confirmation template created
- [ ] Task 12: Tests written

---

## Environment Variables Required

Create `.env` file with:
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Next Steps

After implementation:
1. Get Razorpay test credentials from dashboard.razorpay.com
2. Get Google Maps API key from console.cloud.google.com
3. Test payment flow in sandbox mode
4. Enable payment methods in Razorpay dashboard
5. Configure webhook for production
