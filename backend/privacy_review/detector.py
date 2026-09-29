from __future__ import annotations

import re
from dataclasses import dataclass
from enum import StrEnum


class FindingCategory(StrEnum):
    EMAIL = "email"
    PHONE = "phone"
    URL = "url"
    SOCIAL_HANDLE = "social_handle"
    PRECISE_DATE = "precise_date"
    STREET_ADDRESS = "street_address"
    EXPLICIT_NAME = "explicit_name"


@dataclass(frozen=True, slots=True)
class DetectedFinding:
    category: FindingCategory
    rule_id: str
    start_offset: int
    end_offset: int


@dataclass(frozen=True, slots=True)
class DetectionRule:
    category: FindingCategory
    rule_id: str
    pattern: re.Pattern[str]


# Conservative local heuristics. They are intentionally assistive, not proof
# that text is safe. Human review remains the publication boundary.
_RULES = (
    DetectionRule(
        FindingCategory.EMAIL,
        "email-v1",
        re.compile(r"(?<![\w.+-])[\w.+-]+@[\w-]+(?:\.[\w-]+)+(?![\w.-])", re.IGNORECASE),
    ),
    DetectionRule(
        FindingCategory.URL,
        "url-v1",
        re.compile(r"\b(?:https?://|www\.)[^\s<>]+", re.IGNORECASE),
    ),
    DetectionRule(
        FindingCategory.SOCIAL_HANDLE,
        "social-handle-v1",
        re.compile(r"(?<![\w@])@[A-Za-z0-9_][A-Za-z0-9_.]{1,29}\b"),
    ),
    DetectionRule(
        FindingCategory.PHONE,
        "phone-v1",
        re.compile(r"(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)"),
    ),
    DetectionRule(
        FindingCategory.PRECISE_DATE,
        "numeric-date-v1",
        re.compile(
            r"\b(?:"
            r"(?:19|20)\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])"
            r"|(?:0?[1-9]|[12]\d|3[01])[-/.](?:0?[1-9]|1[0-2])[-/.](?:19|20)\d{2}"
            r")\b"
        ),
    ),
    DetectionRule(
        FindingCategory.STREET_ADDRESS,
        "street-address-v1",
        re.compile(
            r"\b\d{1,6}\s+[\w.'’-]+(?:\s+[\w.'’-]+){0,4}\s+"
            r"(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|"
            r"marg|tole)\b",
            re.IGNORECASE,
        ),
    ),
    DetectionRule(
        FindingCategory.EXPLICIT_NAME,
        "explicit-name-v1",
        re.compile(
            r"\b(?:my name is|i am called|i['’]m called)\s+"
            r"[A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){0,2}\b",
            re.IGNORECASE,
        ),
    ),
)


def detect_identifying_details(text: str) -> list[DetectedFinding]:
    """
    Return only categories/rule IDs/offsets.

    Matched text is deliberately not copied into finding objects, logs, or the
    database. Overlapping findings are allowed because different rules can
    identify different risks in the same span.
    """
    findings: list[DetectedFinding] = []
    for rule in _RULES:
        for match in rule.pattern.finditer(text):
            findings.append(
                DetectedFinding(
                    category=rule.category,
                    rule_id=rule.rule_id,
                    start_offset=match.start(),
                    end_offset=match.end(),
                )
            )

    return sorted(
        findings,
        key=lambda item: (item.start_offset, item.end_offset, item.category, item.rule_id),
    )
