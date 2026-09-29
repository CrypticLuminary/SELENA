from datetime import timedelta
from uuid import UUID

import pytest
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import Permission
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from moderation.models import ModerationStatus
from moderation.services import claim_case, create_redaction_draft, decide_case
from public_stories.exceptions import PublicationWorkflowError
from public_stories.models import (
    PublicationRecord,
    PublicRemovalCredential,
    PublicStory,
    StoryReport,
)
from public_stories.services import publish_case
from public_stories.throttles import StoryReportAnonThrottle
from staff_accounts.capabilities import StaffCapability, apply_role_template
from staff_accounts.models import StaffRole, StaffUser
from submissions.models import (
    ConsentPurpose,
    ConsentRecord,
    PublicationChoice,
    RawSubmission,
    RemovalCredential,
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


def make_approved_case(
    moderator: StaffUser,
    *,
    raw_text: str = "Raw private source text that must never be published directly.",
    redacted_text: str = "A privacy-reviewed public version of the experience.",
):
    submission = RawSubmission.objects.create(
        age_group="21_24",
        setting="workplace",
        experience_types=["sexual_comments", "pressure_coercion"],
        people_involved=[
            {
                "relationship_category": "authority",
                "relationship_detail": "employer_supervisor",
                "involvement": "primary",
                "age_band": "35_44",
            }
        ],
        story_text=raw_text,
        publication_choice=PublicationChoice.PUBLIC,
        retention_expires_at=timezone.now() + timedelta(days=90),
    )
    ConsentRecord.objects.create(
        submission=submission,
        purpose=ConsentPurpose.PUBLICATION,
        granted=True,
        consent_text_version=PUBLICATION_CONSENT_VERSION,
    )
    RemovalCredential.objects.create(
        submission=submission,
        verifier=make_password("SELENA-TEST-REMOVAL-CODE"),
    )

    from moderation.services import ensure_moderation_case

    case = ensure_moderation_case(submission)
    claim_case(case.id, moderator)
    create_redaction_draft(
        case.id,
        moderator,
        redacted_text=redacted_text,
        content_warnings=["harassment"],
    )
    decide_case(case.id, moderator, decision="approved")
    case.refresh_from_db()
    assert case.status == ModerationStatus.APPROVED
    return case


def publication_payload(**overrides):
    payload = {
        "age_group": "21_24",
        "relationship": "authority",
        "setting": "workplace",
        "experience_types": ["sexual_comments"],
        "excerpt": "A short privacy-reviewed excerpt.",
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
def test_publication_is_disabled_by_default(client):
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert "disabled" in response.json()["detail"].lower()
    assert PublicStory.objects.count() == 0


@pytest.mark.django_db
def test_single_moderator_publication_copies_only_approved_public_projection(
    client,
    settings,
):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    settings.PUBLISHED_RAW_RETENTION_DAYS = 30

    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(
        moderator,
        raw_text="PRIVATE RAW TEXT MUST NOT LEAK",
        redacted_text="A privacy-reviewed public account.",
    )
    client.force_login(moderator)
    before = timezone.now()

    published = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )

    assert published.status_code == 201
    story = PublicStory.objects.get()
    record = PublicationRecord.objects.get(public_story_id=story.id)
    consent = ConsentRecord.objects.filter(
        submission=case.submission,
        purpose=ConsentPurpose.PUBLICATION,
        granted=True,
    ).latest("recorded_at")

    assert story.content == "A privacy-reviewed public account."
    assert "PRIVATE RAW TEXT" not in story.content
    assert story.relationship == "authority"
    assert story.age_group == "21_24"
    assert story.setting == "workplace"
    assert story.experience_types == ["sexual_comments"]
    assert story.warnings == ["harassment"]
    assert story.alias.startswith("Anonymous ")

    assert record.source_case_id == case.id
    assert record.source_submission_id == case.submission_id
    assert record.source_draft_version == 1
    assert record.publication_consent_record_id == consent.id
    assert record.publication_consent_text_version == consent.consent_text_version
    assert record.publication_consent_privacy_policy_version == consent.privacy_policy_version
    assert record.publication_consent_schema_version == consent.schema_version
    assert record.publication_consent_source_flow_version == consent.source_flow_version
    assert record.publication_consent_recorded_at == consent.recorded_at
    assert record.moderation_approved_by == moderator
    assert record.published_by == moderator
    assert record.control_mode == "single_moderator"

    case.submission.refresh_from_db()
    expected = before + timedelta(days=30)
    assert abs((case.submission.retention_expires_at - expected).total_seconds()) < 10


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("age_group", "30_39"),
        ("relationship", "partner"),
        ("setting", "home"),
        ("experience_types", ["stalking"]),
    ],
)
def test_publication_cannot_enrich_or_invent_structured_metadata(
    client,
    settings,
    field,
    value,
):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff(f"moderator-{field}", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(**{field: value}),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert PublicStory.objects.count() == 0
    assert PublicationRecord.objects.count() == 0


@pytest.mark.django_db
def test_publication_can_withhold_structured_metadata_without_rewriting_survivor_choice(
    client,
    settings,
):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(
            age_group="withheld",
            relationship="withheld",
            setting="withheld",
            experience_types=["withheld"],
        ),
        content_type="application/json",
    )

    assert response.status_code == 201
    story = PublicStory.objects.get()
    assert story.age_group == "withheld"
    assert story.relationship == "withheld"
    assert story.setting == "withheld"
    assert story.experience_types == ["withheld"]


@pytest.mark.django_db
def test_publication_cannot_use_prefer_not_as_moderator_suppression(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator-prefer-not", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(
            age_group="prefer_not",
            relationship="prefer_not",
            setting="prefer_not",
            experience_types=["prefer_not"],
        ),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert PublicStory.objects.count() == 0


@pytest.mark.django_db
def test_detailed_relationship_values_are_not_accepted_for_publication(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(relationship="employer"),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert PublicStory.objects.count() == 0


@pytest.mark.django_db
def test_public_story_api_exposes_no_private_provenance_or_exact_date(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    created = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )
    story_id = created.json()["id"]
    client.logout()

    listing = client.get(reverse("public-story-list"))
    detail = client.get(reverse("public-story-detail", args=[story_id]))

    assert listing.status_code == 200
    assert detail.status_code == 200

    listing_body = listing.json()
    assert set(listing_body) == {"next_cursor", "results"}
    assert listing_body["next_cursor"] is None
    assert len(listing_body["results"]) == 1

    listed = listing_body["results"][0]
    assert "content" not in listed
    assert "age_group" not in listed
    assert "relationship" not in listed
    assert "setting" not in listed
    assert "experience_types" not in listed
    assert "published_at" not in listed
    assert "source_case_id" not in listed
    assert "source_submission_id" not in listed
    assert "published_by" not in listed
    assert listed["published_label"].startswith("Shared in ")

    detailed = detail.json()
    assert detailed["content"] == "A privacy-reviewed public version of the experience."
    assert "published_at" not in detailed
    assert "source_case_id" not in detailed
    assert "source_submission_id" not in detailed
    assert "source_draft_id" not in detailed
    assert "moderation_approved_by" not in detailed
    assert detail["Cache-Control"] == "no-store"
    assert detail["X-Robots-Tag"] == "noindex"


@pytest.mark.django_db
def test_public_archive_cursor_is_opaque_story_uuid_not_timestamp(client):
    for index in range(21):
        PublicStory.objects.create(
            alias=f"Anonymous Story {index}",
            age_group="21_24",
            relationship="authority",
            setting="workplace",
            experience_types=["sexual_comments"],
            warnings=[],
            excerpt=f"Excerpt {index}.",
            content=f"Content {index}.",
        )

    first_page = client.get(reverse("public-story-list"))

    assert first_page.status_code == 200
    body = first_page.json()
    assert len(body["results"]) == 20
    assert UUID(body["next_cursor"])

    second_page = client.get(
        reverse("public-story-list"),
        {"cursor": body["next_cursor"]},
    )
    assert second_page.status_code == 200
    assert len(second_page.json()["results"]) == 1
    assert second_page.json()["next_cursor"] is None


@pytest.mark.django_db
def test_public_archive_rejects_malformed_cursor_at_api_boundary(client):
    response = client.get(reverse("public-story-list"), {"cursor": "not-a-uuid"})

    assert response.status_code == 400
    assert "cursor" in response.json()


@pytest.mark.django_db
def test_dual_control_requires_different_senior_moderator(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "dual_control"

    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    senior = make_staff("senior1", StaffRole.SENIOR_MODERATOR)
    case = make_approved_case(moderator)

    client.force_login(moderator)
    denied_role = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )
    assert denied_role.status_code == 400

    client.force_login(senior)
    published = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )
    assert published.status_code == 201
    record = PublicationRecord.objects.get()
    assert record.moderation_approved_by == moderator
    assert record.published_by == senior


@pytest.mark.django_db
def test_dual_control_service_requires_base_publish_capability(settings):
    settings.PUBLICATION_CONTROL_MODE = "dual_control"

    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    misconfigured = StaffUser.objects.create_user(
        username="dual-only",
        email="dual-only@example.test",
        password="A-long-test-password-123!",
        role=StaffRole.SENIOR_MODERATOR,
        is_staff=True,
    )
    dual_permission = Permission.objects.get(
        content_type__app_label="staff_accounts",
        content_type__model="staffuser",
        codename=StaffCapability.PUBLISH_STORY_DUAL_CONTROL,
    )
    misconfigured.user_permissions.add(dual_permission)

    with pytest.raises(PublicationWorkflowError, match="publication permission"):
        publish_case(
            case.id,
            misconfigured,
            **publication_payload(),
        )

    assert PublicStory.objects.count() == 0


@pytest.mark.django_db
def test_dual_control_rejects_same_senior_as_approver(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "dual_control"
    senior = make_staff("senior1", StaffRole.SENIOR_MODERATOR)
    case = make_approved_case(senior)
    client.force_login(senior)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert "different staff member" in response.json()["detail"].lower()
    assert PublicStory.objects.count() == 0


@pytest.mark.django_db
def test_latest_consent_withdrawal_blocks_publication(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)

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

    client.force_login(moderator)
    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert PublicStory.objects.count() == 0


@pytest.mark.django_db
def test_publication_rechecks_excerpt_privacy(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(
            excerpt="Contact survivor@example.test for details.",
        ),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert PublicStory.objects.count() == 0


@pytest.mark.django_db
def test_publication_is_idempotent(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)
    payload = publication_payload()

    first = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=payload,
        content_type="application/json",
    )
    second = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=payload,
        content_type="application/json",
    )

    assert first.status_code == 201
    assert second.status_code == 200
    assert second.json()["id"] == first.json()["id"]
    assert PublicStory.objects.count() == 1
    assert PublicationRecord.objects.count() == 1


@pytest.mark.django_db
def test_publication_provenance_is_append_only_and_survives_story_deletion(
    client,
    settings,
):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    client.force_login(moderator)

    created = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )
    story = PublicStory.objects.get(pk=created.json()["id"])
    record = PublicationRecord.objects.get(public_story_id=story.id)

    record.control_mode = "tampered"
    with pytest.raises(ValidationError):
        record.save()
    with pytest.raises(ValidationError):
        PublicationRecord.objects.update(control_mode="tampered")
    with pytest.raises(ValidationError):
        record.delete()
    with pytest.raises(ValidationError):
        PublicationRecord.objects.all().delete()

    story_id = story.id
    story.delete()

    assert PublicationRecord.objects.filter(public_story_id=story_id).exists()
    republish = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )
    assert republish.status_code == 400
    assert "removed" in republish.json()["detail"].lower()


@pytest.mark.django_db
def test_private_retention_delete_does_not_delete_public_story(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    submission_id = case.submission_id
    client.force_login(moderator)

    created = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )
    story_id = created.json()["id"]
    durable_credential = PublicRemovalCredential.objects.get(story_id=story_id)
    record = PublicationRecord.objects.get(public_story_id=story_id)
    consent_id = record.publication_consent_record_id
    consent_version = record.publication_consent_text_version
    assert "SELENA-TEST-REMOVAL-CODE" not in durable_credential.verifier
    assert check_password(
        "SELENA-TEST-REMOVAL-CODE",
        durable_credential.verifier,
    )

    case.submission.delete()

    assert not RawSubmission.objects.filter(pk=submission_id).exists()
    assert not ConsentRecord.objects.filter(submission_id=submission_id).exists()
    assert PublicStory.objects.filter(pk=story_id, is_active=True).exists()
    record.refresh_from_db()
    assert record.publication_consent_record_id == consent_id
    assert record.publication_consent_text_version == consent_version
    durable_credential.refresh_from_db()
    assert check_password(
        "SELENA-TEST-REMOVAL-CODE",
        durable_credential.verifier,
    )

    client.logout()
    assert client.get(reverse("public-story-detail", args=[story_id])).status_code == 200


@pytest.mark.django_db
def test_public_archive_does_not_offer_withheld_as_filter_value(client):
    response = client.get(reverse("public-story-list"), {"age_group": "withheld"})

    assert response.status_code == 400


@pytest.mark.django_db
def test_public_list_filters_and_hides_inactive_stories(client):
    visible = PublicStory.objects.create(
        alias="Anonymous Cedar",
        age_group="21_24",
        relationship="authority",
        setting="workplace",
        experience_types=["sexual_comments"],
        warnings=["harassment"],
        excerpt="Visible excerpt.",
        content="Visible content.",
    )
    PublicStory.objects.create(
        alias="Anonymous River",
        age_group="30_39",
        relationship="partner",
        setting="home",
        experience_types=["pressure_coercion"],
        warnings=[],
        excerpt="Other excerpt.",
        content="Other content.",
    )
    hidden = PublicStory.objects.create(
        alias="Anonymous Vale",
        age_group="21_24",
        relationship="authority",
        setting="workplace",
        experience_types=["sexual_comments"],
        warnings=[],
        excerpt="Hidden excerpt.",
        content="Hidden content.",
        is_active=False,
    )

    response = client.get(
        reverse("public-story-list"),
        {"relationship": "authority"},
    )

    assert response.status_code == 200
    ids = {item["id"] for item in response.json()["results"]}
    assert ids == {str(visible.id)}
    assert str(hidden.id) not in ids


@pytest.mark.django_db
def test_public_archive_rejects_multi_dimension_filtering(client):
    response = client.get(
        reverse("public-story-list"),
        {
            "relationship": "authority",
            "setting": "workplace",
        },
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_public_archive_rejects_unknown_filter_parameters(client):
    response = client.get(
        reverse("public-story-list"),
        {"relationship": "authority", "age_exact": "23"},
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_story_report_is_minimal_write_only_and_no_store(client):
    story = PublicStory.objects.create(
        alias="Anonymous Cedar",
        age_group="21_24",
        relationship="authority",
        setting="workplace",
        experience_types=["sexual_comments"],
        warnings=["harassment"],
        excerpt="Visible excerpt.",
        content="Visible content.",
    )

    response = client.post(
        reverse("public-story-report", args=[story.id]),
        data={"reason": "privacy_concern"},
        content_type="application/json",
    )

    assert response.status_code == 202
    assert response.json() == {"received": True}
    report = StoryReport.objects.get()
    assert report.reason == "privacy_concern"
    assert response["Cache-Control"] == "no-store"

    field_names = {field.name for field in StoryReport._meta.fields}
    assert "reporter_ip" not in field_names
    assert "reporter_email" not in field_names
    assert "free_text" not in field_names

    assert client.get(reverse("public-story-report", args=[story.id])).status_code == 405

    invalid = client.post(
        reverse("public-story-report", args=[story.id]),
        data={"reason": "privacy_concern", "details": "do not collect me"},
        content_type="application/json",
    )
    assert invalid.status_code == 400


def test_story_report_throttle_key_does_not_contain_raw_ip():
    request = APIRequestFactory().post("/api/stories/example/reports/", {}, format="json")
    request.META["REMOTE_ADDR"] = "203.0.113.77"

    key = StoryReportAnonThrottle().get_cache_key(request, None)

    assert key is not None
    assert "203.0.113.77" not in key


@pytest.mark.django_db
def test_publication_blocks_if_removal_verifier_is_missing(client, settings):
    settings.PUBLICATION_CONTROL_MODE = "single_moderator"
    moderator = make_staff("moderator1", StaffRole.MODERATOR)
    case = make_approved_case(moderator)
    RemovalCredential.objects.filter(submission=case.submission).delete()
    client.force_login(moderator)

    response = client.post(
        reverse("publish-moderation-case", args=[case.id]),
        data=publication_payload(),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert "removal credential" in response.json()["detail"].lower()
    assert PublicStory.objects.count() == 0
    assert PublicRemovalCredential.objects.count() == 0
