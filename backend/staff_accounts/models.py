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

    class Meta:
        permissions = [
            ("view_raw_submission", "Can view raw survivor submissions"),
            ("claim_moderation_case", "Can claim moderation cases"),
            ("edit_redaction", "Can create privacy redaction drafts"),
            ("decide_moderation_case", "Can decide moderation cases"),
            ("handle_escalated_moderation", "Can handle escalated moderation cases"),
            ("publish_story", "Can publish an approved story"),
            (
                "publish_story_dual_control",
                "Can perform final publication under dual control",
            ),
            ("review_analytics", "Can review approved analytics operations"),
            ("handle_story_report", "Can handle public story reports"),
            ("process_removal", "Can process verified removal requests"),
            ("manage_staff_access", "Can manage staff access"),
            ("break_glass_raw_access", "Can perform audited emergency raw access"),
        ]

    def __str__(self) -> str:
        return self.username
