from __future__ import annotations

import uuid

from django.core.exceptions import ValidationError
from django.db import models

from staff_accounts.models import StaffUser
from submissions.models import RawSubmission


class ModerationStatus(models.TextChoices):
    PENDING = "pending", "Pending review"
    IN_REVIEW = "in_review", "In review"
    ESCALATED = "escalated", "Escalated"
    APPROVED = "approved", "Approved for later publication"
    REJECTED = "rejected", "Rejected"


class ModerationAction(models.TextChoices):
    CASE_CREATED = "case_created", "Case created"
    CLAIMED = "claimed", "Claimed"
    DRAFT_CREATED = "draft_created", "Redaction draft created"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    ESCALATED = "escalated", "Escalated"


class ImmutableModerationQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValidationError("Moderation evidence is append-only.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("Moderation evidence is append-only.")

    def delete(self):
        raise ValidationError("Moderation evidence is append-only; delete the parent submission.")


class ModerationCase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.OneToOneField(
        RawSubmission,
        on_delete=models.CASCADE,
        related_name="moderation_case",
    )
    status = models.CharField(
        max_length=24,
        choices=ModerationStatus.choices,
        default=ModerationStatus.PENDING,
    )
    assigned_to = models.ForeignKey(
        StaffUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_moderation_cases",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["assigned_to", "status"]),
        ]


class RedactionDraft(models.Model):
    """Append-only moderator-authored candidate text; never public by itself."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(
        ModerationCase,
        on_delete=models.CASCADE,
        related_name="drafts",
    )
    version = models.PositiveIntegerField()
    redacted_text = models.TextField()
    content_warnings = models.JSONField(default=list, blank=True)
    editor = models.ForeignKey(
        StaffUser,
        on_delete=models.PROTECT,
        related_name="moderation_drafts",
    )
    supersedes = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.RESTRICT,
        related_name="superseded_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ImmutableModerationQuerySet.as_manager()

    class Meta:
        ordering = ["version"]
        constraints = [
            models.UniqueConstraint(
                fields=["case", "version"],
                name="moderation_unique_draft_version",
            )
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Redaction drafts are append-only.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Redaction drafts are append-only; delete the parent submission.")


class ModerationEvent(models.Model):
    """Append-only audit event with no survivor narrative or free-text notes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(
        ModerationCase,
        on_delete=models.CASCADE,
        related_name="events",
    )
    actor = models.ForeignKey(
        StaffUser,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="moderation_events",
    )
    action = models.CharField(max_length=32, choices=ModerationAction.choices)
    from_status = models.CharField(max_length=24, blank=True)
    to_status = models.CharField(max_length=24)
    reason_code = models.CharField(max_length=48, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ImmutableModerationQuerySet.as_manager()

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["case", "created_at"])]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Moderation audit events are append-only.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError(
            "Moderation audit events are append-only; delete the parent submission."
        )
