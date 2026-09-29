from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from moderation.models import (
    ModerationAction,
    ModerationCase,
    ModerationStatus,
)
from privacy_review.detector import detect_identifying_details
from staff_accounts.models import StaffRole, StaffUser
from submissions.models import (
    ConsentPurpose,
    ConsentRecord,
    RemovalCredential,
    SubmissionState,
)

from .aliases import generate_public_alias
from .exceptions import PublicationWorkflowError
from .models import PublicationRecord, PublicRemovalCredential, PublicStory
from .policy import (
    PUBLICATION_MODE_DISABLED,
    PUBLICATION_MODE_SINGLE,
    PUBLICATION_MODES,
)


def _latest_publication_consent(case: ModerationCase) -> ConsentRecord | None:
    return (
        ConsentRecord.objects.filter(
            submission=case.submission,
            purpose=ConsentPurpose.PUBLICATION,
        )
        .order_by("-recorded_at")
        .first()
    )


def _latest_approval_event(case: ModerationCase):
    return (
        case.events.filter(
            action=ModerationAction.APPROVED,
            to_status=ModerationStatus.APPROVED,
        )
        .select_related("actor")
        .order_by("-created_at")
        .first()
    )


def _validate_control_mode(
    *,
    mode: str,
    actor: StaffUser,
    approval_actor: StaffUser,
) -> None:
    if mode not in PUBLICATION_MODES:
        raise PublicationWorkflowError("Publication control configuration is invalid.")
    if mode == PUBLICATION_MODE_DISABLED:
        raise PublicationWorkflowError("Publication is disabled by governance configuration.")

    if mode == PUBLICATION_MODE_SINGLE:
        if actor.role not in {StaffRole.MODERATOR, StaffRole.SENIOR_MODERATOR}:
            raise PublicationWorkflowError("This role cannot publish stories.")
        return

    if actor.role != StaffRole.SENIOR_MODERATOR:
        raise PublicationWorkflowError("Dual-control publication requires a senior moderator.")
    if actor.pk == approval_actor.pk:
        raise PublicationWorkflowError(
            "Dual-control publication requires a different staff member."
        )


def _validate_public_projection(
    submission,
    *,
    age_group: str,
    relationship: str,
    setting: str,
    experience_types: list[str],
) -> list[str]:
    """
    Public metadata may only reduce/suppress submitted information.

    Moderators cannot invent or increase specificity at publication time.
    """
    if age_group != "prefer_not" and age_group != submission.age_group:
        raise PublicationWorkflowError(
            "Public age group must match the submitted broad value or be suppressed."
        )

    if setting != "prefer_not" and setting != submission.setting:
        raise PublicationWorkflowError(
            "Public setting must match the submitted broad value or be suppressed."
        )

    cleaned_experiences = list(dict.fromkeys(experience_types))
    if "prefer_not" in cleaned_experiences and len(cleaned_experiences) != 1:
        raise PublicationWorkflowError(
            "Prefer-not-to-say cannot be combined with public experience values."
        )
    if cleaned_experiences != ["prefer_not"]:
        source_experiences = set(submission.experience_types)
        if any(value not in source_experiences for value in cleaned_experiences):
            raise PublicationWorkflowError(
                "Public experience types must be a subset of submitted broad values."
            )

    source_relationships = {
        person.get("relationship_category")
        for person in submission.people_involved
        if isinstance(person, dict)
    }
    source_relationships.discard(None)
    if relationship != "prefer_not" and relationship not in source_relationships:
        raise PublicationWorkflowError(
            "Public relationship must match a submitted broad category or be suppressed."
        )

    return cleaned_experiences


@transaction.atomic
def publish_case(
    case_id,
    actor: StaffUser,
    *,
    age_group: str,
    relationship: str,
    setting: str,
    experience_types: list[str],
    excerpt: str,
) -> tuple[PublicStory, bool]:
    case = ModerationCase.objects.select_for_update().select_related("submission").get(pk=case_id)

    existing = PublicationRecord.objects.filter(source_case_id=case.id).first()
    if existing:
        story = PublicStory.objects.filter(
            pk=existing.public_story_id,
            is_active=True,
        ).first()
        if story is None:
            raise PublicationWorkflowError(
                "This publication has already been removed and cannot be recreated."
            )
        return story, False

    if case.status != ModerationStatus.APPROVED:
        raise PublicationWorkflowError("The moderation case is not approved.")

    consent = _latest_publication_consent(case)
    if consent is None or not consent.granted:
        raise PublicationWorkflowError("Publication consent is not currently granted.")

    approval = _latest_approval_event(case)
    if approval is None or approval.actor is None:
        raise PublicationWorkflowError("Moderation approval evidence is missing.")

    mode = settings.PUBLICATION_CONTROL_MODE
    _validate_control_mode(mode=mode, actor=actor, approval_actor=approval.actor)

    draft = case.drafts.order_by("-version").first()
    if draft is None:
        raise PublicationWorkflowError("Approved case has no redaction draft.")

    cleaned_experiences = _validate_public_projection(
        case.submission,
        age_group=age_group,
        relationship=relationship,
        setting=setting,
        experience_types=experience_types,
    )

    try:
        content_findings = detect_identifying_details(draft.redacted_text)
        excerpt_findings = detect_identifying_details(excerpt)
    except Exception as exc:
        raise PublicationWorkflowError("Privacy validation could not be completed.") from exc

    if content_findings or excerpt_findings:
        raise PublicationWorkflowError("Public content still contains automated privacy flags.")

    submission = case.submission
    try:
        source_removal_credential = submission.removal_credential
    except RemovalCredential.DoesNotExist as exc:
        raise PublicationWorkflowError(
            "Removal credential evidence is missing; publication is blocked."
        ) from exc

    story = PublicStory.objects.create(
        alias=generate_public_alias(),
        age_group=age_group,
        relationship=relationship,
        setting=setting,
        experience_types=cleaned_experiences,
        warnings=draft.content_warnings,
        excerpt=excerpt,
        content=draft.redacted_text,
    )
    PublicRemovalCredential.objects.create(
        story=story,
        verifier=source_removal_credential.verifier,
    )
    PublicationRecord.objects.create(
        public_story_id=story.id,
        source_case_id=case.id,
        source_draft_id=draft.id,
        source_draft_version=draft.version,
        approval_event_id=approval.id,
        moderation_approved_by=approval.actor,
        published_by=actor,
        control_mode=mode,
    )

    submission.state = SubmissionState.APPROVED
    submission.retention_expires_at = timezone.now() + timedelta(
        days=settings.PUBLISHED_RAW_RETENTION_DAYS
    )
    submission.save(update_fields=["state", "retention_expires_at"])

    return story, True
