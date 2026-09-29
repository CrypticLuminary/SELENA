import json
import uuid
from datetime import timedelta

import pytest
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone

from analytics.models import (
    AnalyticsContribution,
    AnalyticsEligibilityAction,
    AnalyticsEligibilityEvent,
    AnalyticsEligibilityReason,
    AnalyticsSnapshot,
)
from analytics.services import generate_snapshot, restore_analytics_eligibility
from submissions.models import RawSubmission
from submissions.policy import (
    PRIVACY_POLICY_VERSION,
    SOURCE_FLOW_VERSION,
    STATISTICS_CONSENT_VERSION,
    SUBMISSION_SCHEMA_VERSION,
)


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
        "story_text": "A synthetic narrative for analytics integration testing.",
        "publication_choice": "public",
        "publication_consent": True,
        "statistics_consent": False,
    }
    payload.update(overrides)
    return payload


def make_contribution(
    *,
    age_group="21_24",
    setting="workplace",
    experience_types=None,
    relationship_categories=None,
    expires_at=None,
):
    return AnalyticsContribution.objects.create(
        source_submission_id=uuid.uuid4(),
        age_group=age_group,
        setting=setting,
        experience_types=experience_types or ["sexual_comments"],
        relationship_categories=relationship_categories or ["authority"],
        statistics_consent_record_id=uuid.uuid4(),
        consent_text_version=STATISTICS_CONSENT_VERSION,
        privacy_policy_version=PRIVACY_POLICY_VERSION,
        schema_version=SUBMISSION_SCHEMA_VERSION,
        source_flow_version=SOURCE_FLOW_VERSION,
        retention_expires_at=expires_at or timezone.now() + timedelta(days=730),
    )


def cell(distribution, category):
    return next(item for item in distribution["cells"] if item["category"] == category)


def numeric_values(value):
    if isinstance(value, dict):
        for nested in value.values():
            yield from numeric_values(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from numeric_values(nested)
    elif isinstance(value, int) and not isinstance(value, bool):
        yield value


@pytest.mark.django_db
def test_statistics_consent_creates_minimized_analytics_contribution(client, settings):
    settings.ANALYTICS_CONTRIBUTION_RETENTION_DAYS = 730
    before = timezone.now()

    response = client.post(
        reverse("submission-create"),
        data=public_payload(statistics_consent=True),
        content_type="application/json",
    )

    assert response.status_code == 201
    submission = RawSubmission.objects.get()
    contribution = AnalyticsContribution.objects.get()

    assert contribution.source_submission_id == submission.id
    assert contribution.age_group == "21_24"
    assert contribution.setting == "workplace"
    assert contribution.experience_types == [
        "sexual_comments",
        "pressure_coercion",
    ]
    assert contribution.relationship_categories == ["authority"]
    assert contribution.consent_text_version == STATISTICS_CONSENT_VERSION

    expected = before + timedelta(days=730)
    assert abs((contribution.retention_expires_at - expected).total_seconds()) < 10

    field_names = {field.name for field in AnalyticsContribution._meta.fields}
    assert "story_text" not in field_names
    assert "relationship_detail" not in field_names
    assert "frequency" not in field_names
    assert "periods" not in field_names
    assert "removal_code" not in field_names
    assert "verifier" not in field_names


@pytest.mark.django_db
def test_declined_statistics_consent_creates_no_analytics_contribution(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(statistics_consent=False),
        content_type="application/json",
    )

    assert response.status_code == 201
    assert AnalyticsContribution.objects.count() == 0


@pytest.mark.django_db
def test_statistics_only_path_creates_contribution_without_narrative(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(
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
        ),
        content_type="application/json",
    )

    assert response.status_code == 201
    assert RawSubmission.objects.get().story_text == ""
    assert AnalyticsContribution.objects.count() == 1


@pytest.mark.django_db
def test_analytics_contribution_survives_raw_retention_deletion(client):
    response = client.post(
        reverse("submission-create"),
        data=public_payload(statistics_consent=True),
        content_type="application/json",
    )
    assert response.status_code == 201

    submission = RawSubmission.objects.get()
    contribution_id = submission.id
    submission.delete()

    assert not RawSubmission.objects.filter(pk=contribution_id).exists()
    assert AnalyticsContribution.objects.filter(source_submission_id=contribution_id).exists()


@pytest.mark.django_db
def test_analytics_contribution_is_immutable_but_expiry_purge_deletes():
    contribution = make_contribution()

    contribution.setting = "home"
    with pytest.raises(ValidationError):
        contribution.save()

    with pytest.raises(ValidationError):
        AnalyticsContribution.objects.update(setting="home")

    expired = make_contribution(expires_at=timezone.now() - timedelta(seconds=1))
    active_id = contribution.source_submission_id
    expired_id = expired.source_submission_id

    call_command("purge_expired_analytics_contributions")

    assert AnalyticsContribution.objects.filter(source_submission_id=active_id).exists()
    assert not AnalyticsContribution.objects.filter(source_submission_id=expired_id).exists()


@pytest.mark.django_db
def test_excluded_contribution_is_removed_from_future_snapshots():
    contributions = [make_contribution() for _ in range(10)]
    target = contributions[0]

    AnalyticsEligibilityEvent.objects.create(
        source_submission_id=target.source_submission_id,
        action=AnalyticsEligibilityAction.EXCLUDE,
        reason_code=AnalyticsEligibilityReason.SPAM,
    )

    snapshot = generate_snapshot()
    authority = cell(snapshot.payload["distributions"]["relationship"], "authority")

    assert authority == {"category": "authority", "display": False}
    assert snapshot.total_band == ""


@pytest.mark.django_db
def test_latest_restore_event_reenables_future_snapshot_eligibility():
    contributions = [make_contribution() for _ in range(10)]
    target = contributions[0]
    AnalyticsEligibilityEvent.objects.create(
        source_submission_id=target.source_submission_id,
        action=AnalyticsEligibilityAction.EXCLUDE,
        reason_code=AnalyticsEligibilityReason.SPAM,
    )

    restore_analytics_eligibility(target.source_submission_id, actor=None)
    snapshot = generate_snapshot()
    authority = cell(snapshot.payload["distributions"]["relationship"], "authority")

    assert authority["display"] is True
    assert authority["count_band"] == "10–19"


@pytest.mark.django_db
def test_analytics_eligibility_events_are_append_only():
    contribution = make_contribution()
    event = AnalyticsEligibilityEvent.objects.create(
        source_submission_id=contribution.source_submission_id,
        action=AnalyticsEligibilityAction.EXCLUDE,
        reason_code=AnalyticsEligibilityReason.OUT_OF_SCOPE,
    )

    event.reason_code = AnalyticsEligibilityReason.SPAM
    with pytest.raises(ValidationError):
        event.save()

    with pytest.raises(ValidationError):
        AnalyticsEligibilityEvent.objects.update(reason_code=AnalyticsEligibilityReason.SPAM)

    with pytest.raises(ValidationError):
        AnalyticsEligibilityEvent.objects.all().delete()


@pytest.mark.django_db
def test_general_single_dimension_threshold_is_ten():
    for _ in range(9):
        make_contribution()

    first = generate_snapshot()
    authority = cell(first.payload["distributions"]["relationship"], "authority")
    assert authority == {"category": "authority", "display": False}
    assert first.total_band == ""

    make_contribution()
    second = generate_snapshot()
    authority = cell(second.payload["distributions"]["relationship"], "authority")
    assert authority["display"] is True
    assert authority["count_band"] == "10–19"
    assert second.total_band == "10–19"


@pytest.mark.django_db
def test_minor_age_threshold_is_twenty():
    for _ in range(19):
        make_contribution(age_group="13_15", relationship_categories=[])

    first = generate_snapshot()
    minor = cell(first.payload["distributions"]["age"], "13_15")
    assert minor == {"category": "13_15", "display": False}

    make_contribution(age_group="13_15", relationship_categories=[])
    second = generate_snapshot()
    minor = cell(second.payload["distributions"]["age"], "13_15")
    assert minor["display"] is True
    assert minor["count_band"] == "20–49"


@pytest.mark.django_db
def test_every_two_dimension_cell_uses_stricter_twenty_threshold():
    for _ in range(19):
        make_contribution(
            setting="workplace",
            relationship_categories=["authority"],
        )

    first = generate_snapshot()
    single = cell(first.payload["distributions"]["relationship"], "authority")
    assert single["display"] is True
    assert single["count_band"] == "10–19"

    cross = first.payload["cross"]["authority"]["setting"]
    assert cross["group_band"] is None
    assert cross["unavailable"] is True
    assert cell(cross["distribution"], "workplace")["display"] is False

    make_contribution(
        setting="workplace",
        relationship_categories=["authority"],
    )
    second = generate_snapshot()
    cross = second.payload["cross"]["authority"]["setting"]
    assert cross["group_band"] == "20–49"
    assert cross["unavailable"] is False
    assert cell(cross["distribution"], "workplace")["count_band"] == "20–49"


@pytest.mark.django_db
def test_snapshot_persists_only_bands_suppression_and_relative_scales():
    for _ in range(20):
        make_contribution()

    snapshot = generate_snapshot()
    serialized = json.dumps(snapshot.payload)

    assert "exact_count" not in serialized
    assert "total_count" not in serialized
    assert not hasattr(snapshot, "exact_count")
    assert not hasattr(snapshot, "total_count")
    assert all(1 <= number <= 7 for number in numeric_values(snapshot.payload))


@pytest.mark.django_db
def test_public_snapshot_is_frozen_until_explicit_regeneration(client):
    for _ in range(10):
        make_contribution()

    generate_snapshot()
    first = client.get(reverse("pattern-snapshot"))
    assert first.status_code == 200

    for _ in range(20):
        make_contribution(setting="home")

    second = client.get(reverse("pattern-snapshot"))
    assert second.status_code == 200
    assert second.json() == first.json()


@pytest.mark.django_db
def test_patterns_api_exposes_bands_never_exact_counts(client):
    for _ in range(20):
        make_contribution()

    generate_snapshot()
    response = client.get(reverse("pattern-snapshot"))

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {
        "dataset_version",
        "privacy_policy_version",
        "generated_label",
        "total_band",
        "distributions",
    }
    assert body["total_band"] == "20–49"
    assert "exact_count" not in json.dumps(body)
    assert "total_count" not in json.dumps(body)
    assert all(1 <= number <= 7 for number in numeric_values(body))
    assert response["Cache-Control"] == "no-store"
    assert response["X-Robots-Tag"] == "noindex"


@pytest.mark.django_db
def test_patterns_api_fails_closed_before_first_snapshot(client):
    response = client.get(reverse("pattern-snapshot"))

    assert response.status_code == 503
    assert response.json() == {"detail": "Patterns are not available yet."}


@pytest.mark.django_db
def test_patterns_api_does_not_serve_snapshot_from_old_privacy_policy(client):
    for _ in range(20):
        make_contribution()

    current = generate_snapshot()
    AnalyticsSnapshot.objects.create(
        dataset_version="snapshot-old-policy-newer-row",
        privacy_policy_version="privacy-policy-retired",
        generated_label="Snapshot generated under a retired policy",
        total_band="1,000+",
        payload={
            "distributions": {},
            "cross": {},
            "comparable_relationships": [],
        },
    )

    response = client.get(reverse("pattern-snapshot"))

    assert response.status_code == 200
    assert response.json()["dataset_version"] == current.dataset_version
    assert response.json()["privacy_policy_version"] == PRIVACY_POLICY_VERSION


@pytest.mark.django_db
def test_cross_api_rejects_unapproved_dimensions_and_unknown_parameters(client):
    for _ in range(20):
        make_contribution()
    generate_snapshot()

    invalid_primary = client.get(
        reverse("pattern-cross"),
        {"primary": "age", "secondary": "setting", "category": "authority"},
    )
    geography = client.get(
        reverse("pattern-cross"),
        {
            "primary": "relationship",
            "secondary": "geography",
            "category": "authority",
        },
    )
    third_dimension = client.get(
        reverse("pattern-cross"),
        {
            "primary": "relationship",
            "secondary": "age",
            "category": "authority",
            "third": "setting",
        },
    )

    assert invalid_primary.status_code == 400
    assert geography.status_code == 400
    assert third_dimension.status_code == 400


@pytest.mark.django_db
def test_comparable_relationships_only_include_safe_cross_groups(client):
    for _ in range(20):
        make_contribution(relationship_categories=["authority"])
    for _ in range(19):
        make_contribution(relationship_categories=["partner"])

    generate_snapshot()
    response = client.get(reverse("pattern-comparable-relationships"))

    assert response.status_code == 200
    assert response.json() == {
        "dataset_version": AnalyticsSnapshot.objects.latest("created_at").dataset_version,
        "privacy_policy_version": PRIVACY_POLICY_VERSION,
        "values": ["authority"],
    }


@pytest.mark.django_db
def test_expired_contributions_are_excluded_from_new_snapshots():
    for _ in range(20):
        make_contribution(expires_at=timezone.now() - timedelta(seconds=1))

    snapshot = generate_snapshot()

    assert snapshot.total_band == ""
    assert all(
        not item["display"]
        for distribution in snapshot.payload["distributions"].values()
        for item in distribution["cells"]
    )


@pytest.mark.django_db
def test_analytics_snapshot_is_append_only():
    for _ in range(10):
        make_contribution()
    snapshot = generate_snapshot()

    snapshot.generated_label = "tampered"
    with pytest.raises(ValidationError):
        snapshot.save()

    with pytest.raises(ValidationError):
        AnalyticsSnapshot.objects.update(generated_label="tampered")
