import hashlib
import hmac

from django.conf import settings
from rest_framework.throttling import AnonRateThrottle


class SubmissionAnonThrottle(AnonRateThrottle):
    scope = "submission"

    def get_cache_key(self, request, view):
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            return None

        ident = self.get_ident(request)
        derived_ident = hmac.new(
            settings.SECRET_KEY.encode(),
            ident.encode(),
            hashlib.sha256,
        ).hexdigest()
        return self.cache_format % {"scope": self.scope, "ident": derived_ident}
