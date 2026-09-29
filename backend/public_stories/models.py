from __future__ import annotations

import uuid

from django.core.exceptions import ValidationError
from django.db import models

from staff_accounts.models import StaffUser


class PublicStory(models.Model):
    """
    Public/redacted representation.

    This model deliberately contains no foreign key to RawSubmission or
    ModerationCase. Private source data can expire without deleting the public
    story that was separately consented and approved.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    alias = models.CharField(max_length=64)
    age_group = models.CharField(max_length=24)
    relationship = models.CharField(max_length=32)
    setting = models.CharField(max_length=32)
    experience_types = models.JSONField(default=list)
    warnings = models.JSONField(default=list, blank=True)
    excerpt = models.CharField(max_length=320)
    content = models.TextField()
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    published_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-published_at"]


class PublicRemovalCredential(models.Model):
    """
    Durable verifier for the submitter's original one-time removal code.

    The plaintext code is never copied or persisted. Keeping only the slow salted
    verifier allows a published story to remain removable after raw/private data
    reaches its retention deadline.
    """

    story = models.OneToOneField(
        PublicStory,
        primary_key=True,
        on_delete=models.CASCADE,
        related_name="removal_credential",
    )
    verifier = models.CharField(max_length=256)
    copied_at = models.DateTimeField(auto_now_add=True)
    invalidated_at = models.DateTimeField(null=True, blank=True)


class ImmutablePublicationRecordQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValidationError("Publication provenance is append-only.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("Publication provenance is append-only.")

    def delete(self):
        raise ValidationError("Publication provenance is append-only.")


class PublicationRecord(models.Model):
    """
    Minimal append-only publication provenance.

    Only opaque public/private IDs and staff authorization evidence are stored.
    There is intentionally no foreign key to either the private moderation graph
    or PublicStory: future story removal can delete the public representation
    while preserving minimal evidence that publication occurred.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    public_story_id = models.UUIDField(unique=True)
    source_case_id = models.UUIDField(unique=True)
    source_submission_id = models.UUIDField(db_index=True)
    source_draft_id = models.UUIDField()
    source_draft_version = models.PositiveIntegerField()
    approval_event_id = models.UUIDField()
    moderation_approved_by = models.ForeignKey(
        StaffUser,
        on_delete=models.PROTECT,
        related_name="approved_publication_records",
    )
    published_by = models.ForeignKey(
        StaffUser,
        on_delete=models.PROTECT,
        related_name="publication_records",
    )
    control_mode = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ImmutablePublicationRecordQuerySet.as_manager()

    class Meta:
        ordering = ["created_at"]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Publication provenance is append-only.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Publication provenance is append-only.")


class StoryReportStatus(models.TextChoices):
    RECEIVED = "received", "Received"


class StoryReport(models.Model):
    """Minimal anonymous report; no free text or reporter identity is collected."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    story = models.ForeignKey(
        PublicStory,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    reason = models.CharField(max_length=32)
    status = models.CharField(
        max_length=24,
        choices=StoryReportStatus.choices,
        default=StoryReportStatus.RECEIVED,
        editable=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
