class BookingWizard {
    constructor(options = {}) {
        this.containerId = options.containerId || 'booking-wizard';
        this.workerId = options.workerId || null;
        this.workerData = options.workerData || {};
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || console.error;

        this.currentStep = 1;
        this.totalSteps = 6;
        this.formData = {
            serviceType: '',
            description: '',
            preferredDate: '',
            timeSlots: [],
            address: '',
            addressLine: '',
            locality: '',
            city: '',
            state: '',
            pincode: '',
            mapLat: '',
            mapLng: '',
            paymentMethod: 'razorpay',
            paymentAmount: 0
        };

        this.validationRules = {
            1: () => this.validateStep1(),
            2: () => this.validateStep2(),
            3: () => this.validateStep3(),
            4: () => this.validateStep4(),
            5: () => this.validateStep5(),
            6: () => this.validateStep6()
        };

        this.steps = ['Service', 'Details', 'Date/Time', 'Location', 'Payment', 'Confirmation'];
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateProgress();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="booking-wizard-container">
                <div class="wizard-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getProgressPercentage()}%"></div>
                    </div>
                    <div class="progress-steps">
                        ${this.steps.map((step, i) => `
                            <div class="progress-step ${i + 1 <= this.currentStep ? 'active' : ''}" data-step="${i + 1}">
                                <div class="step-number">${i + 1}</div>
                                <div class="step-label">${step}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="wizard-steps-container">
                    ${this.renderStepContent()}
                </div>

                <div class="wizard-navigation">
                    <button type="button" class="btn btn-secondary" id="wizard-prev" ${this.currentStep === 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button type="button" class="btn btn-primary" id="wizard-next">
                        ${this.currentStep === this.totalSteps ? 'Complete Booking' : 'Next'} <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        this.bindStepEvents();
    }

    renderStepContent() {
        switch (this.currentStep) {
            case 1:
                return this.renderServiceStep();
            case 2:
                return this.renderDetailsStep();
            case 3:
                return this.renderDateTimeStep();
            case 4:
                return this.renderLocationStep();
            case 5:
                return this.renderPaymentStep();
            case 6:
                return this.renderConfirmationStep();
            default:
                return '';
        }
    }

    renderServiceStep() {
        const services = [
            { id: 'electrical', name: 'Electrical', icon: 'fa-bolt', price: 500 },
            { id: 'plumbing', name: 'Plumbing', icon: 'fa-faucet-drip', price: 400 },
            { id: 'carpentry', name: 'Carpentry', icon: 'fa-hammer', price: 600 },
            { id: 'painting', name: 'Painting', icon: 'fa-paint-roller', price: 450 },
            { id: 'cleaning', name: 'Cleaning', icon: 'fa-broom', price: 350 },
            { id: 'ac_repair', name: 'AC Repair', icon: 'fa-snowflake', price: 700 }
        ];

        return `
            <div class="wizard-step step-active" data-step="1">
                <h3 class="step-title"><i class="fas fa-list-check"></i> Select Service</h3>
                <p class="step-description">Choose the type of service you need</p>
                
                <div class="service-cards-grid">
                    ${services.map(service => `
                        <div class="service-card ${this.formData.serviceType === service.id ? 'service-card-select' : ''}" 
                             data-service="${service.id}" data-price="${service.price}">
                            <div class="service-card-icon">
                                <i class="fas ${service.icon}"></i>
                            </div>
                            <div class="service-card-content">
                                <h4>${service.name}</h4>
                                <p class="service-price">₹${service.price}/hr</p>
                            </div>
                            <div class="service-card-check">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.formData.serviceType ? `
                    <div class="selected-service-summary">
                        <div class="summary-row">
                            <span>Selected Service:</span>
                            <strong id="selected-service-name">${services.find(s => s.id === this.formData.serviceType)?.name}</strong>
                        </div>
                        <div class="summary-row">
                            <span>Base Rate:</span>
                            <strong>₹${services.find(s => s.id === this.formData.serviceType)?.price}/hr</strong>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderDetailsStep() {
        return `
            <div class="wizard-step step-active" data-step="2">
                <h3 class="step-title"><i class="fas fa-clipboard-list"></i> Service Details</h3>
                <p class="step-description">Describe what you need help with</p>
                
                <div class="form-group">
                    <label for="service-description">
                        <i class="fas fa-edit"></i> Description
                        <span class="char-counter"><span id="desc-count">${this.formData.description.length}</span>/500</span>
                    </label>
                    <textarea id="service-description" class="form-control" rows="5" 
                              placeholder="Describe your requirements in detail..." maxlength="500">${this.formData.description}</textarea>
                    <small class="field-help">Be specific about what you need done</small>
                </div>
                
                ${this.workerData && this.workerData.certifications ? `
                    <div class="worker-certifications">
                        <h4><i class="fas fa-certificate"></i> Worker Certifications</h4>
                        <div class="certification-tags">
                            ${this.workerData.certifications.map(cert => `
                                <span class="certification-tag"><i class="fas fa-check-circle"></i> ${cert}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderDateTimeStep() {
        const today = new Date().toISOString().split('T')[0];
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        const maxDateStr = maxDate.toISOString().split('T')[0];

        return `
            <div class="wizard-step step-active" data-step="3">
                <h3 class="step-title"><i class="fas fa-calendar-alt"></i> Schedule</h3>
                <p class="step-description">Choose your preferred date and time</p>
                
                <div class="form-group">
                    <label for="preferred-date">
                        <i class="fas fa-calendar"></i> Preferred Date
                    </label>
                    <input type="date" id="preferred-date" class="form-control" 
                           value="${this.formData.preferredDate}" min="${today}" max="${maxDateStr}">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-clock"></i> Preferred Time Slots</label>
                    <div id="time-slots-container">
                        ${this.formData.timeSlots.length > 0 ? 
                            this.formData.timeSlots.map((slot, i) => `
                                <div class="time-slot-row">
                                    <input type="time" class="time-slot-input form-control" value="${slot}" data-index="${i}">
                                    <button type="button" class="btn-remove-time" onclick="bookingWizard.removeTimeSlot(${i})">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `).join('') : `
                                <div class="time-slot-row">
                                    <input type="time" class="time-slot-input form-control" data-index="0">
                                </div>
                            `
                        }
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" id="add-time-slot">
                        <i class="fas fa-plus"></i> Add Another Time Slot
                    </button>
                    <small class="field-help">Select up to 3 preferred times</small>
                </div>
                
                <div class="quick-time-buttons">
                    <label>Quick Select:</label>
                    <div class="time-presets">
                        <button type="button" class="time-preset" data-time="09:00">9:00 AM</button>
                        <button type="button" class="time-preset" data-time="12:00">12:00 PM</button>
                        <button type="button" class="time-preset" data-time="15:00">3:00 PM</button>
                        <button type="button" class="time-preset" data-time="18:00">6:00 PM</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderLocationStep() {
        return `
            <div class="wizard-step step-active" data-step="4">
                <h3 class="step-title"><i class="fas fa-map-marker-alt"></i> Location</h3>
                <p class="step-description">Where should the worker come?</p>
                
                <div class="address-input-method">
                    <div class="address-tabs">
                        <button type="button" class="address-tab active" data-tab="type">
                            <i class="fas fa-keyboard"></i> Type Address
                        </button>
                        <button type="button" class="address-tab" data-tab="map">
                            <i class="fas fa-map"></i> Pick on Map
                        </button>
                    </div>
                    
                    <div class="address-tab-content" id="tab-type">
                        <div class="address-autocomplete-wrapper">
                            <input type="text" id="address-search" class="form-control" 
                                   placeholder="Start typing to search address..." autocomplete="off"
                                   value="${this.formData.addressLine}">
                            <div id="autocomplete-results" class="autocomplete-results"></div>
                        </div>
                        
                        <div class="address-fields-grid">
                            <div class="form-group">
                                <label>Address Line</label>
                                <input type="text" id="address-line" class="form-control" 
                                       placeholder="Street address" value="${this.formData.addressLine}">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Locality</label>
                                    <input type="text" id="locality" class="form-control" 
                                           placeholder="Locality" value="${this.formData.locality}">
                                </div>
                                <div class="form-group">
                                    <label>City</label>
                                    <input type="text" id="city" class="form-control" 
                                           placeholder="City" value="${this.formData.city}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>State</label>
                                    <input type="text" id="state" class="form-control" 
                                           placeholder="State" value="${this.formData.state}">
                                </div>
                                <div class="form-group">
                                    <label>Pincode</label>
                                    <input type="text" id="pincode" class="form-control" 
                                           placeholder="6-digit pincode" maxlength="6" value="${this.formData.pincode}">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="address-tab-content" id="tab-map" style="display: none;">
                        <div class="map-controls">
                            <button type="button" class="btn btn-outline btn-sm" id="detect-location">
                                <i class="fas fa-location-crosshairs"></i> Use My Location
                            </button>
                            <span id="location-status" class="location-status"></span>
                        </div>
                        <div id="address-map" class="address-map"></div>
                        <input type="hidden" id="map-lat" value="${this.formData.mapLat}">
                        <input type="hidden" id="map-lng" value="${this.formData.mapLng}">
                    </div>
                </div>
            </div>
        `;
    }

    renderPaymentStep() {
        const servicePrices = {
            'electrical': 500, 'plumbing': 400, 'carpentry': 600, 
            'painting': 450, 'cleaning': 350, 'ac_repair': 700
        };
        const basePrice = servicePrices[this.formData.serviceType] || 500;
        const platformFee = Math.round(basePrice * 0.05);
        const total = basePrice + platformFee;

        return `
            <div class="wizard-step step-active" data-step="5">
                <h3 class="step-title"><i class="fas fa-credit-card"></i> Payment</h3>
                <p class="step-description">Complete your payment securely</p>
                
                <div class="payment-summary">
                    <h4><i class="fas fa-receipt"></i> Payment Summary</h4>
                    <div class="summary-row">
                        <span>Service Charge</span>
                        <span>₹${basePrice}</span>
                    </div>
                    <div class="summary-row">
                        <span>Platform Fee (5%)</span>
                        <span>₹${platformFee}</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>Total Amount</span>
                        <span class="total-amount">₹${total}</span>
                    </div>
                </div>
                
                <div class="payment-methods">
                    <h4><i class="fas fa-wallet"></i> Select Payment Method</h4>
                    
                    <div class="payment-option ${this.formData.paymentMethod === 'razorpay' ? 'selected' : ''}" data-method="razorpay">
                        <div class="payment-option-radio">
                            <input type="radio" name="payment-method" value="razorpay" 
                                   id="pm-razorpay" ${this.formData.paymentMethod === 'razorpay' ? 'checked' : ''}>
                        </div>
                        <div class="payment-option-content">
                            <label for="pm-razorpay">
                                <i class="fas fa-mobile-alt"></i> Razorpay
                            </label>
                            <p>Pay securely with cards, UPI, net banking, or wallets</p>
                        </div>
                        <div class="payment-option-logo">
                            <img src="https://cdn.razorpay.com/static/assets/logo/payment.svg" alt="Razorpay">
                        </div>
                    </div>
                    
                    <div class="payment-option ${this.formData.paymentMethod === 'paylater' ? 'selected' : ''}" data-method="paylater">
                        <div class="payment-option-radio">
                            <input type="radio" name="payment-method" value="paylater" 
                                   id="pm-paylater" ${this.formData.paymentMethod === 'paylater' ? 'checked' : ''}>
                        </div>
                        <div class="payment-option-content">
                            <label for="pm-paylater">
                                <i class="fas fa-calendar-check"></i> Pay Later
                            </label>
                            <p>Pay after the service is completed</p>
                        </div>
                    </div>
                </div>
                
                <div class="payment-security">
                    <i class="fas fa-shield-alt"></i>
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>
                
                <button type="button" class="btn btn-primary btn-block" id="proceed-payment">
                    <i class="fas fa-lock"></i> Pay ₹${total}
                </button>
            </div>
        `;
    }

    renderConfirmationStep() {
        return `
            <div class="wizard-step step-active step-confirmation" data-step="6">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 class="step-title">Booking Confirmed!</h3>
                <p class="step-description">Your service booking has been successfully submitted</p>
                
                <div class="booking-details-card">
                    <div class="booking-id">
                        <span>Booking ID:</span>
                        <strong id="booking-id">#HM-${Date.now().toString(36).toUpperCase()}</strong>
                    </div>
                    
                    <div class="booking-info-grid">
                        <div class="info-item">
                            <i class="fas fa-list-check"></i>
                            <div>
                                <label>Service</label>
                                <span>${this.formData.serviceType || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <label>Date</label>
                                <span>${this.formData.preferredDate || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <label>Time</label>
                                <span>${this.formData.timeSlots[0] || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <label>Location</label>
                                <span>${this.formData.city || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h4><i class="fas fa-info-circle"></i> What's Next?</h4>
                    <ul class="next-steps-list">
                        <li><i class="fas fa-bell"></i> The worker will be notified of your booking</li>
                        <li><i class="fas fa-comment"></i> You'll receive a confirmation via SMS/email</li>
                        <li><i class="fas fa-user-clock"></i> The worker may contact you to confirm details</li>
                        <li><i class="fas fa-calendar-check"></i> Arrive on time for your scheduled service</li>
                    </ul>
                </div>
                
                <div class="confirmation-actions">
                    <a href="/bookings/" class="btn btn-secondary">
                        <i class="fas fa-list"></i> View All Bookings
                    </a>
                    <a href="/profiles/workers/" class="btn btn-primary">
                        <i class="fas fa-search"></i> Book Another Service
                    </a>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#wizard-prev')) {
                this.previousStep();
            }
            if (e.target.closest('#wizard-next')) {
                this.nextStep();
            }
        });
    }

    bindStepEvents() {
        if (this.currentStep === 1) {
            this.bindServiceSelection();
        } else if (this.currentStep === 2) {
            this.bindDetailsEvents();
        } else if (this.currentStep === 3) {
            this.bindDateTimeEvents();
        } else if (this.currentStep === 4) {
            this.bindLocationEvents();
        } else if (this.currentStep === 5) {
            this.bindPaymentEvents();
        }
    }

    bindServiceSelection() {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('service-card-select'));
                card.classList.add('service-card-select');
                this.formData.serviceType = card.dataset.service;
                this.formData.paymentAmount = parseInt(card.dataset.price);
                this.showToast('Service selected!', 'success');
            });
        });
    }

    bindDetailsEvents() {
        const textarea = document.getElementById('service-description');
        const counter = document.getElementById('desc-count');
        
        if (textarea && counter) {
            textarea.addEventListener('input', () => {
                this.formData.description = textarea.value;
                counter.textContent = textarea.value.length;
            });
        }
    }

    bindDateTimeEvents() {
        const dateInput = document.getElementById('preferred-date');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                this.formData.preferredDate = dateInput.value;
            });
        }

        const addBtn = document.getElementById('add-time-slot');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTimeSlot());
        }

        const presets = document.querySelectorAll('.time-preset');
        presets.forEach(preset => {
            preset.addEventListener('click', () => {
                const time = preset.dataset.time;
                this.addTimeSlot(time);
            });
        });
    }

    addTimeSlot(time = '') {
        const container = document.getElementById('time-slots-container');
        const rows = container.querySelectorAll('.time-slot-row');
        
        if (rows.length >= 3) {
            this.showToast('Maximum 3 time slots allowed', 'error');
            return;
        }

        const index = rows.length;
        const row = document.createElement('div');
        row.className = 'time-slot-row';
        row.innerHTML = `
            <input type="time" class="time-slot-input form-control" value="${time}" data-index="${index}">
            <button type="button" class="btn-remove-time" onclick="bookingWizard.removeTimeSlot(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(row);
        
        if (time) {
            this.collectTimeSlots();
        }
    }

    removeTimeSlot(index) {
        const container = document.getElementById('time-slots-container');
        const rows = container.querySelectorAll('.time-slot-row');
        
        if (rows.length > 1) {
            rows[index]?.remove();
            this.collectTimeSlots();
            this.rebindTimeSlotEvents();
        }
    }

    rebindTimeSlotEvents() {
        const rows = document.querySelectorAll('.time-slot-row');
        rows.forEach((row, i) => {
            const input = row.querySelector('input');
            if (input) {
                input.dataset.index = i;
                input.onchange = () => this.collectTimeSlots();
            }
        });
    }

    collectTimeSlots() {
        const inputs = document.querySelectorAll('.time-slot-input');
        this.formData.timeSlots = Array.from(inputs)
            .map(input => input.value)
            .filter(time => time);
    }

    bindLocationEvents() {
        const tabs = document.querySelectorAll('.address-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchLocationTab(tab.dataset.tab));
        });

        const detectBtn = document.getElementById('detect-location');
        if (detectBtn) {
            detectBtn.addEventListener('click', () => this.detectLocation());
        }

        const addressFields = ['address-line', 'locality', 'city', 'state', 'pincode'];
        addressFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.collectAddressData());
            }
        });

        const searchInput = document.getElementById('address-search');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.searchAddress(searchInput.value), 300);
            });
        }

        if (!this.map && document.getElementById('address-map')) {
            this.initMap();
        }
    }

    switchLocationTab(tabName) {
        const tabs = document.querySelectorAll('.address-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        const typeContent = document.getElementById('tab-type');
        const mapContent = document.getElementById('tab-map');
        
        if (tabName === 'type') {
            typeContent.style.display = 'block';
            mapContent.style.display = 'none';
        } else {
            typeContent.style.display = 'none';
            mapContent.style.display = 'block';
            if (this.map) {
                setTimeout(() => this.map.invalidateSize(), 100);
            }
        }
    }

    initMap() {
        if (typeof L === 'undefined') {
            console.warn('Leaflet not loaded');
            return;
        }

        const lat = this.formData.mapLat || 20.5937;
        const lng = this.formData.mapLng || 78.9629;
        const zoom = this.formData.mapLat ? 15 : 5;

        this.map = L.map('address-map').setView([lat, lng], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        if (this.formData.mapLat && this.formData.mapLng) {
            this.setMapMarker(lat, lng);
        }

        this.map.on('click', (e) => {
            this.setMapMarker(e.latlng.lat, e.latlng.lng);
            this.reverseGeocode(e.latlng.lat, e.latlng.lng);
        });
    }

    setMapMarker(lat, lng) {
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
        this.marker = L.marker([lat, lng]).addTo(this.map);
        document.getElementById('map-lat').value = lat;
        document.getElementById('map-lng').value = lng;
        this.formData.mapLat = lat;
        this.formData.mapLng = lng;
    }

    async reverseGeocode(lat, lng) {
        const status = document.getElementById('location-status');
        status.textContent = 'Getting address...';
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            
            if (data.display_name) {
                document.getElementById('address-search').value = data.display_name;
                document.getElementById('address-line').value = data.address?.road || data.address?.neighbourhood || '';
                document.getElementById('locality').value = data.address?.suburb || '';
                document.getElementById('city').value = data.address?.city || data.address?.town || data.address?.village || '';
                document.getElementById('state').value = data.address?.state || '';
                document.getElementById('pincode').value = data.address?.postcode || '';
                this.collectAddressData();
                status.textContent = '✓ Address found';
                setTimeout(() => { status.textContent = ''; }, 2000);
            }
        } catch (error) {
            status.textContent = 'Error getting address';
        }
    }

    async searchAddress(query) {
        if (query.length < 3) return;
        
        const results = document.getElementById('autocomplete-results');
        results.innerHTML = '<div class="search-loading">Searching...</div>';
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await response.json();
            
            results.innerHTML = '';
            
            if (data.length === 0) {
                results.innerHTML = '<div class="search-no-results">No results found</div>';
                return;
            }
            
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.textContent = item.display_name;
                div.addEventListener('click', () => {
                    document.getElementById('address-search').value = item.display_name;
                    document.getElementById('address-line').value = item.address?.road || '';
                    document.getElementById('locality').value = item.address?.suburb || '';
                    document.getElementById('city').value = item.address?.city || item.address?.town || '';
                    document.getElementById('state').value = item.address?.state || '';
                    document.getElementById('pincode').value = item.address?.postcode || '';
                    this.collectAddressData();
                    results.innerHTML = '';
                    
                    const lat = parseFloat(item.lat);
                    const lng = parseFloat(item.lon);
                    if (this.map) {
                        this.map.setView([lat, lng], 15);
                        this.setMapMarker(lat, lng);
                    }
                });
                results.appendChild(div);
            });
        } catch (error) {
            results.innerHTML = '<div class="search-error">Search failed</div>';
        }
    }

    detectLocation() {
        const status = document.getElementById('location-status');
        
        if (!navigator.geolocation) {
            this.showToast('Geolocation not supported', 'error');
            return;
        }
        
        status.textContent = 'Detecting location...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                if (!this.map) {
                    this.initMap();
                }
                
                this.map.setView([lat, lng], 15);
                this.setMapMarker(lat, lng);
                this.reverseGeocode(lat, lng);
                status.textContent = '✓ Location detected';
                setTimeout(() => { status.textContent = ''; }, 2000);
            },
            (error) => {
                status.textContent = 'Location denied';
                this.showToast('Please enable location access', 'error');
            }
        );
    }

    collectAddressData() {
        this.formData.address = document.getElementById('address-search')?.value || '';
        this.formData.addressLine = document.getElementById('address-line')?.value || '';
        this.formData.locality = document.getElementById('locality')?.value || '';
        this.formData.city = document.getElementById('city')?.value || '';
        this.formData.state = document.getElementById('state')?.value || '';
        this.formData.pincode = document.getElementById('pincode')?.value || '';
    }

    bindPaymentEvents() {
        const options = document.querySelectorAll('.payment-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    this.formData.paymentMethod = option.dataset.method;
                }
            });
        });

        const payBtn = document.getElementById('proceed-payment');
        if (payBtn) {
            payBtn.addEventListener('click', () => this.initiatePayment());
        }
    }

    async nextStep() {
        if (this.currentStep === this.totalSteps) {
            this.completeBooking();
            return;
        }

        if (!this.validateCurrentStep()) {
            return;
        }

        await this.animateStepTransition('next');
        this.currentStep++;
        this.updateProgress();
        this.render();
    }

    async previousStep() {
        if (this.currentStep === 1) return;
        
        await this.animateStepTransition('prev');
        this.currentStep--;
        this.updateProgress();
        this.render();
    }

    async animateStepTransition(direction) {
        const container = document.querySelector('.wizard-steps-container');
        if (!container) return;

        const currentStepEl = container.querySelector('.wizard-step');
        if (currentStepEl) {
            currentStepEl.classList.add(direction === 'next' ? 'step-exit-left' : 'step-exit-right');
        }

        await this.delay(200);
    }

    validateCurrentStep() {
        const validator = this.validationRules[this.currentStep];
        return validator ? validator() : true;
    }

    validateStep1() {
        if (!this.formData.serviceType) {
            this.showToast('Please select a service', 'error');
            return false;
        }
        return true;
    }

    validateStep2() {
        if (!this.formData.description || this.formData.description.length < 10) {
            this.showToast('Please provide a detailed description (at least 10 characters)', 'error');
            return false;
        }
        return true;
    }

    validateStep3() {
        if (!this.formData.preferredDate) {
            this.showToast('Please select a preferred date', 'error');
            return false;
        }
        if (this.formData.timeSlots.length === 0) {
            this.showToast('Please select at least one time slot', 'error');
            return false;
        }
        return true;
    }

    validateStep4() {
        if (!this.formData.city || !this.formData.addressLine) {
            this.showToast('Please provide a complete address', 'error');
            return false;
        }
        if (this.formData.pincode && !/^\d{6}$/.test(this.formData.pincode)) {
            this.showToast('Please enter a valid 6-digit pincode', 'error');
            return false;
        }
        return true;
    }

    validateStep5() {
        if (!this.formData.paymentMethod) {
            this.showToast('Please select a payment method', 'error');
            return false;
        }
        return true;
    }

    validateStep6() {
        return true;
    }

    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        if (progressFill) {
            progressFill.style.width = `${this.getProgressPercentage()}%`;
        }
        
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= this.currentStep);
            step.classList.toggle('completed', index + 1 < this.currentStep);
        });
    }

    getProgressPercentage() {
        return ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    }

    async initiatePayment() {
        if (this.formData.paymentMethod === 'razorpay') {
            await this.openRazorpay();
        } else {
            this.completeBooking();
        }
    }

    async initPayment() {
        const servicePrices = {
            'electrical': 500, 'plumbing': 400, 'carpentry': 600, 
            'painting': 450, 'cleaning': 350, 'ac_repair': 700
        };
        const basePrice = servicePrices[this.formData.serviceType] || 500;
        const platformFee = Math.round(basePrice * 0.05);
        const total = basePrice + platformFee;

        return {
            amount: total * 100,
            currency: 'INR',
            name: 'HireMate',
            description: `Service booking - ${this.formData.serviceType}`,
            prefill: {
                name: this.formData.customerName || '',
                email: this.formData.customerEmail || '',
                contact: this.formData.customerPhone || ''
            },
            theme: {
                color: '#3b82f6'
            }
        };
    }

    async openRazorpay() {
        if (typeof Razorpay === 'undefined') {
            this.showToast('Payment gateway not loaded. Please refresh the page.', 'error');
            return;
        }

        try {
            const razorpayKeyId = window.RAZORPAY_KEY_ID || 'rzp_test_123456';
            
            const paymentConfig = await this.initPayment();
            
            const options = {
                key: razorpayKeyId,
                amount: paymentConfig.amount,
                currency: paymentConfig.currency,
                name: paymentConfig.name,
                description: paymentConfig.description,
                prefill: paymentConfig.prefill,
                theme: paymentConfig.theme,
                handler: (response) => this.verifyPayment(response),
                modal: {
                    ondismiss: () => {
                        this.showToast('Payment cancelled', 'info');
                    }
                }
            };

            const rzp = new Razorpay(options);
            
            rzp.on('payment.failed', (response) => {
                this.showToast(`Payment failed: ${response.error.description}`, 'error');
                this.onError({
                    code: 'PAYMENT_FAILED',
                    message: response.error.description,
                    data: response
                });
            });

            rzp.open();
        } catch (error) {
            this.showToast('Error initializing payment', 'error');
            this.onError(error);
        }
    }

    async verifyPayment(response) {
        this.showToast('Payment successful! Processing your booking...', 'success');
        
        this.formData.paymentId = response.razorpay_payment_id;
        this.formData.paymentOrderId = response.razorpay_order_id;
        this.formData.paymentSignature = response.razorpay_signature;
        
        await this.completeBooking();
    }

    async completeBooking() {
        try {
            this.showToast('Submitting your booking...', 'info');

            const bookingData = {
                worker_id: this.workerId,
                ...this.formData
            };

            if (this.workerData.bookingUrl) {
                const response = await fetch(this.workerData.bookingUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': this.getCsrfToken()
                    },
                    body: JSON.stringify(bookingData)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit booking');
                }
            }

            await this.animateStepTransition('next');
            this.currentStep = this.totalSteps;
            this.updateProgress();
            this.render();
            this.showConfetti();
            this.onComplete(bookingData);

        } catch (error) {
            this.showToast('Error submitting booking. Please try again.', 'error');
            this.onError(error);
        }
    }

    getCsrfToken() {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) return csrfInput.value;
        
        const cookie = document.cookie.match(/csrftoken=([^;]+)/);
        return cookie ? cookie[1] : '';
    }

    showConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);

        const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];
        const shapes = ['square', 'circle'];

        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti confetti-${shapes[Math.floor(Math.random() * shapes.length)]}`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.remove();
        }, 5000);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    getFormData() {
        return { ...this.formData };
    }

    setFormData(data) {
        this.formData = { ...this.formData, ...data };
    }

    reset() {
        this.currentStep = 1;
        this.formData = {
            serviceType: '',
            description: '',
            preferredDate: '',
            timeSlots: [],
            address: '',
            addressLine: '',
            locality: '',
            city: '',
            state: '',
            pincode: '',
            mapLat: '',
            mapLng: '',
            paymentMethod: 'razorpay',
            paymentAmount: 0
        };
        this.updateProgress();
        this.render();
    }

    goToStep(step) {
        if (step < 1 || step > this.totalSteps) return;
        this.currentStep = step;
        this.updateProgress();
        this.render();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}

window.BookingWizard = BookingWizard;
