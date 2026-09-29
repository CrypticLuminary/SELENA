from __future__ import annotations

import secrets
from collections import Counter
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from submissions.models import ConsentPurpose, ConsentRecord, RawSubmission
from submissions.policy import PRIVACY_POLICY_VERSION

from .models import AnalyticsContribution, AnalyticsSnapshot
from .policy import (
    AGE_ORDER,
    CROSS_GROUP_SIZE,
    CROSS_SECONDARIES,
    CROSS_TITLES,
    DISTRIBUTION_TITLES,
    EXPERIENCE_ORDER,
    MIN_GROUP_SIZE,
    RELATIONSHIP_ORDER,
    SENSITIVE_AGE_GROUPS,
    SENSITIVE_GROUP_SIZE,
    SETTING_ORDER,
    band_for_count,
    scale_for_band,
)


def _relationship_categories(submission: RawSubmission) -> list[str]:
    categories = {
        person.get("relationship_category")
        for person in submission.people_involved
        if isinstance(person, dict) and person.get("relationship_category") in RELATIONSHIP_ORDER
    }
    categories.discard(None)
    if len(categories) > 1:
        categories.discard("prefer_not")
    return sorted(categories)


def create_analytics_contribution(
    submission: RawSubmission,
    consent_record: ConsentRecord,
) -> AnalyticsContribution:
    if (
        consent_record.purpose != ConsentPurpose.STATISTICS
        or not consent_record.granted
        or consent_record.submission_id != submission.id
    ):
        raise ValueError("A granted statistics consent record is required.")

    return AnalyticsContribution.objects.create(
        source_submission_id=submission.id,
        age_group=submission.age_group,
        setting=submission.setting,
        experience_types=list(dict.fromkeys(submission.experience_types)),
        relationship_categories=_relationship_categories(submission),
        statistics_consent_record_id=consent_record.id,
        consent_text_version=consent_record.consent_text_version,
        privacy_policy_version=consent_record.privacy_policy_version,
        schema_version=consent_record.schema_version,
        source_flow_version=consent_record.source_flow_version,
        retention_expires_at=timezone.now()
        + timedelta(days=settings.ANALYTICS_CONTRIBUTION_RETENTION_DAYS),
    )


def _single_minimum(dimension: str, category: str) -> int:
    if dimension == "age" and category in SENSITIVE_AGE_GROUPS:
        return SENSITIVE_GROUP_SIZE
    return MIN_GROUP_SIZE


def _safe_cell(category: str, count: int, *, minimum: int) -> dict:
    band = band_for_count(count, minimum=minimum)
    if band is None:
        return {"category": category, "display": False}
    return {
        "category": category,
        "display": True,
        "count_band": band,
        "scale": scale_for_band(band),
    }


def _distribution(
    dimension: str,
    counter: Counter,
    categories: tuple[str, ...],
    *,
    cross: bool = False,
    overlapping: bool = False,
) -> dict:
    cells = []
    for category in categories:
        minimum = CROSS_GROUP_SIZE if cross else _single_minimum(dimension, category)
        cells.append(
            _safe_cell(
                category,
                counter.get(category, 0),
                minimum=minimum,
            )
        )
    return {
        "dimension": dimension,
        "title": (CROSS_TITLES[dimension] if cross else DISTRIBUTION_TITLES[dimension]),
        "cells": cells,
        "overlapping": overlapping,
    }


def _new_counters():
    singles = {
        "relationship": Counter(),
        "age": Counter(),
        "setting": Counter(),
        "experience": Counter(),
    }
    cross = {
        relationship: {secondary: Counter() for secondary in CROSS_SECONDARIES}
        for relationship in RELATIONSHIP_ORDER
    }
    return singles, cross


@transaction.atomic
def generate_snapshot() -> AnalyticsSnapshot:
    singles, cross = _new_counters()
    total_count = 0

    contributions = AnalyticsContribution.objects.filter(
        retention_expires_at__gt=timezone.now()
    ).iterator(chunk_size=1000)

    for contribution in contributions:
        total_count += 1

        if contribution.age_group in AGE_ORDER:
            singles["age"][contribution.age_group] += 1
        if contribution.setting in SETTING_ORDER:
            singles["setting"][contribution.setting] += 1

        experiences = {
            value for value in contribution.experience_types if value in EXPERIENCE_ORDER
        }
        relationships = {
            value for value in contribution.relationship_categories if value in RELATIONSHIP_ORDER
        }

        for experience in experiences:
            singles["experience"][experience] += 1
        for relationship in relationships:
            singles["relationship"][relationship] += 1
            if contribution.age_group in AGE_ORDER:
                cross[relationship]["age"][contribution.age_group] += 1
            if contribution.setting in SETTING_ORDER:
                cross[relationship]["setting"][contribution.setting] += 1
            for experience in experiences:
                cross[relationship]["experience"][experience] += 1

    distributions = {
        "relationship": _distribution(
            "relationship",
            singles["relationship"],
            RELATIONSHIP_ORDER,
            overlapping=True,
        ),
        "age": _distribution("age", singles["age"], AGE_ORDER),
        "setting": _distribution("setting", singles["setting"], SETTING_ORDER),
        "experience": _distribution(
            "experience",
            singles["experience"],
            EXPERIENCE_ORDER,
            overlapping=True,
        ),
    }

    cross_payload = {}
    comparable_relationships = []
    for relationship in RELATIONSHIP_ORDER:
        group_band = band_for_count(
            singles["relationship"].get(relationship, 0),
            minimum=CROSS_GROUP_SIZE,
        )
        relationship_cross = {}
        any_available = False

        for secondary in CROSS_SECONDARIES:
            categories = {
                "age": AGE_ORDER,
                "setting": SETTING_ORDER,
                "experience": EXPERIENCE_ORDER,
            }[secondary]
            distribution = _distribution(
                secondary,
                cross[relationship][secondary],
                categories,
                cross=True,
                overlapping=secondary == "experience",
            )
            available = group_band is not None and any(
                cell["display"] for cell in distribution["cells"]
            )
            any_available = any_available or available
            relationship_cross[secondary] = {
                "primary": "relationship",
                "secondary": secondary,
                "primary_category": relationship,
                "group_band": group_band,
                "distribution": distribution,
                "unavailable": not available,
            }

        if any_available:
            comparable_relationships.append(relationship)
        cross_payload[relationship] = relationship_cross

    now = timezone.now()
    dataset_version = f"snapshot-{now:%Y%m}-{secrets.token_hex(4)}"
    generated_label = f"Snapshot generated in {now:%B %Y}"

    return AnalyticsSnapshot.objects.create(
        dataset_version=dataset_version,
        privacy_policy_version=PRIVACY_POLICY_VERSION,
        generated_label=generated_label,
        total_band=band_for_count(total_count, minimum=MIN_GROUP_SIZE) or "",
        payload={
            "distributions": distributions,
            "cross": cross_payload,
            "comparable_relationships": comparable_relationships,
        },
    )


def latest_snapshot() -> AnalyticsSnapshot | None:
    # Fail closed across privacy-policy changes. A deployment that tightens the
    # public analytics policy must not keep serving a snapshot generated under
    # an older policy while a replacement snapshot is being produced.
    return (
        AnalyticsSnapshot.objects.filter(privacy_policy_version=PRIVACY_POLICY_VERSION)
        .order_by("-created_at")
        .first()
    )
