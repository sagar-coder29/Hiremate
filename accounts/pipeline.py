from social_core.pipeline.social_auth import associate_by_email


def create_customer_profile(backend, user, response, *args, **kwargs):
    from profiles.models import CustomerProfile

    if backend.name == "google-oauth2":
        CustomerProfile.objects.get_or_create(user=user)
