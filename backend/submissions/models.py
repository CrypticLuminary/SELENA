from __future__ import annotations

import uuid

from django.core.exceptions import ValidationError
from django.db import models

from .policy import (
    PRIVACY_POLICY_VERSION,
    SOURCE_FLOW_VERSION,
    SUBMISSION_SCHEMA_VERSION,
)


class PublicationChoice(models.TextChoices):
    PUBLIC = "public", "Public after moderation"
    STATISTICS_ONLY = "statistics_only", "Statistics only"


class SubmissionState(models.TextChoices):
    RECEIVED = "received", "Received"


class ConsentPurpose(models.TextChoices):
    PUBLICATION = "publication", "Public story publication"
    STATISTICS = "statistics", "Aggregate statistics"


class SubmissionDeletionReason(models.TextChoices):
    RETENTION_EXPIRED = "retention_expired", "Retention expired"


class RawSubmission(models.Model):
    """
    Highly sensitive source record.

    There is deliberately no public serializer, public ID, or published flag.
    Publication will use a separate representation in a later milestone.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.CharField(
        max_length=24,
        choices=SubmissionState.choices,
        default=SubmissionState.RECEIVED,
        editable=False,
    )

    age_group = models.CharField(max_length=24)
    setting = models.CharField(max_length=32)
    experience_types = models.JSONField(default=list)

    people_involved = models.JSONField(default=list, blank=True)
    frequency = models.CharField(max_length=32, blank=True)
    periods = models.JSONField(default=list, blank=True)

    story_text = models.TextField(blank=True)
    publication_choice = models.CharField(max_length=24, choices=PublicationChoice.choices)

    schema_version = models.CharField(
        max_length=64,
        default=SUBMISSION_SCHEMA_VERSION,
        editable=False,
    )
    privacy_policy_version = models.CharField(
        max_length=64,
        default=PRIVACY_POLICY_VERSION,
        editable=False,
    )
    source_flow_version = models.CharField(
        max_length=64,
        default=SOURCE_FLOW_VERSION,
        editable=False,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    retention_expires_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ["created_at"]


class SubmissionDeletionTombstone(models.Model):
    """
    Minimal deletion ledger entry used to prevent backup restores from silently
    resurrecting submissions that were already deleted.

    It contains only the former opaque submission UUID and deletion metadata,
    never story text or structured survivor fields.
    """

    submission_id = models.UUIDField(primary_key=True, editable=False)
    reason = models.CharField(max_length=32, choices=SubmissionDeletionReason.choices)
    deleted_at = models.DateTimeField(auto_now_add=True)
    retention_expires_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ["deleted_at"]


class ImmutableConsentQuerySet(models.QuerySet):
    """Block bulk mutation paths that bypass ConsentRecord.save()."""

    def update(self, **kwargs):
        raise ValidationError("Consent records are immutable; create a replacement record.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("Consent records are immutable; create replacement records.")

    def delete(self):
        raise ValidationError("Consent records are append-only; delete the parent submission.")


class ConsentRecord(models.Model):
    """Append-only evidence of one consent decision at submission time."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        RawSubmission,
        on_delete=models.CASCADE,
        related_name="consent_records",
    )
    purpose = models.CharField(max_length=24, choices=ConsentPurpose.choices)
    granted = models.BooleanField()
    consent_text_version = models.CharField(max_length=64)
    privacy_policy_version = models.CharField(max_length=64, default=PRIVACY_POLICY_VERSION)
    schema_version = models.CharField(max_length=64, default=SUBMISSION_SCHEMA_VERSION)
    source_flow_version = models.CharField(max_length=64, default=SOURCE_FLOW_VERSION)
    supersedes = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.RESTRICT,
        related_name="superseded_by",
    )
    recorded_at = models.DateTimeField(auto_now_add=True)

    objects = ImmutableConsentQuerySet.as_manager()

    class Meta:
        ordering = ["recorded_at"]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Consent records are immutable; create a replacement record.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Consent records are append-only; delete the parent submission.")


class RemovalCredential(models.Model):
    """
    Stores only a slow salted verifier.

    The plaintext removal code is returned once and must never be persisted.
    """

    submission = models.OneToOneField(
        RawSubmission,
        primary_key=True,
        on_delete=models.CASCADE,
        related_name="removal_credential",
    )
    verifier = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)
    invalidated_at = models.DateTimeField(null=True, blank=True)
