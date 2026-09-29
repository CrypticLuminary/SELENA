from __future__ import annotations

import uuid

from django.core.exceptions import ValidationError
from django.db import models

from staff_accounts.models import StaffUser


class ImmutableContributionQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValidationError("Analytics contributions are immutable.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("Analytics contributions are immutable.")


class AnalyticsContribution(models.Model):
    """
    Minimized statistics-consented projection.

    It deliberately has no foreign key to RawSubmission so approved structured
    analytics can follow its own bounded retention after raw narrative deletion.
    """

    source_submission_id = models.UUIDField(primary_key=True, editable=False)
    age_group = models.CharField(max_length=24)
    setting = models.CharField(max_length=32)
    experience_types = models.JSONField(default=list)
    relationship_categories = models.JSONField(default=list, blank=True)

    statistics_consent_record_id = models.UUIDField(editable=False)
    consent_text_version = models.CharField(max_length=64, editable=False)
    privacy_policy_version = models.CharField(max_length=64, editable=False)
    schema_version = models.CharField(max_length=64, editable=False)
    source_flow_version = models.CharField(max_length=64, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    retention_expires_at = models.DateTimeField(db_index=True)

    objects = ImmutableContributionQuerySet.as_manager()

    class Meta:
        ordering = ["created_at"]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Analytics contributions are immutable.")
        return super().save(*args, **kwargs)


class AnalyticsEligibilityAction(models.TextChoices):
    EXCLUDE = "exclude", "Exclude from future snapshots"
    RESTORE = "restore", "Restore future snapshot eligibility"


class AnalyticsEligibilityReason(models.TextChoices):
    SPAM = "spam", "Technical spam"
    OUT_OF_SCOPE = "out_of_scope", "Outside declared platform scope"
    ABUSE_DUPLICATE = "abuse_duplicate", "Confirmed abusive duplicate"
    ABUSE_AUTOMATION = "abuse_automation", "Confirmed automated abuse"
    OPERATOR_CORRECTION = "operator_correction", "Correction of a prior eligibility decision"


class ImmutableEligibilityEventQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValidationError("Analytics eligibility events are append-only.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("Analytics eligibility events are append-only.")

    def delete(self):
        raise ValidationError("Analytics eligibility events are append-only.")


class AnalyticsEligibilityEvent(models.Model):
    """
    Append-only evidence controlling future aggregate eligibility.

    This is deliberately separate from survivor credibility and story-publication
    decisions. It is only for bounded technical/purpose exclusions such as spam
    or an out-of-scope submission.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_submission_id = models.UUIDField(db_index=True, editable=False)
    action = models.CharField(
        max_length=16,
        choices=AnalyticsEligibilityAction.choices,
        editable=False,
    )
    reason_code = models.CharField(
        max_length=32,
        choices=AnalyticsEligibilityReason.choices,
        editable=False,
    )
    actor = models.ForeignKey(
        StaffUser,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="analytics_eligibility_events",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    objects = ImmutableEligibilityEventQuerySet.as_manager()

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(
                fields=["source_submission_id", "-created_at"],
                name="analytics_elig_source_created",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Analytics eligibility events are append-only.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Analytics eligibility events are append-only.")


class ImmutableSnapshotQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValidationError("Analytics snapshots are append-only.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("Analytics snapshots are append-only.")


class AnalyticsSnapshot(models.Model):
    """
    Frozen public-safe aggregate output.

    The payload contains only suppression states, count bands, relative scales,
    and approved category identifiers. Exact source counts are never persisted.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset_version = models.CharField(max_length=96, unique=True, editable=False)
    privacy_policy_version = models.CharField(max_length=64, editable=False)
    generated_label = models.CharField(max_length=96, editable=False)
    total_band = models.CharField(max_length=24, blank=True, default="", editable=False)
    payload = models.JSONField(editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    objects = ImmutableSnapshotQuerySet.as_manager()

    class Meta:
        ordering = ["created_at"]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Analytics snapshots are append-only.")
        return super().save(*args, **kwargs)
