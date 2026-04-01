# Booking Service Enhancement Specification

**Date:** 2026-03-30  
**Status:** Approved for Implementation

---

## 1. Overview

This specification covers the booking service enhancements for HireMate:
- Address auto-fill with saved addresses system
- Multiple time slot selection
- Service sub-category selection
- Call person functionality
- Enhanced description field

---

## 2. Address Auto-Fill System

### 2.1 Customer Profile Updates

Add to `CustomerProfile` model:
```python
address_line = models.CharField(max_length=255, blank=True)
locality = models.CharField(max_length=100, blank=True)
pincode = models.CharField(max_length=10, blank=True)
```

### 2.2 SavedAddress Model

New model in `profiles/models.py`:
```python
class SavedAddress(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    label = models.CharField(max_length=50)  # e.g., "Home", "Office"
    address_line = models.CharField(max_length=255)
    locality = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=30, choices=STATE_CHOICES)
    pincode = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 2.3 Booking Form Behavior

On booking form load:
1. Check if customer has `CustomerProfile.city`/`state` - pre-fill if empty
2. Query `SavedAddress.objects.filter(customer=request.user)`
3. Display dropdown to select saved address OR "Add New Address"
4. Selecting a saved address auto-fills all address fields
5. "Save this address" checkbox to save new addresses for future use

---

## 3. Multiple Time Slot Selection

### 3.1 BookingTimeSlot Model

New model in `bookings/models.py`:
```python
class BookingTimeSlot(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='time_slots')
    time = models.TimeField()
    
    class Meta:
        ordering = ['time']
```

### 3.2 Form Implementation

- Show 1-3 time input fields dynamically (JavaScript)
- "Add Another Time Slot" button adds more fields (max 3)
- All selected times are stored as `BookingTimeSlot` instances
- Worker sees all preferred times in booking detail

---

## 4. Service Sub-Category

### 4.1 Service Sub-Types Dictionary

Add to `profiles/models.py`:
```python
SERVICE_SUBTYPES = {
    'electrician': [('wiring', 'Wiring'), ('installation', 'Installation'), ('repair', 'Repair'), ('maintenance', 'Maintenance')],
    'plumber': [('leakage', 'Leakage Fix'), ('installation', 'Installation'), ('unblocking', 'Unblocking'), ('maintenance', 'Maintenance')],
    'carpenter': [('furniture', 'Furniture Making'), ('repair', 'Repair'), ('assembly', 'Assembly'), ('polishing', 'Polishing')],
    'painter': [('interior', 'Interior'), ('exterior', 'Exterior'), ('texture', 'Texture'), ('waterproofing', 'Waterproofing')],
    'cleaner': [('home', 'Home Cleaning'), ('office', 'Office Cleaning'), ('deep', 'Deep Cleaning'), ('post_construction', 'Post-Construction')],
    'mechanic': [('service', 'Service'), ('repair', 'Repair'), ('diagnosis', 'Diagnosis'), ('tuning', 'Tuning')],
    'gardener': [('landscape', 'Landscaping'), ('maintenance', 'Maintenance'), ('pruning', 'Pruning'), ('pest', 'Pest Control')],
    'mover': [('local', 'Local Moving'), ('packing', 'Packing'), ('loading', 'Loading/Unloading'), ('storage', 'Storage')],
    'pest_control': [('spraying', 'Spraying'), ('gel', 'Gel Treatment'), ('rodent', 'Rodent Control'), ('termite', 'Termite Treatment')],
    'ac_repair': [('installation', 'Installation'), ('service', 'Service'), ('gas_refill', 'Gas Refill'), ('repair', 'Repair')],
}
```

### 4.2 Booking Model Update

Add to `Booking` model:
```python
service_subtype = models.CharField(max_length=30, blank=True)
```

### 4.3 Form Behavior

- When booking form loads, fetch worker's `service_type`
- Dynamically populate sub-type dropdown based on `SERVICE_SUBTYPES[service_type]`
- Sub-type is optional (can be blank)

---

## 5. Call Person Functionality

### 5.1 Display Requirements

On booking detail page:
- Show worker phone with click-to-call link (if available)
- Show customer phone with click-to-call link (if available)
- Format: `tel:+91{phonenumber}`

### 5.2 Template Changes

In `booking_detail.html`:
```html
{% if booking.worker.phone %}
<a href="tel:+91{{ booking.worker.phone }}" class="btn btn-call">
    <i class="fas fa-phone"></i> Call Worker
</a>
{% endif %}

{% if booking.customer.customerprofile.phone %}
<a href="tel:+91{{ booking.customer.customerprofile.phone }}" class="btn btn-call">
    <i class="fas fa-phone"></i> Call Customer
</a>
{% endif %}
```

---

## 6. Description Enhancement

### 6.1 Form Changes

- Keep existing `description` field
- Add character counter (max 500 characters)
- JavaScript to update counter on input

### 6.2 Template Changes

```html
<div class="form-group">
    <label for="id_description">Description</label>
    {{ form.description }}
    <small class="char-counter"><span id="desc-count">0</span>/500</small>
</div>
```

---

## 7. Implementation Files

| Component | File | Changes |
|-----------|------|---------|
| Model | `profiles/models.py` | Add `address_line`, `locality`, `pincode` to CustomerProfile; Add SavedAddress model; Add SERVICE_SUBTYPES dict |
| Model | `bookings/models.py` | Add `service_subtype` to Booking; Add BookingTimeSlot model |
| Form | `bookings/forms.py` | Update BookingForm; Add SavedAddressForm |
| View | `bookings/views.py` | Update create_booking; Add saved addresses context |
| View | `profiles/views.py` | Add SavedAddress CRUD |
| Template | `bookings/create_booking.html` | Add address dropdown, time slots, sub-type, char counter |
| Template | `bookings/booking_detail.html` | Add call buttons |
| URL | `profiles/urls.py` | Add SavedAddress routes |
| URL | `bookings/urls.py` | Update routes |
| Static | `static/css/style.css` | Add call button styles |
| Static | `static/js/main.js` | Add dynamic time slots, address selection, char counter |

---

## 8. Testing Checklist

- [ ] Address auto-fill from profile works
- [ ] Saved address dropdown shows all saved addresses
- [ ] Selecting saved address fills all fields
- [ ] "Add New Address" clears fields for new input
- [ ] Save address checkbox saves to database
- [ ] Time slot add/remove buttons work (1-3 slots)
- [ ] Sub-category dropdown shows correct options per worker
- [ ] Call worker button shows (if phone available)
- [ ] Call customer button shows (if phone available)
- [ ] Description character counter updates correctly
- [ ] Form submission saves all data correctly

---

## 9. Migration Commands

```bash
python manage.py makemigrations profiles
python manage.py makemigrations bookings
python manage.py migrate
```
