import logging
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import text
import json
from app.services.journal import journal_service

logger = logging.getLogger("smriti.sync")

class DistributedSyncCoordinator:
    """
    Central Synchronous Federation Handler for Smriti Retail Terminal Cluster.
    Guarantees consistent data injection or quarantines poisoned updates to dead-letter channels.
    """
    def __init__(self, target_session_maker: async_sessionmaker):
        self.smaker = target_session_maker

    async def ingest_incoming_device_payload(self, packet: dict) -> dict:
        """
        Processes inbound distributed transactional packages safely.
        Format parameters: { device_id: str, sequence: int, type: str, raw_data: dict, operator_id: str }
        """
        device_id = packet.get("device_id")
        seq = packet.get("sequence")
        event_type = packet.get("type")
        data = packet.get("raw_data")
        op_id = packet.get("operator_id")

        async with self.smaker() as session:
            try:
                # Spawn transactional execution isolation context boundaries
                async with session.begin():
                    event_uuid = await journal_service.commit_transaction_event(
                        session=session,
                        device_id=device_id,
                        incoming_sequence=seq,
                        event_type=event_type,
                        payload=data,
                        operator_id=op_id
                    )
                return {"status": "SUCCESS", "event_uuid": event_uuid, "synced_sequence": seq}
                
            except Exception as system_fault:
                # Isolate, quarantine, and prevent terminal operation pipelines from crashing down completely
                await self._route_to_dead_letter_vault(device_id, seq, event_type, data, str(system_fault))
                return {
                    "status": "QUARANTINED", 
                    "error": str(system_fault), 
                    "action": "TERMINAL_FORCE_RESYNC_UPSTREAM"
                }

    async def _route_to_dead_letter_vault(self, device_id: str, seq: int, ev_type: str, data: dict, error_msg: str):
        """Quarantine execution mechanism protecting high-speed ledger isolation (CRITICAL TASK 7)."""
        logger.critical(f"[DLQ Alert] Poisoned packet encountered from {device_id} at seq {seq}. Route to vault.")
        async with self.smaker() as session:
            async with session.begin():
                await session.execute(
                    text("""
                        INSERT INTO s9.sync_dead_letter_queue 
                        (event_id, device_id, failure_reason, raw_payload)
                        VALUES (gen_random_uuid(), :dev, :reason, :payload)
                    """),
                    {
                        "dev": device_id,
                        "reason": f"Sequence/Verification crash: {error_msg} for event_type [{ev_type}] at step {seq}",
                        "payload": json.dumps(data)
                    }
                )
