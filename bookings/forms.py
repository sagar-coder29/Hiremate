from django import forms

from .models import Booking


class BookingForm(forms.ModelForm):
    preferred_date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'})
    )
    preferred_time = forms.TimeField(
        widget=forms.TimeInput(attrs={'type': 'time'})
    )

    class Meta:
        model = Booking
        fields = ['description', 'preferred_date', 'preferred_time', 'address']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
            'address': forms.Textarea(attrs={'rows': 3}),
        }
