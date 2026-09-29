from __future__ import annotations

import logging
import re

_SENSITIVE_KEYS = {
    "authorization",
    "cookie",
    "password",
    "removal_code",
    "removal_token",
    "story_text",
}

_KEY_PATTERN = re.compile(
    r"(?i)\b(authorization|cookie|password|removal[_ -]?(?:code|token)|story[_ -]?text)"
    r"\s*[:=]\s*"
)


def redact_text(value: str) -> str:
    """
    Best-effort redaction for accidental key/value logging.

    Once a sensitive key is seen, its value is removed through the next known
    sensitive key (or end of message). This intentionally prefers over-redaction
    to leaking survivor text.
    """
    matches = list(_KEY_PATTERN.finditer(value))
    if not matches:
        return value

    parts: list[str] = []
    cursor = 0
    for index, match in enumerate(matches):
        parts.append(value[cursor : match.end()])
        parts.append("[REDACTED]")
        cursor = matches[index + 1].start() if index + 1 < len(matches) else len(value)
    return "".join(parts)


class SensitiveDataFilter(logging.Filter):
    """Defense in depth; callers must still avoid logging sensitive payloads."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = redact_text(str(record.msg))
        if record.args:
            if isinstance(record.args, dict):
                record.args = {
                    key: "[REDACTED]" if str(key).lower() in _SENSITIVE_KEYS else value
                    for key, value in record.args.items()
                }
            else:
                record.args = tuple(redact_text(str(value)) for value in record.args)
        return True
