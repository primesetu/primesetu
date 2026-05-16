# ============================================================
# SMRITI-OS — Sovereign Retry Policy
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Infrastructure: Sync Retry Logic (v1.2)
# ============================================================

from datetime import datetime, timedelta

class RetryPolicy:
    """
    Sovereign Retry Policy Engine.
    Implements deterministic exponential backoff for sync packets.
    """
    
    # Backoff sequence in minutes: 0.5, 2, 5, 15, 60, 240...
    BACKOFF_MINUTES = [0.5, 2, 5, 15, 60, 240, 720, 1440]
    MAX_ATTEMPTS = 10

    @classmethod
    def get_next_retry_time(cls, attempts: int) -> datetime:
        """
        Calculates the next scheduled retry time based on attempt count.
        """
        if attempts >= len(cls.BACKOFF_MINUTES):
            minutes = cls.BACKOFF_MINUTES[-1]
        else:
            minutes = cls.BACKOFF_MINUTES[attempts]
            
        return datetime.utcnow() + timedelta(minutes=minutes)

    @classmethod
    def is_dead_letter(cls, attempts: int) -> bool:
        """
        Determines if a packet should be moved to the Dead-Letter Queue.
        """
        return attempts >= cls.MAX_ATTEMPTS
