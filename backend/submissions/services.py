from __future__ import annotations

import base64
import secrets
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone

from .models import (
    ConsentPurpose,
    ConsentRecord,
    PublicationChoice,
    RawSubmission,
    RemovalCredential,
)
from .policy import (
    PRIVACY_POLICY_VERSION,
    PUBLICATION_CONSENT_VERSION,
    SOURCE_FLOW_VERSION,
    STATISTICS_CONSENT_VERSION,
    SUBMISSION_SCHEMA_VERSION,
)


@dataclass(frozen=True)
class SubmissionReceipt:
    removal_code: str
    publication_choice: str


def generate_removal_code() -> str:
    """Generate a human-copyable ~160-bit code without embedding submission data."""
    encoded = base64.b32encode(secrets.token_bytes(20)).decode("ascii").rstrip("=")
    return "-".join(encoded[index : index + 4] for index in range(0, len(encoded), 4))


@transaction.atomic
def create_anonymous_submission(validated_data: dict) -> SubmissionReceipt:
    publication_consent = validated_data.pop("publication_consent")
    statistics_consent = validated_data.pop("statistics_consent")

    retention_days = (
        settings.STATISTICS_ONLY_RETENTION_DAYS
        if validated_data["publication_choice"] == PublicationChoice.STATISTICS_ONLY
        else settings.PENDING_SUBMISSION_RETENTION_DAYS
    )

    submission = RawSubmission.objects.create(
        **validated_data,
        schema_version=SUBMISSION_SCHEMA_VERSION,
        privacy_policy_version=PRIVACY_POLICY_VERSION,
        source_flow_version=SOURCE_FLOW_VERSION,
        retention_expires_at=timezone.now() + timedelta(days=retention_days),
    )

    ConsentRecord.objects.create(
        submission=submission,
        purpose=ConsentPurpose.PUBLICATION,
        granted=publication_consent,
        consent_text_version=PUBLICATION_CONSENT_VERSION,
    )
    ConsentRecord.objects.create(
        submission=submission,
        purpose=ConsentPurpose.STATISTICS,
        granted=statistics_consent,
        consent_text_version=STATISTICS_CONSENT_VERSION,
    )

    removal_code = generate_removal_code()
    RemovalCredential.objects.create(
        submission=submission,
        verifier=make_password(removal_code),
    )

    # Local privacy screening is assistive only. It cannot publish content.
    # Import locally to keep the submissions model layer independent.
    from privacy_review.services import run_privacy_screening

    run_privacy_screening(submission)

    return SubmissionReceipt(
        removal_code=removal_code,
        publication_choice=submission.publication_choice,
    )
