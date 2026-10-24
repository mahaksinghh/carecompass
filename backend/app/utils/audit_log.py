"""
CareCompass Safety Event Audit Logger
Logs anonymized safety events, red flag triggers, and triage routing decisions.
Strictly excludes identifiable patient information and free-text health narratives.
"""

import time
from typing import List, Optional, Dict, Any

# In-memory transient event log for demonstration and testing inspection
SAFETY_EVENT_LOG: List[Dict[str, Any]] = []


def record_safety_event(
    event_type: str,
    urgency_label: str,
    red_flag_ids: List[str],
    language: str,
    session_id: Optional[str] = None,
) -> None:
    """
    Records an anonymized safety event without sensitive text or PII.
    """
    entry = {
        "timestamp": time.time(),
        "event_type": event_type,
        "urgency_label": urgency_label,
        "red_flag_ids": red_flag_ids,
        "language": language,
        "session_hash": f"anon_{hash(session_id) % 100000}" if session_id else "anon_guest",
    }
    SAFETY_EVENT_LOG.append(entry)


def get_safety_logs() -> List[Dict[str, Any]]:
    return list(SAFETY_EVENT_LOG)


def clear_safety_logs() -> None:
    SAFETY_EVENT_LOG.clear()
