# HireMate Booking Enhancement Specification

**Date:** 2026-04-02  
**Status:** Approved for Implementation

---

## 1. Overview

This specification covers the comprehensive booking enhancement for HireMate:

- **Multi-step wizard booking flow** with service selection as first step
- **Enhanced Google Maps integration** with custom styling, autocomplete, and precise location picking
- **Razorpay payment integration** for online payment processing
- **Extraordinary UI/UX** with glassmorphism, animations, and micro-interactions

---

## 2. Booking Flow Architecture

### 2.1 Multi-Step Wizard

```
Step 1: Select Service → Step 2: Worker Selection → Step 3: Service Details → 
Step 4: Date/Time → Step 5: Location (Map) → Step 6: Payment → Step 7: Confirmation
```

### 2.2 Step Breakdown

**Step 1 - Service Selection:**
- Pre-select service from worker's specialty (if coming from worker card)
- Allow change if user wants different service
- Show all 8 services with icons matching home page
- Animated card selection with bounce effect and border glow

**Step 2 - Worker Selection:**
- List workers matching selected service
- Filter by location, rating, price
- Worker cards with quick booking button

**Step 3 - Service Details:**
- Select service subtype (Installation, Repair, Maintenance, etc.)
- Description text area with character counter
- Estimated duration input

**Step 4 - Date/Time:**
- Date picker (calendar widget)
- Multiple time slot selection (up to 3)
- Preferred time dropdowns

**Step 5 - Location (Enhanced Maps):**
- Google Maps integration with custom purple/green styling
- Autocomplete search with location predictions
- "Use My Location" with GPS
- Draggable marker for precise location
- Address auto-fill from marker position
- Map preview with selected area highlight

**Step 6 - Payment:**
- Razorpay integration
- Booking summary with price calculation
- Payment options: Card, UPI, Net Banking, Wallet
- Processing state with loading animation

**Step 7 - Confirmation:**
- Success animation (confetti burst)
- Booking details summary
- WhatsApp/Email confirmation option
- Track booking button

---

## 3. Services List

### 3.1 Available Services (from Home Page)

| Service | Icon | Subtypes |
|---------|------|----------|
| Electrician | `fa-bolt` | Wiring, Installation, Repair, Maintenance |
| Plumber | `fa-wrench` | Leakage Fix, Installation, Unblocking, Maintenance |
| Carpenter | `fa-hammer` | Furniture Making, Repair, Assembly, Polishing |
| Painter | `fa-paint-roller` | Interior, Exterior, Texture, Waterproofing |
| Cleaner | `fa-broom` | Home Cleaning, Office Cleaning, Deep Cleaning, Post-Construction |
| Mechanic | `fa-car` | Service, Repair, Diagnosis, Tuning |
| Gardener | `fa-leaf` | Landscaping, Maintenance, Pruning, Pest Control |
| AC Repair | `fa-snowflake` | Installation, Service, Gas Refill, Repair |

---

## 4. Google Maps Integration

### 4.1 Configuration

```html
<!-- Google Maps JavaScript API -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap" async defer></script>
```

### 4.2 Map Features

**Custom Map Styling:**
- Purple primary (#7C3AED) water/features
- Green (#22C55E) parks/nature
- Grayscale roads/buildings
- Custom marker icon matching brand

**Autocomplete Search:**
- Input field with magnifying glass icon
- Dropdown with location predictions
- Click to select and pan map
- Debounced search (300ms)

**Geolocation:**
- "Use My Location" button
- Loading state during detection
- Error handling for denied permission
- Auto-pan to user location

**Marker Interaction:**
- Draggable marker
- Bounce animation on placement
- Reverse geocoding on drag
- Address update in real-time

### 4.3 Data Storage

Store in booking:
```python
latitude = models.FloatField(null=True, blank=True)
longitude = models.FloatField(null=True, blank=True)
map_address = models.TextField(blank=True)  # Full address from Google
```

---

## 5. Razorpay Payment Integration

### 5.1 Backend (Django)

**Models:**
```python
class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=200, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Views:**
- `create_order` - Create Razorpay order, return order_id
- `verify_payment` - Verify signature, update booking status
- `payment_callback` - Handle success/failure redirects

**API Endpoints:**
```
POST /api/payment/create-order/
POST /api/payment/verify-payment/
POST /api/payment/webhook/
```

### 5.2 Frontend

**Payment Flow:**
1. User clicks "Proceed to Payment"
2. Fetch order_id from backend
3. Open Razorpay modal with options
4. On success → Verify with backend → Show success
5. On failure → Show error, allow retry

**Razorpay Options:**
```javascript
{
    key: "YOUR_RAZORPAY_KEY",
    amount: calculatedAmount,
    currency: "INR",
    name: "HireMate",
    description: "Service Booking",
    image: "/static/images/logo.png",
    prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone
    },
    theme: {
        color: "#7C3AED"
    },
    handler: function(response) {
        verifyPayment(response.razorpay_payment_id);
    }
}
```

### 5.3 Payment Options Supported

- Credit Card
- Debit Card
- Net Banking
- UPI (Google Pay, PhonePe, Paytm, BHIM)
- Wallets (Amazon Pay, Mobikwik, etc.)

---

## 6. UI/UX Design System

### 6.1 Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Purple | `#7C3AED` |
| Primary Dark | Deep Purple | `#6D28D9` |
| Primary Light | Light Purple | `#A78BFA` |
| CTA | Green | `#22C55E` |
| CTA Dark | Deep Green | `#16A34A` |
| Background | Off White | `#F8FAFC` |
| Text | Dark Slate | `#1E293B` |
| Muted | Slate | `#64748B` |
| Error | Red | `#EF4444` |
| Success | Emerald | `#10B981` |

### 6.2 Typography

- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700
- **Headings:** 600-700 weight
- **Body:** 400-500 weight

### 6.3 Component Styles

**Glassmorphism:**
```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
```

**Buttons:**
- Primary: Purple gradient with shadow
- CTA: Green gradient for payment
- Hover: Scale 1.02, increased shadow
- Active: Scale 0.98
- Disabled: Reduced opacity

**Cards:**
- Service cards: Hover lift effect with glow
- Worker cards: Glassmorphic with avatar
- Booking summary: Glass card with border

### 6.4 Animation Specifications

**Page Load:**
```css
.hero-content: fade-in 600ms ease-out
.service-cards: staggered fade-in, 100ms delay between items
```

**Step Transitions:**
```css
.step-enter: slideInLeft 400ms ease-out
.step-exit: slideOutRight 300ms ease-in
```

**Service Selection:**
```css
.service-card.selected: 
    scale(1.05)
    border-color: var(--primary)
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.3)
    animation: selectBounce 300ms ease-out
```

**Map Marker:**
```css
.marker-placed:
    animation: markerBounce 500ms ease-out
```

**Payment Button:**
```css
.pulse: animation: pulse 2s infinite
.loading-dots: animation: dotPulse 1.4s infinite
```

**Success Animation:**
```css
.confetti: 50 particles, random colors, 3s duration
.checkmark: draw animation 600ms
```

**Micro-interactions:**
- Form field focus: Floating label animation
- Checkbox: Smooth check mark draw
- Slider: Thumb bounce on change
- Button: Ripple effect on click

---

## 7. Implementation Files

### 7.1 New Files

| File | Purpose |
|------|---------|
| `bookings/migrations/0003_payment.py` | Payment model migration |
| `bookings/migrations/0004_booking_location.py` | Location fields migration |
| `static/js/payment.js` | Razorpay integration |
| `static/js/booking-wizard.js` | Multi-step wizard logic |
| `static/js/maps.js` | Google Maps integration |
| `static/css/animations.css` | All animation styles |

### 7.2 Modified Files

| File | Changes |
|------|---------|
| `bookings/models.py` | Add Payment model, lat/lng fields |
| `bookings/forms.py` | Add payment form, update booking form |
| `bookings/views.py` | Add payment views, order creation |
| `bookings/urls.py` | Add payment URLs |
| `templates/bookings/create_booking.html` | Complete rewrite with wizard |
| `templates/bookings/payment.html` | Payment page |
| `templates/bookings/confirmation.html` | Success page |
| `static/css/style.css` | Add wizard, map, payment styles |
| `hiremate/settings.py` | Add Razorpay credentials |

---

## 8. Testing Checklist

### 8.1 Booking Flow
- [ ] Service selection shows all 8 services with icons
- [ ] Service card selection triggers animation
- [ ] Step navigation works (back/next)
- [ ] Progress bar updates correctly
- [ ] Form validation on each step
- [ ] Back button preserves data

### 8.2 Map Integration
- [ ] Google Maps loads with custom styling
- [ ] Autocomplete search works
- [ ] Location detection works
- [ ] Marker drag updates address
- [ ] Address auto-fills correctly
- [ ] Map renders on mobile

### 8.3 Payment Integration
- [ ] Order creation API works
- [ ] Razorpay modal opens
- [ ] All payment methods available
- [ ] Payment success updates booking
- [ ] Payment failure shows error
- [ ] Signature verification works

### 8.4 UI/UX
- [ ] All animations smooth (60fps)
- [ ] Mobile responsive
- [ ] Accessibility: keyboard nav
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Success animation plays

---

## 9. Razorpay Setup

### 9.1 Get Credentials

1. Sign up at https://dashboard.razorpay.com
2. Get API Key ID and Secret
3. Add to environment variables

### 9.2 Environment Variables

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### 9.3 Webhook Configuration (Production)

Set webhook URL: `https://yourdomain.com/api/payment/webhook/`

---

## 10. Google Maps Setup

### 10.1 Get API Key

1. Go to https://console.cloud.google.com
2. Create project or select existing
3. Enable Maps JavaScript API
4. Enable Places API
5. Create API Key

### 10.2 Restrictions

- Restrict key to your domain
- Enable billing (required for Maps)
- Set daily quota

---

## 11. Success Metrics

- Booking completion rate > 60%
- Payment success rate > 95%
- Average booking time < 3 minutes
- Mobile booking rate > 50%
- User satisfaction > 4.5/5
