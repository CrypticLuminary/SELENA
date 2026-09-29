from __future__ import annotations

import logging

from django.db import transaction

from submissions.models import RawSubmission

from .detector import detect_identifying_details
from .models import PrivacyFinding, PrivacyScreening, ScreeningStatus

logger = logging.getLogger(__name__)

DETECTOR_VERSION = "local-rules-2026.1"


@transaction.atomic
def run_privacy_screening(submission: RawSubmission) -> PrivacyScreening:
    """
    Run local best-effort identification heuristics over the raw narrative.

    The detector result can only increase review attention; it never authorizes
    publication or bypasses human moderation.
    """
    previous = (
        PrivacyScreening.objects.filter(submission=submission).order_by("-created_at").first()
    )

    try:
        findings = detect_identifying_details(submission.story_text)
    except Exception as exc:
        # Opaque submission IDs are acceptable operational metadata; never log
        # the narrative or exception message because third-party/library error
        # messages may accidentally contain processed text.
        logger.error(
            "privacy_screening_failed submission_id=%s error_type=%s",
            submission.pk,
            type(exc).__name__,
        )
        return PrivacyScreening.objects.create(
            submission=submission,
            detector_version=DETECTOR_VERSION,
            status=ScreeningStatus.ERROR,
            finding_count=0,
            supersedes=previous,
        )

    status = ScreeningStatus.FLAGS_FOUND if findings else ScreeningStatus.NO_AUTOMATED_FLAGS
    screening = PrivacyScreening.objects.create(
        submission=submission,
        detector_version=DETECTOR_VERSION,
        status=status,
        finding_count=len(findings),
        supersedes=previous,
    )
    PrivacyFinding.objects.bulk_create(
        [
            PrivacyFinding(
                screening=screening,
                category=finding.category.value,
                rule_id=finding.rule_id,
                start_offset=finding.start_offset,
                end_offset=finding.end_offset,
            )
            for finding in findings
        ]
    )
    return screening
