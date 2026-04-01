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
