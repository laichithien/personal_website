from datetime import UTC, datetime


def utcnow() -> datetime:
    """Return a naive UTC datetime for compatibility with current DB columns."""

    return datetime.now(UTC).replace(tzinfo=None)
