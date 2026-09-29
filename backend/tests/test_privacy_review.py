import logging

import pytest

from privacy_review.detector import FindingCategory, detect_identifying_details
from privacy_review.models import PrivacyFinding, PrivacyScreening, ScreeningStatus
from privacy_review.services import run_privacy_screening
from submissions.models import PublicationChoice, RawSubmission


def categories(text: str) -> set[FindingCategory]:
    return {finding.category for finding in detect_identifying_details(text)}


def test_local_detector_flags_common_identifying_details_without_copying_text():
    text = (
        "My name is Test Person. Email me at survivor@example.test or call +977 9812345678. "
        "I wrote this on 2026-09-28 and lived at 123 Example Road. "
        "Profile: @example_handle https://example.test/me"
    )

    findings = detect_identifying_details(text)
    found = {finding.category for finding in findings}

    assert FindingCategory.EXPLICIT_NAME in found
    assert FindingCategory.EMAIL in found
    assert FindingCategory.PHONE in found
    assert FindingCategory.PRECISE_DATE in found
    assert FindingCategory.STREET_ADDRESS in found
    assert FindingCategory.SOCIAL_HANDLE in found
    assert FindingCategory.URL in found

    assert all(not hasattr(finding, "matched_text") for finding in findings)


def test_detector_does_not_treat_broad_safe_context_as_identifier():
    assert (
        detect_identifying_details(
            "This happened at school when I was 16–17. I prefer not to name anyone."
        )
        == []
    )


@pytest.mark.django_db
def test_screening_persists_only_metadata_and_never_marks_content_publishable():
    submission = RawSubmission.objects.create(
        age_group="21_24",
        setting="workplace",
        experience_types=["sexual_comments"],
        story_text="Contact survivor@example.test if needed.",
        publication_choice=PublicationChoice.PUBLIC,
        retention_expires_at="2026-12-27T00:00:00Z",
    )

    screening = run_privacy_screening(submission)

    assert screening.status == ScreeningStatus.FLAGS_FOUND
    assert screening.finding_count >= 1
    finding = screening.findings.get(category="email")
    assert finding.start_offset < finding.end_offset

    field_names = {field.name for field in PrivacyFinding._meta.fields}
    assert "matched_text" not in field_names
    assert "snippet" not in field_names


@pytest.mark.django_db
def test_no_automated_flags_is_not_a_publication_state():
    submission = RawSubmission.objects.create(
        age_group="21_24",
        setting="workplace",
        experience_types=["sexual_comments"],
        story_text="A broad narrative with no explicit contact details.",
        publication_choice=PublicationChoice.PUBLIC,
        retention_expires_at="2026-12-27T00:00:00Z",
    )

    screening = run_privacy_screening(submission)

    assert screening.status == ScreeningStatus.NO_AUTOMATED_FLAGS
    assert not hasattr(screening, "approved")
    assert not hasattr(screening, "publishable")


@pytest.mark.django_db
def test_new_screening_supersedes_previous_run():
    submission = RawSubmission.objects.create(
        age_group="21_24",
        setting="workplace",
        experience_types=["sexual_comments"],
        story_text="No explicit contact detail.",
        publication_choice=PublicationChoice.PUBLIC,
        retention_expires_at="2026-12-27T00:00:00Z",
    )

    first = run_privacy_screening(submission)
    second = run_privacy_screening(submission)

    assert second.supersedes == first
    assert PrivacyScreening.objects.filter(submission=submission).count() == 2


@pytest.mark.django_db
def test_screening_error_log_does_not_include_raw_text(monkeypatch, caplog):
    secret_text = "private narrative SHOULD_NEVER_APPEAR_IN_LOGS"
    submission = RawSubmission.objects.create(
        age_group="21_24",
        setting="workplace",
        experience_types=["sexual_comments"],
        story_text=secret_text,
        publication_choice=PublicationChoice.PUBLIC,
        retention_expires_at="2026-12-27T00:00:00Z",
    )

    def explode(_text):
        raise RuntimeError(f"detector failed while processing {secret_text}")

    monkeypatch.setattr("privacy_review.services.detect_identifying_details", explode)

    with caplog.at_level(logging.ERROR):
        screening = run_privacy_screening(submission)

    assert screening.status == ScreeningStatus.ERROR
    assert secret_text not in caplog.text
    assert "RuntimeError" in caplog.text
