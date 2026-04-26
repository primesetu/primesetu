from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class VaGroup(Base):
    __tablename__ = "va_groups"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    permissions = relationship("VaGroupPermission", back_populates="group", cascade="all, delete-orphan")
    menus = relationship("VaGroupMenu", back_populates="group", cascade="all, delete-orphan")

class VaGroupPermission(Base):
    __tablename__ = "va_group_permissions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(PGUUID(as_uuid=True), ForeignKey("va_groups.id", ondelete="CASCADE"), nullable=False)
    permission = Column(String, nullable=False)
    is_allowed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    group = relationship("VaGroup", back_populates="permissions")

class VaGroupMenu(Base):
    __tablename__ = "va_group_menus"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(PGUUID(as_uuid=True), ForeignKey("va_groups.id", ondelete="CASCADE"), nullable=False)
    menu_id = Column(String, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False)
    is_visible = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    group = relationship("VaGroup", back_populates="menus")

class VaUserGroup(Base):
    __tablename__ = "va_user_groups"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False)
    group_id = Column(PGUUID(as_uuid=True), ForeignKey("va_groups.id", ondelete="CASCADE"), nullable=False)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
