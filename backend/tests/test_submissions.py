from datetime import timedelta

import pytest
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import AnonymousUser
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from privacy_review.models import PrivacyScreening
from submissions.models import (
    ConsentPurpose,
    ConsentRecord,
    RawSubmission,
    SubmissionDeletionReason,
    SubmissionDeletionTombstone,
    SubmissionState,
)
from submissions.policy import (
    PUBLICATION_CONSENT_VERSION,
    STATISTICS_CONSENT_VERSION,
)
from submissions.throttles import SubmissionAnonThrottle


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    cache.clear()
    yield
    cache.clear()


def public_payload(**overrides):
    payload = {
        "age_group": "21_24",
        "setting": "workplace",
        "experience_types": ["sexual_comments", "pressure_coercion"],
        "people_involved": [
            {
                "relationship_category": "authority",
                "relationship_detail": "employer_supervisor",
                "involvement": "primary",
                "age_band": "35_44",
            }
        ],
        "frequency": "more_than_once",
        "periods": [{"start_age_band": "21_24", "end_age_band": "21_24"}],
        "story_text": "A synthetic test narrative with no real person's information.",
        "publication_choice": "public",
        "publication_consent": True,
        "statistics_consent": False,
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
def test_public_submission_is_write_only_and_returns_one_time_removal_code(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(),
        content_type="application/json",
    )

    assert response.status_code == 201
    body = response.json()
    assert body["received"] is True
    assert body["publication_choice"] == "public"
    assert body["removal_code"]
    assert "id" not in body
    assert "story_text" not in body
    assert "age_group" not in body
    assert response["Cache-Control"] == "no-store"
    assert response["Pragma"] == "no-cache"

    submission = RawSubmission.objects.get()
    credential = submission.removal_credential

    assert submission.state == SubmissionState.NEEDS_REVIEW
    assert submission.story_text.startswith("A synthetic test narrative")
    assert body["removal_code"] not in credential.verifier
    assert check_password(body["removal_code"], credential.verifier)
    assert PrivacyScreening.objects.filter(submission=submission).count() == 1


@pytest.mark.django_db
def test_submission_records_versioned_separate_consents(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(statistics_consent=True),
        content_type="application/json",
    )
    assert response.status_code == 201

    records = {record.purpose: record for record in ConsentRecord.objects.order_by("purpose")}
    assert records[ConsentPurpose.PUBLICATION].granted is True
    assert records[ConsentPurpose.PUBLICATION].consent_text_version == PUBLICATION_CONSENT_VERSION
    assert records[ConsentPurpose.STATISTICS].granted is True
    assert records[ConsentPurpose.STATISTICS].consent_text_version == STATISTICS_CONSENT_VERSION


@pytest.mark.django_db
def test_consent_record_cannot_be_mutated(client):
    client.post(
        reverse("submission-create"),
        data=public_payload(),
        content_type="application/json",
    )
    record = ConsentRecord.objects.first()
    record.granted = False

    with pytest.raises(ValidationError):
        record.save()


@pytest.mark.django_db
def test_consent_record_queryset_update_is_blocked(client):
    client.post(
        reverse("submission-create"),
        data=public_payload(),
        content_type="application/json",
    )

    with pytest.raises(ValidationError):
        ConsentRecord.objects.update(granted=False)


@pytest.mark.django_db
def test_statistics_only_requires_explicit_statistics_consent(client):
    payload = public_payload(
        publication_choice="statistics_only",
        publication_consent=False,
        statistics_consent=False,
        story_text="",
        people_involved=[],
        frequency="",
        periods=[],
    )

    response = client.post(
        reverse("submission-create"),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == 400
    assert RawSubmission.objects.count() == 0


@pytest.mark.django_db
def test_statistics_only_can_submit_only_approved_aggregate_fields(client):
    payload = public_payload(
        publication_choice="statistics_only",
        publication_consent=False,
        statistics_consent=True,
        story_text="",
        people_involved=[
            {
                "relationship_category": "authority",
                "relationship_detail": "",
                "involvement": "",
                "age_band": "",
            }
        ],
        frequency="",
        periods=[],
    )

    response = client.post(
        reverse("submission-create"),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == 201
    submission = RawSubmission.objects.get()
    assert submission.story_text == ""
    assert submission.frequency == ""
    assert submission.periods == []
    assert submission.people_involved == [
        {
            "relationship_category": "authority",
            "relationship_detail": "",
            "involvement": "",
            "age_band": "",
        }
    ]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "overrides",
    [
        {"frequency": "more_than_once"},
        {"periods": [{"start_age_band": "21_24", "end_age_band": "21_24"}]},
        {
            "people_involved": [
                {
                    "relationship_category": "authority",
                    "relationship_detail": "employer_supervisor",
                    "involvement": "",
                    "age_band": "",
                }
            ]
        },
        {
            "people_involved": [
                {
                    "relationship_category": "authority",
                    "relationship_detail": "",
                    "involvement": "primary",
                    "age_band": "",
                }
            ]
        },
        {
            "people_involved": [
                {
                    "relationship_category": "authority",
                    "relationship_detail": "",
                    "involvement": "",
                    "age_band": "35_44",
                }
            ]
        },
    ],
)
def test_statistics_only_rejects_fields_outside_approved_statistics_purpose(
    client,
    overrides,
):
    payload = public_payload(
        publication_choice="statistics_only",
        publication_consent=False,
        statistics_consent=True,
        story_text="",
        people_involved=[
            {
                "relationship_category": "authority",
                "relationship_detail": "",
                "involvement": "",
                "age_band": "",
            }
        ],
        frequency="",
        periods=[],
    )
    payload.update(overrides)

    response = client.post(
        reverse("submission-create"),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == 400
    assert RawSubmission.objects.count() == 0


@pytest.mark.django_db
def test_statistics_only_rejects_story_text_to_minimize_private_data(client):
    payload = public_payload(
        publication_choice="statistics_only",
        publication_consent=False,
        statistics_consent=True,
        story_text="This narrative must not be stored on the statistics-only path.",
        people_involved=[],
        frequency="",
        periods=[],
    )

    response = client.post(
        reverse("submission-create"),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == 400
    assert RawSubmission.objects.count() == 0


@pytest.mark.django_db
def test_public_path_requires_publication_consent_and_story(client):
    missing_consent = client.post(
        reverse("submission-create"),
        data=public_payload(publication_consent=False),
        content_type="application/json",
    )
    assert missing_consent.status_code == 400

    cache.clear()
    missing_story = client.post(
        reverse("submission-create"),
        data=public_payload(story_text=""),
        content_type="application/json",
    )
    assert missing_story.status_code == 400
    assert RawSubmission.objects.count() == 0


@pytest.mark.django_db
def test_unknown_identity_or_state_fields_are_rejected(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(name="Someone", state="published"),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert RawSubmission.objects.count() == 0


@pytest.mark.django_db
def test_invalid_or_mismatched_taxonomy_is_rejected(client):
    invalid_age = client.post(
        reverse("submission-create"),
        data=public_payload(age_group="23"),
        content_type="application/json",
    )
    assert invalid_age.status_code == 400

    cache.clear()
    mismatched_detail = client.post(
        reverse("submission-create"),
        data=public_payload(
            people_involved=[
                {
                    "relationship_category": "stranger",
                    "relationship_detail": "employer_supervisor",
                    "involvement": "primary",
                    "age_band": "35_44",
                }
            ]
        ),
        content_type="application/json",
    )
    assert mismatched_detail.status_code == 400
    assert RawSubmission.objects.count() == 0


@pytest.mark.django_db
def test_submission_endpoint_has_no_read_method_or_detail_route(client):
    create_url = reverse("submission-create")
    assert client.get(create_url).status_code == 405
    assert client.get(f"{create_url}00000000-0000-0000-0000-000000000000/").status_code == 404


@pytest.mark.django_db
def test_anonymous_submission_rate_limit(client):
    url = reverse("submission-create")

    for index in range(5):
        response = client.post(
            url,
            data=public_payload(story_text=f"Synthetic story {index}."),
            content_type="application/json",
        )
        assert response.status_code == 201

    blocked = client.post(
        url,
        data=public_payload(story_text="Synthetic story blocked by throttle."),
        content_type="application/json",
    )
    assert blocked.status_code == 429
    assert RawSubmission.objects.count() == 5


def test_submission_throttle_cache_key_does_not_contain_raw_ip():
    request = APIRequestFactory().post("/api/submissions/", {}, format="json")
    request.META["REMOTE_ADDR"] = "203.0.113.42"
    request.user = AnonymousUser()

    key = SubmissionAnonThrottle().get_cache_key(request, None)

    assert key is not None
    assert "203.0.113.42" not in key


@pytest.mark.django_db
def test_received_submission_has_configured_retention_deadline(client, settings):
    settings.PENDING_SUBMISSION_RETENTION_DAYS = 90
    before = timezone.now()

    response = client.post(
        reverse("submission-create"),
        data=public_payload(),
        content_type="application/json",
    )

    assert response.status_code == 201
    submission = RawSubmission.objects.get()
    expected = before + timedelta(days=90)
    assert abs((submission.retention_expires_at - expected).total_seconds()) < 10


@pytest.mark.django_db
def test_expired_received_submissions_can_be_purged(client, settings):
    settings.DELETION_TOMBSTONE_RETENTION_DAYS = 1095
    response = client.post(
        reverse("submission-create"),
        data=public_payload(),
        content_type="application/json",
    )
    assert response.status_code == 201

    RawSubmission.objects.update(retention_expires_at=timezone.now() - timedelta(seconds=1))
    call_command("purge_expired_submissions")

    assert RawSubmission.objects.count() == 0
    assert ConsentRecord.objects.count() == 0

    tombstone = SubmissionDeletionTombstone.objects.get()
    assert tombstone.reason == SubmissionDeletionReason.RETENTION_EXPIRED
    assert tombstone.submission_id
    assert tombstone.retention_expires_at > timezone.now() + timedelta(days=1094)


@pytest.mark.django_db
def test_expired_deletion_tombstones_can_be_purged():
    tombstone = SubmissionDeletionTombstone.objects.create(
        submission_id="00000000-0000-0000-0000-000000000001",
        reason=SubmissionDeletionReason.RETENTION_EXPIRED,
        retention_expires_at=timezone.now() - timedelta(seconds=1),
    )

    call_command("purge_expired_tombstones")

    assert not SubmissionDeletionTombstone.objects.filter(pk=tombstone.pk).exists()


@pytest.mark.django_db
def test_prefer_not_experience_cannot_be_combined_with_specific_values(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(experience_types=["prefer_not", "sexual_comments"]),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert RawSubmission.objects.count() == 0
