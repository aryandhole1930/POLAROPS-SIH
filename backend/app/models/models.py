import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    DateTime,
    Text,
    ForeignKey,
    JSON,
    Numeric,
    Boolean,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.connection import Base


# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    full_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)

    # Institutional / functional authority
    role = Column(
        String(50),
        nullable=False,
        default="expedition_member"
    )

    # Primary operational station
    station = Column(String(50))

    # Profession / personnel category
    personnel_type = Column(String(50))

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    # Relationships
    missions = relationship(
        "Mission",
        back_populates="creator"
    )

    cargo_items = relationship(
        "Cargo",
        back_populates="creator"
    )

    emergencies = relationship(
        "Emergency",
        back_populates="reporter"
    )

    expedition_assignments = relationship(
        "ExpeditionAssignment",
        back_populates="user"
    )

class RoleDomainRule(Base):
    __tablename__ = "role_domain_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain = Column(String(255), unique=True, nullable=False)
    role = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
# =========================================================
# MISSION
# =========================================================

class Mission(Base):
    __tablename__ = "missions"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    mission_name = Column(
        String(200),
        nullable=False
    )

    start_date = Column(Date)
    end_date = Column(Date)

    status = Column(
        String(50),
        nullable=False,
        default="planning"
    )

    destination = Column(
        String(100),
        default="Antarctica"
    )

    objectives = Column(
        JSON,
        nullable=False,
        default=list
    )

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL")
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    creator = relationship(
        "User",
        back_populates="missions"
    )

    cargo_items = relationship(
        "Cargo",
        back_populates="mission"
    )

    emergencies = relationship(
        "Emergency",
        back_populates="mission"
    )


# =========================================================
# CARGO
# =========================================================

class Cargo(Base):
    __tablename__ = "cargo"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    cargo_code = Column(
        String(50),
        nullable=False,
        unique=True
    )

    cargo_name = Column(
        String(200),
        nullable=False
    )

    cargo_type = Column(String(100))

    quantity = Column(
        Integer,
        nullable=False,
        default=1
    )

    origin = Column(String(150))

    destination = Column(String(150))

    status = Column(
        String(50),
        nullable=False,
        default="preparing"
    )

    transport_mode = Column(String(50))

    eta = Column(DateTime(timezone=True))

    delivered_at = Column(DateTime(timezone=True))

    mission_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "missions.id",
            ondelete="SET NULL"
        )
    )

    expedition_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "expeditions.id",
            ondelete="SET NULL"
        )
    )

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="SET NULL"
        )
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    mission = relationship(
        "Mission",
        back_populates="cargo_items"
    )

    expedition = relationship(
        "Expedition"
    )

    creator = relationship(
        "User",
        back_populates="cargo_items"
    )
# =========================================================
# EMERGENCY
# =========================================================

class Emergency(Base):
    __tablename__ = "emergencies"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    incident_code = Column(
        String(50),
        nullable=False,
        unique=True
    )

    emergency_type = Column(
        String(100),
        nullable=False
    )

    description = Column(Text)

    location = Column(
        String(200),
        nullable=False
    )

    severity = Column(
        String(30),
        nullable=False,
        default="medium"
    )

    status = Column(
        String(50),
        nullable=False,
        default="open"
    )

    reported_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL")
    )

    mission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("missions.id", ondelete="SET NULL")
    )

    expedition_id = Column(
    UUID(as_uuid=True),
    ForeignKey("expeditions.id", ondelete="SET NULL")
)

    reported_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    resolved_at = Column(DateTime(timezone=True))

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    reporter = relationship(
        "User",
        back_populates="emergencies"
    )

    mission = relationship(
        "Mission",
        back_populates="emergencies"
    )

    expedition = relationship(
    "Expedition"
)
# =========================================================
# NOTIFICATIONS
# =========================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    emergency_id = Column(
        UUID(as_uuid=True),
        ForeignKey("emergencies.id", ondelete="CASCADE")
    )

    title = Column(
        String(200),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    notification_type = Column(
        String(50),
        nullable=False,
        default="emergency"
    )

    priority = Column(
        String(30),
        nullable=False,
        default="high"
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    read_at = Column(
        DateTime(timezone=True)
    )

    user = relationship(
        "User"
    )

    emergency = relationship(
        "Emergency"
    )

# =========================================================
# EXPEDITION
# =========================================================

class Expedition(Base):
    __tablename__ = "expeditions"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    expedition_code = Column(
        String(50),
        nullable=False,
        unique=True
    )

    expedition_name = Column(
        String(200),
        nullable=False
    )

    start_date = Column(Date)
    end_date = Column(Date)

    status = Column(
        String(50),
        nullable=False,
        default="planning"
    )

    description = Column(Text)

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL")
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    assignments = relationship(
        "ExpeditionAssignment",
        back_populates="expedition"
    )


# =========================================================
# STATION
# =========================================================

class Station(Base):
    __tablename__ = "stations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    station_code = Column(
        String(50),
        nullable=False,
        unique=True
    )

    station_name = Column(
        String(150),
        nullable=False
    )

    station_type = Column(
        String(50),
        nullable=False,
        default="research_station"
    )

    location_description = Column(Text)

    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))

    operational_status = Column(
        String(50),
        nullable=False,
        default="active"
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    assignments = relationship(
        "ExpeditionAssignment",
        back_populates="station"
    )


# =========================================================
# EXPEDITION ASSIGNMENT
# =========================================================

class ExpeditionAssignment(Base):
    __tablename__ = "expedition_assignments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    expedition_id = Column(
        UUID(as_uuid=True),
        ForeignKey("expeditions.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    appointment_type = Column(
        String(50),
        nullable=False
    )

    station_id = Column(
        UUID(as_uuid=True),
        ForeignKey("stations.id", ondelete="SET NULL")
    )

    start_date = Column(Date)
    end_date = Column(Date)

    authority_scope = Column(String(100))

    notes = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )

    expedition = relationship(
        "Expedition",
        back_populates="assignments"
    )

    user = relationship(
        "User",
        back_populates="expedition_assignments"
    )

    station = relationship(
        "Station",
        back_populates="assignments"
    )