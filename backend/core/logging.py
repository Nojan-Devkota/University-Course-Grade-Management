import logging
import re
from typing import Any

# Patterns that may indicate PII in log messages.
_PII_PATTERNS = (
    re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"),
    re.compile(r"\bAO\d{7}\b"),
    re.compile(r"\b\d{3}[- ]?\d{3}[- ]?\d{4}\b"),
)


class PIIRedactingFilter(logging.Filter):
    """Strip likely PII from log records before they are emitted."""

    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        for pattern in _PII_PATTERNS:
            message = pattern.sub("[REDACTED]", message)
        record.msg = message
        record.args = ()
        return True


def configure_logging(level: int = logging.INFO) -> None:
    """Configure structured, PII-safe application logging."""
    root = logging.getLogger()
    if root.handlers:
        return

    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S",
        )
    )
    handler.addFilter(PIIRedactingFilter())

    root.setLevel(level)
    root.addHandler(handler)

    logging.getLogger("uvicorn.access").addFilter(PIIRedactingFilter())


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
