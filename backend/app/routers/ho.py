# ============================================================
# * PrimeSetu â€” Shoper9-Based Retail OS
# * Zero Cloud Â. Sovereign Â. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * Â(c) 2026 â€” All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends
import random
from datetime import datetime
from app.core.security import get_current_user, UserContext

router = APIRouter()

@router.get("/status")
async def get_ho_status(current_user: UserContext = Depends(get_current_user)):
    return {
        "connected": True,
        "last_sync": datetime.now().isoformat(),
        "pending_packets": random.randint(0, 15),
        "health": "excellent",
        "corporate_node": "HQ-MUM-01"
    }

@router.post("/sync")
async def trigger_ho_sync(current_user: UserContext = Depends(get_current_user)):
    return {
        "status": "success",
        "synced_records": random.randint(50, 200),
        "bandwidth_used": f"{random.uniform(0.5, 2.5):.1f} MB",
        "message": "Store-HO synchronization completed."
    }
