import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Aircraft(Base):
    __tablename__ = "aircraft"

    tail_number = Column(String, primary_key=True, index=True)
    aircraft_type = Column(String, nullable=False) # e.g. Boeing 737-800, Airbus A320
    operator = Column(String, nullable=False)
    home_base = Column(String, nullable=False) # e.g. ORD, DFW, ATL
    current_location = Column(String, nullable=False)

    cases = relationship("SquawkCase", back_populates="aircraft")


class SquawkCase(Base):
    __tablename__ = "squawk_cases"

    id = Column(String, primary_key=True, index=True)
    tail_number = Column(String, ForeignKey("aircraft.tail_number"), nullable=True)
    aircraft_type = Column(String, nullable=True)
    defect_description = Column(Text, nullable=False)
    raw_intake_payload = Column(JSON, nullable=True) # stores uploaded text, doc metadata, audio transcripts
    ata_chapter = Column(String, nullable=True) # e.g. "29 - Hydraulic Power"
    part_number = Column(String, nullable=True)
    part_name = Column(String, nullable=True)
    priority = Column(String, default="AOG") # AOG, URGENT, ROUTINE
    location = Column(String, default="ORD")
    current_stage = Column(String, default="INTAKE") # INTAKE, PARSING, SPECIALIST_ROUTING, VALIDATING, HUMAN_REVIEW, APPROVED, REJECTED, COMPLETED, MANUAL_TAGGING
    confidence_score = Column(Float, default=0.0) # 0.0 to 1.0
    risk_level = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="Processing") # Processing, Needs Review, Awaiting Approval, Approved, Rejected, Action Created, Closed
    estimated_recovery_hours = Column(Float, nullable=True)
    is_malformed = Column(Boolean, default=False)
    malformed_reason = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    demo_key = Column(String, nullable=True) # hero, fast_recovery, missing_info, vendor_memory, agent_conflict
    demo_badge = Column(String, nullable=True) # HERO, FAST RECOVERY, MISSING DATA, MEMORY, AGENT CONFLICT
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    aircraft = relationship("Aircraft", back_populates="cases")
    agent_results = relationship("AgentResult", back_populates="case", cascade="all, delete-orphan")
    validation_result = relationship("ValidationResult", back_populates="case", uselist=False, cascade="all, delete-orphan")
    candidates = relationship("RecoveryCandidate", back_populates="case", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="case", cascade="all, delete-orphan")
    recovery_actions = relationship("RecoveryAction", back_populates="case", cascade="all, delete-orphan")
    outcomes = relationship("Outcome", back_populates="case", cascade="all, delete-orphan")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_hub = Column(String, nullable=False) # e.g. ORD, MIA, DFW, FRA, LHR
    cage_code = Column(String, nullable=True)
    base_rating = Column(Float, default=0.90)
    verified_orders_count = Column(Integer, default=0)
    on_time_deliveries = Column(Integer, default=0)
    avg_delay_minutes = Column(Float, default=0.0)
    doc_issues_count = Column(Integer, default=0)
    calculated_reliability = Column(Float, default=0.90) # percentage
    contact_email = Column(String, nullable=True)
    contact_aog_desk = Column(String, nullable=True)

    parts = relationship("Part", back_populates="vendor")
    memories = relationship("VendorMemory", back_populates="vendor")


class Part(Base):
    __tablename__ = "parts"

    id = Column(String, primary_key=True, index=True)
    part_number = Column(String, index=True, nullable=False)
    alternate_part_numbers = Column(JSON, default=list)
    description = Column(String, nullable=False)
    ata_chapter = Column(String, nullable=False)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    condition = Column(String, default="Factory New") # FN (Factory New), OH (Overhauled), SV (Serviceable), AR (As Removed)
    quantity_available = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    warehouse_location = Column(String, nullable=False)
    has_8130_3 = Column(Boolean, default=True)
    has_easa_form_1 = Column(Boolean, default=False)
    has_trace_to_oem = Column(Boolean, default=True)
    has_coc = Column(Boolean, default=True)
    serial_number = Column(String, nullable=True)
    tags_notes = Column(Text, nullable=True)

    vendor = relationship("Vendor", back_populates="parts")
    documents = relationship("PartDocument", back_populates="part")


class PartDocument(Base):
    __tablename__ = "part_documents"

    id = Column(String, primary_key=True, index=True)
    part_id = Column(String, ForeignKey("parts.id"), nullable=False)
    doc_type = Column(String, nullable=False) # FAA 8130-3, EASA Form 1, Certificate of Conformity, Non-Incident Statement
    doc_number = Column(String, nullable=True)
    issuer = Column(String, nullable=True)
    is_valid = Column(Boolean, default=True)
    doc_url = Column(String, nullable=True)

    part = relationship("Part", back_populates="documents")


class AgentResult(Base):
    __tablename__ = "agent_results"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("squawk_cases.id"), nullable=False)
    specialist_name = Column(String, nullable=False) # Sourcing Specialist, Documentation Specialist, Logistics Specialist
    status = Column(String, default="COMPLETED")
    confidence = Column(Float, default=1.0)
    raw_output = Column(JSON, nullable=False)
    execution_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("SquawkCase", back_populates="agent_results")


class RecoveryCandidate(Base):
    __tablename__ = "recovery_candidates"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("squawk_cases.id"), nullable=False)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    part_id = Column(String, ForeignKey("parts.id"), nullable=True)
    vendor_name = Column(String, nullable=False)
    part_number = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    part_cost = Column(Float, nullable=False)
    freight_cost = Column(Float, nullable=False)
    total_landed_cost = Column(Float, nullable=False)
    estimated_eta_hours = Column(Float, nullable=False)
    shipping_method = Column(String, default="Hot-Shot Dedicated Courier")
    documentation_status = Column(String, default="Complete") # Complete, Incomplete, Missing Required Tag, Ambiguous
    doc_notes = Column(Text, nullable=True)
    vendor_reliability_score = Column(Float, default=0.90)
    overall_rank = Column(Integer, default=1)
    is_recommended = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(Text, nullable=True)
    confidence = Column(Float, default=0.90)

    case = relationship("SquawkCase", back_populates="candidates")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("squawk_cases.id"), nullable=False)
    status = Column(String, default="VALIDATED") # VALIDATED, FLAGGED, ESCALATED_TO_HUMAN, REJECTED
    conflicts_detected = Column(JSON, default=list)
    flagged_candidates = Column(JSON, default=list)
    valid_candidates = Column(JSON, default=list)
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=0.90)
    requires_human_review = Column(Boolean, default=True)
    reasoning_summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("SquawkCase", back_populates="validation_result")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("squawk_cases.id"), nullable=False)
    selected_candidate_id = Column(String, nullable=True)
    decision = Column(String, nullable=False) # APPROVED, REJECTED, REQUEST_MORE_INFO, ALTERNATIVE_CHOSEN
    approver_name = Column(String, default="Capt. Marcus Vance (Duty Tech Ops Director)")
    approver_license = Column(String, default="FAA A&P / AOG Controller #482910")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("SquawkCase", back_populates="approvals")


class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("squawk_cases.id"), nullable=False)
    action_type = Column(String, nullable=False) # PO_CREATED, VENDOR_DISPATCHED, WORK_ORDER_UPDATED, OPS_NOTIFIED
    reference_number = Column(String, nullable=False) # e.g. SQ-1042
    title = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    is_demo_action = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("SquawkCase", back_populates="recovery_actions")


class Outcome(Base):
    __tablename__ = "outcomes"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("squawk_cases.id"), nullable=False)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    predicted_eta_hours = Column(Float, nullable=False)
    actual_delivery_hours = Column(Float, nullable=False)
    predicted_cost = Column(Float, nullable=False)
    actual_cost = Column(Float, nullable=False)
    documentation_accepted = Column(Boolean, default=True)
    recovery_successful = Column(Boolean, default=True)
    vendor_performance_rating = Column(Integer, default=5) # 1 to 5
    operator_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("SquawkCase", back_populates="outcomes")


class VendorMemory(Base):
    __tablename__ = "vendor_memories"

    id = Column(String, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    total_orders = Column(Integer, default=0)
    on_time_deliveries = Column(Integer, default=0)
    avg_delay_minutes = Column(Float, default=0.0)
    documentation_defects = Column(Integer, default=0)
    reliability_score = Column(Float, default=0.90)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("Vendor", back_populates="memories")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    category = Column(String, default="PIPELINE") # PIPELINE, SPECIALIST, VALIDATOR, APPROVAL, ACTION, OUTCOME
    title = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    meta_info = Column(JSON, nullable=True)
