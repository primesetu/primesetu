
from sqlalchemy import String, Integer, DateTime, text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from datetime import datetime
from typing import Optional, Dict, Any

class SyncPacket(Base):
    __tablename__ = "sync_packets"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="PENDING")
    synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class RemoteCommand(Base):
    __tablename__ = "remote_commands"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    store_id: Mapped[str] = mapped_column(String, index=True)
    command_type: Mapped[str] = mapped_column(String) # SQL, UPDATE, REBOOT
    payload: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="Pending")
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
