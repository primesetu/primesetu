import time
import shutil
import logging
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.common import NodeHealth

logger = logging.getLogger("smriti.telemetry")

# Track server start time for uptime calculation
START_TIME = time.time()

async def get_node_health(db: AsyncSession) -> NodeHealth:
    """
    Collect real-time system vitals from the sovereign node.
    No external dependencies (psutil) required for core metrics.
    """
    
    # 1. Disk Usage (Root)
    # Using shutil which is in stdlib
    total, used, free = shutil.disk_usage("/")
    disk_percent = (used / total) * 100
    
    # 2. Database Latency
    # Measure time for a simple round-trip
    db_start = time.time()
    try:
        await db.execute(text("SELECT 1"))
        db_latency = (time.time() - db_start) * 1000 # to ms
    except Exception as e:
        logger.error(f"Telemetry: DB Latency check failed: {str(e)}")
        db_latency = 999.0
        
    # 3. Uptime
    uptime = time.time() - START_TIME
    
    # 4. Status Classification
    status = "HEALTHY"
    if disk_percent > 90 or db_latency > 500:
        status = "CRITICAL"
    elif disk_percent > 75 or db_latency > 100:
        status = "DEGRADED"
        
    return NodeHealth(
        disk_percent=round(disk_percent, 1),
        db_latency_ms=round(db_latency, 2),
        uptime_seconds=round(uptime, 0),
        status=status
    )
