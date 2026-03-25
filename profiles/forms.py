from django import forms

from .models import CustomerProfile, WorkerProfile


class WorkerProfileForm(forms.ModelForm):
    class Meta:
        model = WorkerProfile
        fields = [
            'service_type', 'price_per_hour', 'city', 'state',
            'experience_years', 'bio', 'phone', 'is_available',
        ]
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4}),
        }


class CustomerProfileForm(forms.ModelForm):
    class Meta:
        model = CustomerProfile
        fields = ['phone', 'city', 'state']
