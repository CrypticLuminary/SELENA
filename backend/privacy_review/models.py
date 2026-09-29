from __future__ import annotations

import uuid

from django.core.exceptions import ValidationError
from django.db import models

from submissions.models import RawSubmission


class ScreeningStatus(models.TextChoices):
    FLAGS_FOUND = "flags_found", "Potential identifying details found"
    NO_AUTOMATED_FLAGS = "no_automated_flags", "No automated flags"
    ERROR = "error", "Screening error"


class FindingCategory(models.TextChoices):
    EMAIL = "email", "Email"
    PHONE = "phone", "Phone"
    URL = "url", "URL"
    SOCIAL_HANDLE = "social_handle", "Social handle"
    PRECISE_DATE = "precise_date", "Precise date"
    STREET_ADDRESS = "street_address", "Street address"
    EXPLICIT_NAME = "explicit_name", "Explicit name disclosure"


class ImmutablePrivacyEvidenceQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValidationError("Privacy screening evidence is append-only.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("Privacy screening evidence is append-only.")

    def delete(self):
        raise ValidationError(
            "Privacy screening evidence is append-only; delete the parent submission."
        )


class PrivacyScreening(models.Model):
    """
    One immutable screening run over a raw submission narrative.

    NO_AUTOMATED_FLAGS never means publication-safe. Human moderation remains
    authoritative, and future detector versions create another screening run.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        RawSubmission,
        on_delete=models.CASCADE,
        related_name="privacy_screenings",
    )
    detector_version = models.CharField(max_length=64)
    status = models.CharField(max_length=32, choices=ScreeningStatus.choices)
    finding_count = models.PositiveIntegerField(default=0)
    supersedes = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.RESTRICT,
        related_name="superseded_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ImmutablePrivacyEvidenceQuerySet.as_manager()

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["submission", "-created_at"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Privacy screening evidence is append-only.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError(
            "Privacy screening evidence is append-only; delete the parent submission."
        )


class PrivacyFinding(models.Model):
    """
    Metadata about a possible identifying detail.

    Deliberately stores no matched text/snippet. Moderation can use the offsets
    against the already-authorized raw narrative when highlighting a finding.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    screening = models.ForeignKey(
        PrivacyScreening,
        on_delete=models.CASCADE,
        related_name="findings",
    )
    category = models.CharField(max_length=32, choices=FindingCategory.choices)
    rule_id = models.CharField(max_length=64)
    start_offset = models.PositiveIntegerField()
    end_offset = models.PositiveIntegerField()

    objects = ImmutablePrivacyEvidenceQuerySet.as_manager()

    class Meta:
        ordering = ["start_offset", "end_offset"]
        constraints = [
            models.UniqueConstraint(
                fields=["screening", "rule_id", "start_offset", "end_offset"],
                name="privacy_unique_finding_span",
            )
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Privacy screening evidence is append-only.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError(
            "Privacy screening evidence is append-only; delete the parent submission."
        )
