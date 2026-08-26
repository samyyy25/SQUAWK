from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
import datetime

class AircraftBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    tail_number: str
    aircraft_type: str
    operator: str
    home_base: str
    current_location: str

class PartDocumentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    doc_type: str
    doc_number: Optional[str] = None
    issuer: Optional[str] = None
    is_valid: bool = True

class PartSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    part_number: str
    description: str
    ata_chapter: str
    vendor_id: str
    condition: str
    quantity_available: int
    unit_price: float
    currency: str
    warehouse_location: str
    has_8130_3: bool
    has_easa_form_1: bool
    has_trace_to_oem: bool
    has_coc: bool
    serial_number: Optional[str] = None
    tags_notes: Optional[str] = None

class VendorSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    location_hub: str
    cage_code: Optional[str] = None
    base_rating: float
    verified_orders_count: int
    on_time_deliveries: int
    avg_delay_minutes: float
    doc_issues_count: int
    calculated_reliability: float
    contact_email: Optional[str] = None
    contact_aog_desk: Optional[str] = None

class RecoveryCandidateSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    case_id: str
    vendor_id: str
    part_id: Optional[str] = None
    vendor_name: str
    part_number: str
    condition: str
    part_cost: float
    freight_cost: float
    total_landed_cost: float
    estimated_eta_hours: float
    shipping_method: str
    documentation_status: str
    doc_notes: Optional[str] = None
    vendor_reliability_score: float
    overall_rank: int
    is_recommended: bool
    is_flagged: bool
    flag_reason: Optional[str] = None
    confidence: float

class AgentResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    case_id: str
    specialist_name: str
    status: str
    confidence: float
    raw_output: Dict[str, Any]
    execution_time_ms: int
    created_at: datetime.datetime

class ValidationResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    case_id: str
    status: str
    conflicts_detected: List[Any] = []
    flagged_candidates: List[Any] = []
    valid_candidates: List[Any] = []
    risk_level: str
    confidence: float
    requires_human_review: bool
    reasoning_summary: str

class RecoveryActionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    case_id: str
    action_type: str
    reference_number: str
    title: str
    details: Optional[Dict[str, Any]] = None
    is_demo_action: bool
    created_at: datetime.datetime

class SquawkCaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    tail_number: Optional[str] = None
    aircraft_type: Optional[str] = None
    defect_description: str
    raw_intake_payload: Optional[Dict[str, Any]] = None
    ata_chapter: Optional[str] = None
    part_number: Optional[str] = None
    part_name: Optional[str] = None
    priority: str
    location: str
    current_stage: str
    confidence_score: float
    risk_level: str
    status: str
    estimated_recovery_hours: Optional[float] = None
    is_malformed: bool = False
    malformed_reason: Optional[str] = None
    is_demo: bool = False
    demo_key: Optional[str] = None
    demo_badge: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    candidates: List[RecoveryCandidateSchema] = []
    agent_results: List[AgentResultSchema] = []
    validation_result: Optional[ValidationResultSchema] = None
    recovery_actions: List[RecoveryActionSchema] = []

class CaseCreateRequest(BaseModel):
    tail_number: Optional[str] = None
    aircraft_type: Optional[str] = None
    defect_description: str
    ata_chapter: Optional[str] = None
    part_number: Optional[str] = None
    part_name: Optional[str] = None
    priority: str = "AOG"
    location: str = "ORD"
    is_demo: bool = False
    demo_key: Optional[str] = None
    demo_badge: Optional[str] = None
    raw_intake_payload: Optional[Dict[str, Any]] = None

class ApprovalRequest(BaseModel):
    selected_candidate_id: Optional[str] = None
    decision: str = "APPROVED" # APPROVED, REJECTED, REQUEST_MORE_INFO, ALTERNATIVE_CHOSEN
    approver_name: str = "Capt. Marcus Vance"
    approver_license: str = "FAA A&P / AOG Controller #482910"
    notes: Optional[str] = None

class OutcomeSubmitRequest(BaseModel):
    vendor_id: str
    predicted_eta_hours: float
    actual_delivery_hours: float
    predicted_cost: float
    actual_cost: float
    documentation_accepted: bool = True
    recovery_successful: bool = True
    vendor_performance_rating: int = 5
    operator_notes: Optional[str] = None

class ActivityLogSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    case_id: Optional[str] = None
    timestamp: datetime.datetime
    category: str
    title: str
    details: Optional[str] = None
    meta_info: Optional[Dict[str, Any]] = None

class BatchProcessResultSchema(BaseModel):
    batch_id: str
    total_cases_received: int
    successfully_processed: int
    ready_for_approval: int
    auto_cleared: int
    escalated_to_humans: int
    validator_rejections_cheapest: int
    documentation_conflicts: int
    vendor_search_timeouts: int
    malformed_inputs: int
    total_runtime_seconds: float
    total_ai_agent_calls: int
    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    total_cost_usd: float
    approximate_cost_usd: float
    average_cost_per_case_usd: float
    success_rate_percent: float

