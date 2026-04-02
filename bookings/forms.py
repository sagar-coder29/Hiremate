from django import forms

from .models import Booking, BookingTimeSlot


class BookingTimeSlotForm(forms.ModelForm):
    class Meta:
        model = BookingTimeSlot
        fields = ["time"]
        widgets = {
            "time": forms.TimeInput(attrs={"type": "time", "class": "time-slot-input"}),
        }


class BookingForm(forms.ModelForm):
    preferred_date = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
    service_subtype = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={"class": "form-control"}),
    )
    save_address = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={"class": "save-address-checkbox"}),
        label="Save this address for future bookings",
    )
    address_label = forms.CharField(
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={"placeholder": "e.g., Home, Office"}),
        label="Address Label",
    )

    class Meta:
        model = Booking
        fields = [
            "description",
            "preferred_date",
            "service_subtype",
            "address",
            "save_address",
            "address_label",
        ]
        widgets = {
            "description": forms.Textarea(
                attrs={"rows": 3, "maxlength": "500", "class": "description-input"}
            ),
            "address": forms.Textarea(
                attrs={
                    "rows": 3,
                    "class": "address-input",
                    "placeholder": "Enter full address...",
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        service_type = kwargs.pop("service_type", None)
        super().__init__(*args, **kwargs)
        if service_type:
            from profiles.models import SERVICE_SUBTYPES

            choices = SERVICE_SUBTYPES.get(service_type, [])
            self.fields["service_subtype"].choices = [
                ("", "Select service type")
            ] + list(choices)
        else:
            self.fields["service_subtype"].widget = forms.HiddenInput()

    latitude = forms.FloatField(required=False)
    longitude = forms.FloatField(required=False)
    map_address = forms.CharField(required=False, widget=forms.Textarea())
    estimated_hours = forms.DecimalField(
        min_value=0.5,
        initial=1,
        widget=forms.NumberInput(attrs={"min": "0.5", "step": "0.5"}),
    )


class PaymentForm(forms.Form):
    amount = forms.DecimalField(widget=forms.HiddenInput())
    razorpay_order_id = forms.CharField(widget=forms.HiddenInput())
    razorpay_payment_id = forms.CharField(required=False, widget=forms.HiddenInput())
    razorpay_signature = forms.CharField(required=False, widget=forms.HiddenInput())
