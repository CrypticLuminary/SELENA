from datetime import timedelta

import pytest
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.utils import timezone

from analytics.models import AnalyticsEligibilityAction, AnalyticsEligibilityEvent
from moderation.models import (
    ModerationCase,
    ModerationEvent,
    ModerationStatus,
    RedactionDraft,
)
from moderation.services import ensure_moderation_case
from privacy_review.models import PrivacyFinding, PrivacyScreening
from privacy_review.services import run_privacy_screening
from staff_accounts.capabilities import apply_role_template
from staff_accounts.models import StaffRole, StaffUser
from submissions.models import (
    ConsentPurpose,
    ConsentRecord,
    PublicationChoice,
    RawSubmission,
    SubmissionState,
)
from submissions.policy import PUBLICATION_CONSENT_VERSION


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    cache.clear()
    yield
    cache.clear()


def make_staff(username: str, role: str) -> StaffUser:
    user = StaffUser.objects.create_user(
        username=username,
        email=f"{username}@example.test",
        password="A-long-test-password-123!",
        role=role,
        is_staff=True,
    )
    apply_role_template(user)
    return user


def make_case(story_text: str = "A synthetic narrative with no direct identifiers."):
    submission = RawSubmission.objects.create(
        age_group="21_24",
        setting="workplace",
        experience_types=["sexual_comments"],
        story_text=story_text,
        publication_choice=PublicationChoice.PUBLIC,
        retention_expires_at=timezone.now() + timedelta(days=90),
    )
    ConsentRecord.objects.create(
        submission=submission,
        purpose=ConsentPurpose.PUBLICATION,
        granted=True,
        consent_text_version=PUBLICATION_CONSENT_VERSION,
    )
    run_privacy_screening(submission)
    return ensure_moderation_case(submission)


def public_payload(**overrides):
    payload = {
        "age_group": "21_24",
        "setting": "workplace",
        "experience_types": ["sexual_comments"],
        "people_involved": [],
        "frequency": "once",
        "periods": [],
        "story_text": "A synthetic narrative with no direct identifiers.",
        "publication_choice": "public",
        "publication_consent": True,
        "statistics_consent": False,
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
def test_public_submission_automatically_enters_private_moderation_queue(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(),
        content_type="application/json",
    )

    assert response.status_code == 201
    case = ModerationCase.objects.get()
    assert case.status == ModerationStatus.PENDING
    assert case.submission.state == SubmissionState.NEEDS_REVIEW
    assert case.events.get().action == "case_created"


@pytest.mark.django_db
def test_statistics_only_submission_creates_no_moderation_case(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(
            publication_choice="statistics_only",
            publication_consent=False,
            statistics_consent=True,
            story_text="",
            frequency="",
            periods=[],
        ),
        content_type="application/json",
    )

    assert response.status_code == 201
    assert ModerationCase.objects.count() == 0


@pytest.mark.django_db
def test_raw_moderation_api_denies_anonymous_analyst_and_superadmin(client):
    case = make_case()

    anonymous = client.get(reverse("moderation-case", args=[case.id]))
    assert anonymous.status_code in {401, 403}

    for username, role in [
        ("analyst1", StaffRole.ANALYST),
        ("ops1", StaffRole.OPERATIONS_SAFETY),
        ("admin1", StaffRole.SUPERADMIN),
    ]:
        user = make_staff(username, role)
        client.force_login(user)
        denied = client.get(reverse("moderation-case", args=[case.id]))
        assert denied.status_code == 403
        client.logout()


@pytest.mark.django_db
def test_role_label_alone_does_not_grant_raw_moderation_access(client):
    case = make_case()
    unprovisioned = StaffUser.objects.create_user(
        username="label-only-moderator",
        email="label-only@example.test",
        password="A-long-test-password-123!",
        role=StaffRole.MODERATOR,
        is_staff=True,
    )
    client.force_login(unprovisioned)

    denied = client.get(reverse("moderation-case", args=[case.id]))
    assert denied.status_code == 403


@pytest.mark.django_db
def test_moderator_can_read_queue_and_raw_detail_with_no_store_headers(client):
    case = make_case("Synthetic story text for an authorized moderator.")
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    queue = client.get(reverse("moderation-queue"))
    detail = client.get(reverse("moderation-case", args=[case.id]))

    assert queue.status_code == 200
    assert queue.json()[0]["id"] == str(case.id)
    assert "story_text" not in queue.json()[0]

    assert detail.status_code == 200
    assert detail.json()["submission"]["story_text"].startswith("Synthetic story")
    assert "removal_code" not in detail.content.decode()
    assert "removal_credential" not in detail.content.decode()
    assert detail["Cache-Control"] == "no-store"
    assert detail["Pragma"] == "no-cache"
    assert detail["X-Robots-Tag"] == "noindex, nofollow"


@pytest.mark.django_db
def test_claim_serializes_assignment_and_blocks_second_moderator(client):
    case = make_case()
    first = make_staff("moderator1", StaffRole.MODERATOR)
    second = make_staff("moderator2", StaffRole.MODERATOR)

    client.force_login(first)
    claimed = client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    assert claimed.status_code == 200

    client.force_login(second)
    conflict = client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    assert conflict.status_code == 400

    case.refresh_from_db()
    assert case.assigned_to == first
    assert case.status == ModerationStatus.IN_REVIEW


@pytest.mark.django_db
def test_escalated_case_requires_senior_moderator_to_reclaim(client):
    case = make_case()
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    other = make_staff("moderator2", StaffRole.MODERATOR)
    senior = make_staff("senior1", StaffRole.SENIOR_MODERATOR)

    client.force_login(moderator)
    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    escalated = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "escalated", "reason_code": "privacy_complex"},
        content_type="application/json",
    )
    assert escalated.status_code == 200
    assert escalated.json()["status"] == ModerationStatus.ESCALATED

    client.force_login(other)
    denied = client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    assert denied.status_code == 400

    client.force_login(senior)
    claimed = client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    assert claimed.status_code == 200
    assert claimed.json()["status"] == ModerationStatus.IN_REVIEW


@pytest.mark.django_db
def test_redaction_drafts_and_audit_events_are_append_only(client):
    case = make_case()
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    created = client.post(
        reverse("moderation-draft-create", args=[case.id]),
        data={
            "redacted_text": "A privacy-reviewed synthetic narrative.",
            "content_warnings": ["harassment"],
        },
        content_type="application/json",
    )
    assert created.status_code == 201

    draft = RedactionDraft.objects.get()
    draft.redacted_text = "mutated"
    with pytest.raises(ValidationError):
        draft.save()

    with pytest.raises(ValidationError):
        RedactionDraft.objects.update(redacted_text="mutated")

    with pytest.raises(ValidationError):
        draft.delete()

    with pytest.raises(ValidationError):
        RedactionDraft.objects.filter(pk=draft.pk).delete()

    event = ModerationEvent.objects.order_by("-created_at").first()

    with pytest.raises(ValidationError):
        event.delete()

    with pytest.raises(ValidationError):
        ModerationEvent.objects.update(reason_code="mutated")

    with pytest.raises(ValidationError):
        ModerationEvent.objects.filter(pk=event.pk).delete()


@pytest.mark.django_db
def test_approval_requires_draft_and_blocks_remaining_privacy_flags(client):
    case = make_case()
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )

    no_draft = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "approved"},
        content_type="application/json",
    )
    assert no_draft.status_code == 400

    draft = client.post(
        reverse("moderation-draft-create", args=[case.id]),
        data={
            "redacted_text": "Contact survivor@example.test for details.",
            "content_warnings": [],
        },
        content_type="application/json",
    )
    assert draft.status_code == 201

    blocked = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "approved"},
        content_type="application/json",
    )
    assert blocked.status_code == 400

    case.refresh_from_db()
    assert case.status == ModerationStatus.IN_REVIEW


@pytest.mark.django_db
def test_clean_redaction_can_be_approved_but_does_not_create_public_content(client):
    case = make_case()
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    client.post(
        reverse("moderation-draft-create", args=[case.id]),
        data={
            "redacted_text": "A broad synthetic account with identifying details removed.",
            "content_warnings": ["harassment"],
        },
        content_type="application/json",
    )

    approved = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "approved"},
        content_type="application/json",
    )

    assert approved.status_code == 200
    assert approved.json()["status"] == ModerationStatus.APPROVED
    case.refresh_from_db()
    case.submission.refresh_from_db()
    assert case.status == ModerationStatus.APPROVED
    assert case.submission.state == SubmissionState.APPROVED
    assert not hasattr(case, "published_story")
    assert approved["Cache-Control"] == "no-store"


@pytest.mark.django_db
def test_rejection_requires_bounded_reason_code_and_is_audited(client):
    case = make_case()
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    invalid = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "rejected", "reason_code": "free text explaining raw details"},
        content_type="application/json",
    )
    assert invalid.status_code == 400

    before_rejection = timezone.now()
    rejected = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "rejected", "reason_code": "privacy_unresolved"},
        content_type="application/json",
    )
    assert rejected.status_code == 200
    assert rejected.json()["status"] == ModerationStatus.REJECTED

    case.refresh_from_db()
    case.submission.refresh_from_db()
    assert case.submission.state == SubmissionState.REJECTED
    expected_expiry = before_rejection + timedelta(days=30)
    assert abs((case.submission.retention_expires_at - expected_expiry).total_seconds()) < 10

    event = case.events.order_by("-created_at").first()
    assert event.action == "rejected"
    assert event.reason_code == "privacy_unresolved"
    field_names = {field.name for field in ModerationEvent._meta.fields}
    assert "note" not in field_names
    assert "story_text" not in field_names


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("reason_code", "excluded"),
    [
        ("spam", True),
        ("out_of_scope", True),
        ("privacy_unresolved", False),
        ("harmful_or_graphic", False),
    ],
)
def test_moderation_rejection_separates_publication_from_analytics_eligibility(
    client,
    reason_code,
    excluded,
):
    created = client.post(
        reverse("submission-create"),
        data=public_payload(statistics_consent=True),
        content_type="application/json",
    )
    assert created.status_code == 201

    case = ModerationCase.objects.get()
    moderator = make_staff(f"moderator-{reason_code}", StaffRole.MODERATOR)
    client.force_login(moderator)
    claimed = client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    assert claimed.status_code == 200

    rejected = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "rejected", "reason_code": reason_code},
        content_type="application/json",
    )

    assert rejected.status_code == 200
    events = AnalyticsEligibilityEvent.objects.filter(source_submission_id=case.submission_id)
    assert events.exists() is excluded
    if excluded:
        assert events.latest("created_at").action == AnalyticsEligibilityAction.EXCLUDE


@pytest.mark.django_db
def test_approval_uses_latest_publication_consent(client):
    case = make_case()
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    client.post(
        reverse("moderation-draft-create", args=[case.id]),
        data={
            "redacted_text": "A broad synthetic account with identifying details removed.",
            "content_warnings": [],
        },
        content_type="application/json",
    )

    previous = ConsentRecord.objects.filter(
        submission=case.submission,
        purpose=ConsentPurpose.PUBLICATION,
    ).latest("recorded_at")
    ConsentRecord.objects.create(
        submission=case.submission,
        purpose=ConsentPurpose.PUBLICATION,
        granted=False,
        consent_text_version=previous.consent_text_version,
        supersedes=previous,
    )

    response = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "approved"},
        content_type="application/json",
    )

    assert response.status_code == 400
    case.refresh_from_db()
    assert case.status == ModerationStatus.IN_REVIEW


@pytest.mark.django_db
def test_privacy_detector_failure_blocks_approval(client, monkeypatch):
    case = make_case()
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    client.post(
        reverse("moderation-draft-create", args=[case.id]),
        data={
            "redacted_text": "A broad synthetic account with identifying details removed.",
            "content_warnings": [],
        },
        content_type="application/json",
    )

    def explode(_text):
        raise RuntimeError("synthetic detector failure")

    monkeypatch.setattr("moderation.services.detect_identifying_details", explode)

    response = client.post(
        reverse("moderation-decision", args=[case.id]),
        data={"decision": "approved"},
        content_type="application/json",
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Privacy validation could not be completed."
    case.refresh_from_db()
    assert case.status == ModerationStatus.IN_REVIEW


@pytest.mark.django_db
def test_full_submission_delete_cascades_versioned_private_evidence(client):
    case = make_case("Contact survivor@example.test if needed.")
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    client.force_login(moderator)

    previous_consent = ConsentRecord.objects.get(
        submission=case.submission,
        purpose=ConsentPurpose.PUBLICATION,
    )
    ConsentRecord.objects.create(
        submission=case.submission,
        purpose=ConsentPurpose.PUBLICATION,
        granted=True,
        consent_text_version=previous_consent.consent_text_version,
        supersedes=previous_consent,
    )

    first_screening = case.submission.privacy_screenings.latest("created_at")
    second_screening = run_privacy_screening(case.submission)
    assert second_screening.supersedes == first_screening

    client.post(
        reverse("moderation-claim", args=[case.id]),
        data={},
        content_type="application/json",
    )
    client.post(
        reverse("moderation-draft-create", args=[case.id]),
        data={"redacted_text": "First private redaction draft.", "content_warnings": []},
        content_type="application/json",
    )
    client.post(
        reverse("moderation-draft-create", args=[case.id]),
        data={"redacted_text": "Second private redaction draft.", "content_warnings": []},
        content_type="application/json",
    )

    submission_id = case.submission_id
    case.submission.delete()

    assert not RawSubmission.objects.filter(pk=submission_id).exists()
    assert ConsentRecord.objects.filter(submission_id=submission_id).count() == 0
    assert PrivacyScreening.objects.filter(submission_id=submission_id).count() == 0
    assert PrivacyFinding.objects.filter(screening__submission_id=submission_id).count() == 0
    assert ModerationCase.objects.filter(submission_id=submission_id).count() == 0
    assert RedactionDraft.objects.filter(case__submission_id=submission_id).count() == 0
    assert ModerationEvent.objects.filter(case__submission_id=submission_id).count() == 0
