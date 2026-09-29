from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from privacy_review.detector import detect_identifying_details
from staff_accounts.models import StaffRole, StaffUser
from submissions.models import (
    ConsentPurpose,
    ConsentRecord,
    PublicationChoice,
    RawSubmission,
    SubmissionState,
)
from submissions.policy import MAX_STORY_LENGTH

from .exceptions import ModerationWorkflowError
from .models import (
    ModerationAction,
    ModerationCase,
    ModerationEvent,
    ModerationStatus,
    RedactionDraft,
)
from .policy import CONTENT_WARNINGS, ESCALATION_REASONS, REJECTION_REASONS


def _latest_publication_consent(submission: RawSubmission) -> ConsentRecord | None:
    return (
        ConsentRecord.objects.filter(
            submission=submission,
            purpose=ConsentPurpose.PUBLICATION,
        )
        .order_by("-recorded_at")
        .first()
    )


def _event(
    case: ModerationCase,
    *,
    actor: StaffUser | None,
    action: str,
    from_status: str,
    to_status: str,
    reason_code: str = "",
) -> ModerationEvent:
    return ModerationEvent.objects.create(
        case=case,
        actor=actor,
        action=action,
        from_status=from_status,
        to_status=to_status,
        reason_code=reason_code,
    )


@transaction.atomic
def ensure_moderation_case(submission: RawSubmission) -> ModerationCase | None:
    if submission.publication_choice != PublicationChoice.PUBLIC:
        return None

    consent = _latest_publication_consent(submission)
    if consent is None or not consent.granted:
        return None

    case, created = ModerationCase.objects.get_or_create(submission=submission)
    if created:
        submission.state = SubmissionState.NEEDS_REVIEW
        submission.save(update_fields=["state"])
        _event(
            case,
            actor=None,
            action=ModerationAction.CASE_CREATED,
            from_status="",
            to_status=ModerationStatus.PENDING,
        )
    return case


@transaction.atomic
def claim_case(case_id, actor: StaffUser) -> ModerationCase:
    case = ModerationCase.objects.select_for_update().get(pk=case_id)

    if case.status == ModerationStatus.ESCALATED and actor.role != StaffRole.SENIOR_MODERATOR:
        raise ModerationWorkflowError("Escalated cases require a senior moderator.")

    if case.status not in {ModerationStatus.PENDING, ModerationStatus.ESCALATED}:
        raise ModerationWorkflowError("This case cannot be claimed in its current state.")

    previous = case.status
    case.status = ModerationStatus.IN_REVIEW
    case.assigned_to = actor
    case.save(update_fields=["status", "assigned_to", "updated_at"])
    _event(
        case,
        actor=actor,
        action=ModerationAction.CLAIMED,
        from_status=previous,
        to_status=case.status,
    )
    return case


def _require_assigned(case: ModerationCase, actor: StaffUser) -> None:
    if case.status != ModerationStatus.IN_REVIEW:
        raise ModerationWorkflowError("The case must be in review.")
    if case.assigned_to_id != actor.id:
        raise ModerationWorkflowError("Only the assigned moderator can modify this case.")


@transaction.atomic
def create_redaction_draft(
    case_id,
    actor: StaffUser,
    *,
    redacted_text: str,
    content_warnings: list[str],
) -> RedactionDraft:
    case = ModerationCase.objects.select_for_update().get(pk=case_id)
    _require_assigned(case, actor)

    if len(redacted_text) > MAX_STORY_LENGTH:
        raise ModerationWorkflowError("Redacted text is too long.")
    if not redacted_text.strip():
        raise ModerationWorkflowError("Redacted text cannot be empty.")

    warnings = list(dict.fromkeys(content_warnings))
    if any(warning not in CONTENT_WARNINGS for warning in warnings):
        raise ModerationWorkflowError("Unsupported content warning.")

    previous = case.drafts.order_by("-version").first()
    version = 1 if previous is None else previous.version + 1

    draft = RedactionDraft.objects.create(
        case=case,
        version=version,
        redacted_text=redacted_text,
        content_warnings=warnings,
        editor=actor,
        supersedes=previous,
    )
    _event(
        case,
        actor=actor,
        action=ModerationAction.DRAFT_CREATED,
        from_status=case.status,
        to_status=case.status,
    )
    return draft


@transaction.atomic
def decide_case(
    case_id,
    actor: StaffUser,
    *,
    decision: str,
    reason_code: str = "",
) -> ModerationCase:
    case = ModerationCase.objects.select_for_update().get(pk=case_id)
    _require_assigned(case, actor)

    if decision == ModerationAction.APPROVED:
        consent = _latest_publication_consent(case.submission)
        if consent is None or not consent.granted:
            raise ModerationWorkflowError("Publication consent is not currently granted.")

        draft = case.drafts.order_by("-version").first()
        if draft is None:
            raise ModerationWorkflowError("Approval requires a redaction draft.")

        try:
            findings = detect_identifying_details(draft.redacted_text)
        except Exception as exc:
            raise ModerationWorkflowError("Privacy validation could not be completed.") from exc

        if findings:
            raise ModerationWorkflowError(
                "The latest draft still contains automated privacy flags."
            )
        next_status = ModerationStatus.APPROVED
        case.submission.state = SubmissionState.APPROVED
        case.submission.save(update_fields=["state"])
    elif decision == ModerationAction.REJECTED:
        if reason_code not in REJECTION_REASONS:
            raise ModerationWorkflowError("A supported rejection reason is required.")
        next_status = ModerationStatus.REJECTED
        case.submission.state = SubmissionState.REJECTED
        case.submission.retention_expires_at = timezone.now() + timedelta(
            days=settings.REJECTED_SUBMISSION_RETENTION_DAYS
        )
        case.submission.save(update_fields=["state", "retention_expires_at"])
    elif decision == ModerationAction.ESCALATED:
        if reason_code not in ESCALATION_REASONS:
            raise ModerationWorkflowError("A supported escalation reason is required.")
        next_status = ModerationStatus.ESCALATED
        case.submission.state = SubmissionState.NEEDS_REVIEW
        case.submission.save(update_fields=["state"])
    else:
        raise ModerationWorkflowError("Unsupported moderation decision.")

    previous = case.status
    case.status = next_status
    case.assigned_to = None
    case.save(update_fields=["status", "assigned_to", "updated_at"])
    _event(
        case,
        actor=actor,
        action=decision,
        from_status=previous,
        to_status=next_status,
        reason_code=reason_code,
    )
    return case
