import logging

from core.logging import SensitiveDataFilter, redact_text


def test_redact_text_removes_sensitive_values():
    text = (
        "Authorization=secret-token story_text=private narrative "
        "removal_code=ABC-123 password=hunter2"
    )
    redacted = redact_text(text)

    assert "secret-token" not in redacted
    assert "private narrative" not in redacted
    assert "ABC-123" not in redacted
    assert "hunter2" not in redacted
    assert redacted.count("[REDACTED]") >= 4


def test_logging_filter_redacts_mapping_arguments():
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="payload %s",
        args={"story_text": "do not log", "event": "created"},
        exc_info=None,
    )

    SensitiveDataFilter().filter(record)

    assert record.args["story_text"] == "[REDACTED]"
    assert record.args["event"] == "created"
