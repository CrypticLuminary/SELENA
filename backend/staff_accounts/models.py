from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class StaffRole(models.TextChoices):
    MODERATOR = "moderator", "Moderator"
    SENIOR_MODERATOR = "senior_moderator", "Senior moderator"
    ANALYST = "analyst", "Analyst"
    OPERATIONS_SAFETY = "operations_safety", "Operations / Safety"
    SUPERADMIN = "superadmin", "Superadmin"


class StaffUser(AbstractUser):
    """
    Production accounts are for staff only; public submitters do not get accounts.

    A role label does not replace Django permissions. Sensitive authorization must
    still be checked server-side at the action/object boundary.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=32, choices=StaffRole.choices, default=StaffRole.MODERATOR)

    def __str__(self) -> str:
        return self.username
