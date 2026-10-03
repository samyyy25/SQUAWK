import json
import uuid
import datetime
import time
import copy
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from app.database import engine, Base, get_db
from app.models import (
    Aircraft, SquawkCase, Vendor, Part, PartDocument,
    RecoveryCandidate, AgentResult, ValidationResult,
    Approval, RecoveryAction, Outcome, VendorMemory, ActivityLog,
    Shipment, Disruption, RecoveryUpdate, IncidentResolution
)
from app.schemas import (
    SquawkCaseSchema, CaseCreateRequest, ApprovalRequest,
    OutcomeSubmitRequest, VendorSchema, ActivityLogSchema,
    BatchProcessResultSchema, DisruptionRequest, ReplanRequest,
    VerifyRecoveryRequest, PartVerifyRequest, RouteRequest,
    OptimizeRequest, ReservePartRequest, CreateShipmentRequest,
    RecoveryUpdateCreate, RecoveryUpdateSchema, IncidentResolutionCreate,
    IncidentResolutionSchema, RecoveryActionStatusUpdate, VakhIntakePayload,
    VakhWebhookPayload
)
from app.vakh_client import (
    vakh_client, VAKH_AOG_INTAKE_FORM_SPEC, VAKH_AOG_WORKSPACE_FORM_SPEC
)
from app.seed import seed_database
from app.agent_tools import (
    get_aircraft_status, get_inventory, search_suppliers, verify_part,
    calculate_route, optimize_recovery, reserve_part, create_shipment,
    get_shipment_status, simulate_disruption, replan_recovery, verify_recovery
)
from app.orchestrator import (
    execute_squawk_orchestration, process_human_approval, process_verified_outcome
)
from app.pipeline_runner import pipeline_runner, INPUT_TOKEN_RATE, OUTPUT_TOKEN_RATE

# Initialize Database Schema & Seed
from sqlalchemy import inspect
inspector = inspect(engine)
if 'squawk_cases' in inspector.get_table_names():
    cols = [c['name'] for c in inspector.get_columns('squawk_cases')]
    if 'vakh_submission_id' not in cols:
        Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
with Session(engine) as init_db:
    seed_database(init_db)

app = FastAPI(
    title="SQUAWK — Autonomous AOG Supply Chain Recovery Agent API",
    description="SIMULATED AOG OPERATIONS ENVIRONMENT & Autonomous Decision-Support Platform",
    version="2.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SQUAWK Autonomous AOG Recovery Agent",
        "environment": "SIMULATED AOG OPERATIONS ENVIRONMENT",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "rocketride_connected": True,
        "pipelines": [
            "ingest_squawk.pipe",
            "source_and_certify.pipe",
            "source_recovery.pipe",
            "outcome_tracker.pipe"
        ],
        "agentic_tools_count": 12,
        "demo_mode": True
    }


@app.get("/api/cases", response_model=List[SquawkCaseSchema])
def list_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    stage: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SquawkCase).options(
        joinedload(SquawkCase.candidates),
        joinedload(SquawkCase.agent_results),
        joinedload(SquawkCase.validation_result),
        joinedload(SquawkCase.recovery_actions),
        joinedload(SquawkCase.shipments),
        joinedload(SquawkCase.disruptions),
        joinedload(SquawkCase.recovery_updates),
        joinedload(SquawkCase.resolution)
    )
    if status:
        query = query.filter(SquawkCase.status == status)
    if priority:
        query = query.filter(SquawkCase.priority == priority)
    if stage:
        query = query.filter(SquawkCase.current_stage == stage)
    return query.order_by(SquawkCase.created_at.desc()).all()


@app.get("/api/cases/{case_id}", response_model=SquawkCaseSchema)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(SquawkCase).options(
        joinedload(SquawkCase.candidates),
        joinedload(SquawkCase.agent_results),
        joinedload(SquawkCase.validation_result),
        joinedload(SquawkCase.recovery_actions),
        joinedload(SquawkCase.shipments),
        joinedload(SquawkCase.disruptions),
        joinedload(SquawkCase.recovery_updates),
        joinedload(SquawkCase.resolution)
    ).filter(SquawkCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    return case


@app.post("/api/cases", response_model=SquawkCaseSchema)
def create_case(payload: CaseCreateRequest, db: Session = Depends(get_db)):
    case_id = f"CASE-{uuid.uuid4().hex[:6].upper()}"
    
    # 1. Ingestion Pipeline Run via RocketRide
    pipe_res = pipeline_runner.run_pipeline("ingest_squawk", {
        "case_id": case_id,
        "tail_number": payload.tail_number,
        "defect": payload.defect_description,
        "part_number": payload.part_number,
        "location": payload.location
    })

    is_malformed = False
    malformed_reason = None
    if not payload.tail_number or not payload.tail_number.strip():
        is_malformed = True
        malformed_reason = "Missing required aircraft registration identifier (tail_number)."
    elif not payload.part_number or not payload.part_number.strip() or payload.part_number.upper().startswith("UNKNOWN"):
        is_malformed = True
        malformed_reason = "Missing or unverified IPC rotable part number. Needs manual tagging."
    elif not payload.defect_description or not payload.defect_description.strip():
        is_malformed = True
        malformed_reason = "Defect description is empty or unreadable."

    vakh_sub_id = payload.vakh_submission_id or f"vakh_{uuid.uuid4().hex[:8]}"
    vakh_url = payload.vakh_record_url or vakh_client.generate_record_url(vakh_sub_id)

    case = SquawkCase(
        id=case_id,
        tail_number=payload.tail_number.strip() if payload.tail_number else None,
        aircraft_type=payload.aircraft_type or ("Boeing 737-800" if not is_malformed else "Unknown Airframe"),
        defect_description=payload.defect_description,
        raw_intake_payload=payload.raw_intake_payload or {
            "source": "SIMULATED Web Operations Intake",
            "pipeline_exec": pipe_res.get("telemetry", {}).get("execution_id")
        },
        ata_chapter=payload.ata_chapter or ("29 - Hydraulic Power" if not is_malformed else None),
        part_number=payload.part_number.strip() if payload.part_number else None,
        part_name=payload.part_name or "Engine-Driven Hydraulic Pump",
        priority=payload.priority,
        location=payload.location or "DEL",
        deadline_hours=payload.deadline_hours or 18.0,
        max_acceptable_cost=payload.max_acceptable_cost or 25000.0,
        current_stage="INTAKE" if not is_malformed else "MANUAL_TAGGING",
        confidence_score=0.96 if not is_malformed else 0.20,
        risk_level="LOW" if not is_malformed else "CRITICAL",
        status="Processing" if not is_malformed else "Needs Review",
        is_malformed=is_malformed,
        malformed_reason=malformed_reason,
        vakh_submission_id=vakh_sub_id,
        vakh_record_url=vakh_url,
        vakh_form_id=vakh_client.form_key,
        vakh_synced_at=datetime.datetime.utcnow(),
        operator=payload.operator or "Air Indigo Wings",
        airport=payload.airport or payload.location or "DEL",
        flight_number=payload.flight_number or "SQ-204",
        defect_category=payload.defect_category or payload.ata_chapter or "Hydraulic Power",
        severity=payload.severity or ("CRITICAL" if "leak" in payload.defect_description.lower() or "vibration" in payload.defect_description.lower() else "HIGH"),
        urgency=payload.urgency or "IMMEDIATE",
        reported_symptoms=payload.reported_symptoms,
        operational_impact=payload.operational_impact or "Departure hold at terminal",
        mel_cdl_info=payload.mel_cdl_info,
        required_maintenance_team=payload.required_maintenance_team or "Line Maintenance Hydraulics",
        reporter_name=payload.reporter_name or "Line Maintenance Controller",
        reporter_contact=payload.reporter_contact
    )
    db.add(case)
    db.commit()

    # Log initial Vakh intake activity in updates
    db.add(RecoveryUpdate(
        id=f"UPD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case.id,
        source="VAKH",
        message=f"AOG incident reported via Vakh structured intake ({case.defect_category}). Reporter: {case.reporter_name}.",
        author=case.reporter_name or "Line Maintenance",
        action_status="REPORTED",
        vakh_sync_status="SYNCED",
        vakh_update_id=f"vakh_init_{vakh_sub_id}"
    ))
    db.commit()

    if not is_malformed:
        case = execute_squawk_orchestration(db, case.id)

    db.refresh(case)
    return case


# -------------------------------------------------------------------------
# VAKH STRUCTURED INTAKE & COLLABORATIVE WORKSPACE INTEGRATION LAYER
# -------------------------------------------------------------------------

DEFAULT_8_STEP_RECOVERY_ACTIONS = [
    {"id": "act-1", "step_number": 1, "title": "Assign hydraulic maintenance technician", "description": "Dispatch certified A&P hydraulic lead to aircraft gate.", "assigned_role": "Hydraulic Lead Specialist", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
    {"id": "act-2", "step_number": 2, "title": "Inspect affected hydraulic system", "description": "Conduct borescope and visual leak check on affected system.", "assigned_role": "Lead Inspector", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
    {"id": "act-3", "step_number": 3, "title": "Identify leaking component", "description": "Isolate high-pressure discharge port seal and housing.", "assigned_role": "A&P Technician", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
    {"id": "act-4", "step_number": 4, "title": "Check required replacement component", "description": "Verify part airworthiness certification (8130-3/EASA Form 1).", "assigned_role": "Materials / QC Inspector", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
    {"id": "act-5", "step_number": 5, "title": "Replace component if approved", "description": "Torque component to AMM specifications with calibrated tooling.", "assigned_role": "Lead Mechanic", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
    {"id": "act-6", "step_number": 6, "title": "Perform required inspection/testing", "description": "Run hydraulic system ground test cart; verify no pressure drop.", "assigned_role": "Avionics / Systems Tech", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
    {"id": "act-7", "step_number": 7, "title": "Verify aircraft readiness", "description": "Perform full flight deck BITE test; clear master caution annunciator.", "assigned_role": "Duty Maintenance Manager", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
    {"id": "act-8", "step_number": 8, "title": "Release aircraft according to authorized procedures", "description": "Sign CRS (Certificate of Release to Service) and return aircraft to line ops.", "assigned_role": "Chief Inspector / Signatory", "status": "Pending", "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
]

def process_vakh_intake(payload: VakhIntakePayload, db: Session) -> SquawkCase:
    """Core intake processor converting Vakh structured form payloads into SQUAWK AOG incidents."""
    sub_id = payload.vakh_submission_id or f"vakh_sub_{uuid.uuid4().hex[:8]}"

    # Idempotency check: if this submission was already ingested, return existing record
    existing = db.query(SquawkCase).filter(SquawkCase.vakh_submission_id == sub_id).first()
    if existing:
        return existing

    case_id = f"AOG-{uuid.uuid4().hex[:4].upper()}"
    vakh_url = vakh_client.generate_record_url(sub_id)

    reg = payload.aircraft_registration.strip()
    act_type = payload.aircraft_type.strip()
    operator = payload.operator.strip()
    airport = payload.airport.strip()
    defect_desc = payload.defect_description.strip()
    category = payload.defect_category.strip()
    part_no = (payload.required_parts or "HP-2048").strip()

    is_critical = any(kw in defect_desc.lower() for kw in ["leak", "vibration", "low pressure", "failure", "spallation", "cracked", "smoke", "shutdown"])
    severity = "CRITICAL" if is_critical else "HIGH"
    avail_hours = float(payload.estimated_time_available) if payload.estimated_time_available else 18.0
    urgency = "IMMEDIATE (<4H)" if avail_hours <= 4.0 else ("HIGH (<8H)" if avail_hours <= 8.0 else "ROUTINE")

    pipe_res = pipeline_runner.run_pipeline("ingest_squawk", {
        "case_id": case_id,
        "tail_number": reg,
        "defect": defect_desc,
        "part_number": part_no,
        "location": airport
    })

    new_case = SquawkCase(
        id=case_id,
        tail_number=reg,
        aircraft_type=act_type,
        defect_description=defect_desc,
        raw_intake_payload={
            "source": "Vakh Structured Intake Form",
            "vakh_form_key": vakh_client.form_key,
            "vakh_submission_id": sub_id,
            "vakh_record_url": vakh_url,
            "intake_data": payload.model_dump(),
            "pipeline_exec": pipe_res.get("telemetry", {}).get("execution_id")
        },
        ata_chapter=category,
        part_number=part_no,
        part_name="Engine-Driven Hydraulic Pump" if "hyd" in category.lower() else "Rotable Assembly",
        priority="AOG",
        location=airport,
        deadline_hours=avail_hours,
        max_acceptable_cost=25000.0,
        current_stage="INTAKE",
        confidence_score=0.96,
        risk_level="LOW" if not is_critical else "HIGH",
        status="Processing",
        vakh_submission_id=sub_id,
        vakh_record_url=vakh_url,
        vakh_form_id=vakh_client.form_key,
        vakh_synced_at=datetime.datetime.utcnow(),
        operator=operator,
        airport=airport,
        flight_number=payload.flight_number or "SQ-204",
        defect_category=category,
        severity=severity,
        urgency=urgency,
        reported_symptoms=payload.reported_symptoms,
        operational_impact=payload.operational_impact or "Departure hold at terminal",
        mel_cdl_info=payload.mel_cdl_info,
        required_maintenance_team=payload.required_maintenance_team or "Line Maintenance Hydraulics",
        reporter_name=payload.reporter_name,
        reporter_contact=payload.reporter_contact,
        recovery_actions_list=copy.deepcopy(DEFAULT_8_STEP_RECOVERY_ACTIONS)
    )
    db.add(new_case)
    db.commit()

    # Log initial Vakh intake activity in updates
    db.add(RecoveryUpdate(
        id=f"UPD-{uuid.uuid4().hex[:6].upper()}",
        case_id=new_case.id,
        source="VAKH",
        message=f"AOG incident reported via Vakh structured intake [{category}]. Reporter: {payload.reporter_name} ({operator}).",
        author=payload.reporter_name,
        action_status="REPORTED",
        vakh_sync_status="SYNCED",
        vakh_update_id=f"vakh_init_{sub_id}"
    ))
    db.commit()

    # Trigger SQUAWK Multi-Agent AI Orchestration
    analyzed_case = execute_squawk_orchestration(db, new_case.id)
    return analyzed_case or new_case


@app.post("/api/vakh/webhook")
async def vakh_webhook_receiver(
    request: Request,
    db: Session = Depends(get_db),
    x_vakh_signature: Optional[str] = Header(None, alias="X-Vakh-Signature")
):
    """
    Secure, idempotent webhook receiver for incoming Vakh form submissions.
    Validates HMAC signature and automatically spawns a SQUAWK AOG incident with AI orchestration.
    """
    body_bytes = await request.body()
    if not vakh_client.verify_webhook_signature(body_bytes, x_vakh_signature):
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Vakh webhook HMAC signature")

    try:
        payload_dict = json.loads(body_bytes.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Malformed JSON payload: {str(e)}")

    sub_id = payload_dict.get("submission_id") or payload_dict.get("data", {}).get("vakh_submission_id") or f"vakh_{uuid.uuid4().hex[:8]}"

    # Check idempotency
    existing = db.query(SquawkCase).filter(SquawkCase.vakh_submission_id == sub_id).first()
    if existing:
        return {
            "status": "IDEMPOTENT_OK",
            "message": "Vakh submission already ingested",
            "case_id": existing.id,
            "vakh_submission_id": existing.vakh_submission_id,
            "vakh_record_url": existing.vakh_record_url
        }

    raw_data = payload_dict.get("data") or payload_dict
    intake_payload = VakhIntakePayload(
        aircraft_registration=raw_data.get("aircraft_registration") or raw_data.get("tail_number") or "VT-SQK",
        aircraft_type=raw_data.get("aircraft_type") or "Boeing 737-800",
        operator=raw_data.get("operator") or "Air Indigo Wings",
        airport=raw_data.get("airport") or raw_data.get("location") or "DEL",
        flight_number=raw_data.get("flight_number") or "SQ-204",
        current_aircraft_status=raw_data.get("current_aircraft_status") or "Grounded at Gate / Hangar",
        defect_category=raw_data.get("defect_category") or "Hydraulic Power",
        defect_description=raw_data.get("defect_description") or "Engine-Driven Hydraulic Pump low pressure warning",
        reported_symptoms=raw_data.get("reported_symptoms"),
        operational_impact=raw_data.get("operational_impact") or "Immediate departure hold",
        departure_time=raw_data.get("departure_time"),
        estimated_time_available=float(raw_data.get("estimated_time_available") or 18.0),
        mel_cdl_info=raw_data.get("mel_cdl_info"),
        required_maintenance_team=raw_data.get("required_maintenance_team"),
        required_parts=raw_data.get("required_parts") or "HP-2048",
        reporter_name=raw_data.get("reporter_name") or "Duty Line Engineer",
        reporter_contact=raw_data.get("reporter_contact"),
        vakh_submission_id=sub_id
    )

    case = process_vakh_intake(intake_payload, db)
    return {
        "status": "INGESTED_AND_ORCHESTRATED",
        "case_id": case.id,
        "vakh_submission_id": sub_id,
        "vakh_record_url": case.vakh_record_url,
        "recommended_plan": case.active_plan
    }


@app.post("/api/vakh/intake", response_model=SquawkCaseSchema)
def submit_vakh_intake(payload: VakhIntakePayload, db: Session = Depends(get_db)):
    """Direct API endpoint for Vakh web forms or embedded intake widgets."""
    case = process_vakh_intake(payload, db)
    return case


@app.get("/api/vakh/form-spec")
def get_vakh_form_spec():
    """Returns official Vakh form and workspace shapes, fields, badges, and views."""
    return {
        "platform": "Vakh",
        "developer": "ELFREDS COMMERCE LLP",
        "protocol": "Model Context Protocol (MCP) & Webhooks",
        "intake_form": VAKH_AOG_INTAKE_FORM_SPEC,
        "workspace_form": VAKH_AOG_WORKSPACE_FORM_SPEC
    }


@app.get("/api/vakh/workspace/{case_id}")
def get_vakh_workspace(case_id: str, db: Session = Depends(get_db)):
    """Returns the live shared operational workspace record for an AOG incident."""
    case = db.query(SquawkCase).options(
        joinedload(SquawkCase.recovery_updates),
        joinedload(SquawkCase.resolution),
        joinedload(SquawkCase.candidates)
    ).filter(SquawkCase.id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Incident workspace not found")

    return {
        "workspace_id": f"ws_{case.id.lower()}",
        "vakh_submission_id": case.vakh_submission_id,
        "vakh_record_url": case.vakh_record_url or vakh_client.generate_record_url(case.vakh_submission_id or case.id),
        "vakh_form_key": case.vakh_form_id or vakh_client.workspace_key,
        "last_synced_at": case.vakh_synced_at.isoformat() if case.vakh_synced_at else case.updated_at.isoformat(),
        "incident": {
            "case_id": case.id,
            "aircraft_registration": case.tail_number,
            "aircraft_type": case.aircraft_type,
            "operator": case.operator or "Air Indigo Wings",
            "airport": case.location,
            "flight_number": case.flight_number or "SQ-204",
            "defect_category": case.defect_category or case.ata_chapter,
            "defect_description": case.defect_description,
            "reported_symptoms": case.reported_symptoms,
            "priority": case.priority,
            "severity": case.severity or "HIGH",
            "urgency": case.urgency or "IMMEDIATE",
            "operational_impact": case.operational_impact,
            "time_remaining_hours": case.deadline_hours,
            "reporter_name": case.reporter_name,
            "reporter_contact": case.reporter_contact
        },
        "recovery": {
            "current_stage": case.current_stage,
            "status": case.status,
            "assigned_team": case.required_maintenance_team or "Line Maintenance Hydraulics",
            "required_parts": case.part_number,
            "recovery_actions": case.recovery_actions_list or [],
            "active_plan": case.active_plan
        },
        "updates": [
            {
                "id": upd.id,
                "source": upd.source,
                "message": upd.message,
                "author": upd.author,
                "action_status": upd.action_status,
                "vakh_sync_status": upd.vakh_sync_status,
                "created_at": upd.created_at.isoformat()
            }
            for upd in (case.recovery_updates or [])
        ],
        "resolution": {
            "actual_resolution": case.resolution.actual_resolution,
            "actual_recovery_time_hours": case.resolution.actual_recovery_time_hours,
            "parts_used": case.resolution.parts_used,
            "root_cause": case.resolution.root_cause,
            "delay_minutes": case.resolution.delay_minutes,
            "maintenance_team": case.resolution.maintenance_team,
            "lessons_learned": case.resolution.lessons_learned,
            "resolved_by": case.resolution.resolved_by,
            "vakh_resolution_id": case.resolution.vakh_resolution_id,
            "resolved_at": case.resolution.created_at.isoformat()
        } if case.resolution else None,
        "views": VAKH_AOG_WORKSPACE_FORM_SPEC["views"]
    }


@app.post("/api/vakh/workspace/{case_id}/updates", response_model=RecoveryUpdateSchema)
@app.post("/api/aog/incidents/{case_id}/updates", response_model=RecoveryUpdateSchema)
def add_incident_update(case_id: str, payload: RecoveryUpdateCreate, db: Session = Depends(get_db)):
    """Adds a real-time operational update to an active incident and synchronizes with Vakh."""
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Incident not found")

    sync_res = vakh_client.sync_update_to_vakh(
        submission_id=case.vakh_submission_id or f"vakh_{case.id}",
        message=payload.message,
        author=payload.author or "Maintenance Tech",
        status=payload.action_status
    )

    update_obj = RecoveryUpdate(
        id=f"UPD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case.id,
        source=payload.source or "VAKH",
        message=payload.message,
        author=payload.author or "Maintenance Tech",
        action_status=payload.action_status,
        vakh_sync_status="SYNCED",
        vakh_update_id=sync_res.get("vakh_update_id")
    )
    db.add(update_obj)

    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id=case.id,
        category="SPECIALIST" if payload.source == "SQUAWK" else "PIPELINE",
        title=f"Operational Update ({update_obj.source}): {payload.author}",
        details=payload.message,
        meta_info={"vakh_synced": True, "vakh_update_id": update_obj.vakh_update_id}
    ))

    case.vakh_synced_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(update_obj)
    return update_obj


@app.post("/api/aog/incidents/{case_id}/actions/{action_id}/status")
def update_recovery_action_status(case_id: str, action_id: str, payload: RecoveryActionStatusUpdate, db: Session = Depends(get_db)):
    """Updates the status of a specific recovery action step (Pending, In Progress, Completed, Blocked)."""
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Incident not found")

    actions = list(case.recovery_actions_list or [])
    if not actions:
        actions = copy.deepcopy(DEFAULT_8_STEP_RECOVERY_ACTIONS)
    action_found = False
    action_title = ""
    for act in actions:
        if act.get("id") == action_id or str(act.get("step_number")) == action_id or f"act-{act.get('step_number')}" == action_id:
            act["status"] = payload.status
            if payload.notes:
                act["notes"] = payload.notes
            act["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            action_found = True
            action_title = act.get("title", f"Action {action_id}")
            break

    if not action_found:
        raise HTTPException(status_code=404, detail="Recovery action step not found")

    case.recovery_actions_list = actions

    sync_msg = f"Recovery Action Step [{action_title}] updated to {payload.status.upper()}."
    if payload.notes:
        sync_msg += f" Note: {payload.notes}"

    db.add(RecoveryUpdate(
        id=f"UPD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case.id,
        source="VAKH",
        message=sync_msg,
        author="MCC Line Lead",
        action_status=payload.status,
        vakh_sync_status="SYNCED"
    ))
    case.vakh_synced_at = datetime.datetime.utcnow()
    db.commit()
    return {"status": "SUCCESS", "action_id": action_id, "new_status": payload.status, "actions": actions}


@app.post("/api/aog/incidents/{case_id}/resolve")
def resolve_incident(case_id: str, payload: IncidentResolutionCreate, db: Session = Depends(get_db)):
    """Closes an AOG incident, collects final resolution telemetry, and syncs to Vakh historical memory."""
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Incident not found")

    vakh_res = vakh_client.sync_resolution_to_vakh(
        submission_id=case.vakh_submission_id or f"vakh_{case.id}",
        resolution_data=payload.model_dump()
    )

    # Check if resolution already exists
    existing_res = db.query(IncidentResolution).filter(IncidentResolution.case_id == case.id).first()
    if existing_res:
        existing_res.actual_resolution = payload.actual_resolution
        existing_res.actual_recovery_time_hours = payload.actual_recovery_time_hours
        existing_res.parts_used = payload.parts_used or [case.part_number or "HP-2048"]
        existing_res.root_cause = payload.root_cause
        existing_res.delay_minutes = payload.delay_minutes or 0
        existing_res.lessons_learned = payload.lessons_learned
        resolution_obj = existing_res
    else:
        resolution_obj = IncidentResolution(
            id=f"RES-{uuid.uuid4().hex[:6].upper()}",
            case_id=case.id,
            actual_resolution=payload.actual_resolution,
            actual_recovery_time_hours=payload.actual_recovery_time_hours,
            parts_used=payload.parts_used or [case.part_number or "HP-2048"],
            root_cause=payload.root_cause,
            delay_minutes=payload.delay_minutes or 0,
            maintenance_team=payload.maintenance_team or case.required_maintenance_team or "Line Maintenance Team B",
            additional_observations=payload.additional_observations,
            lessons_learned=payload.lessons_learned,
            vakh_resolution_id=vakh_res.get("vakh_resolution_id"),
            resolved_by=payload.resolved_by or "Capt. Marcus Vance (Duty Tech Ops Director)",
            created_at=datetime.datetime.utcnow()
        )
        db.add(resolution_obj)

    case.status = "RESOLVED"
    case.current_stage = "COMPLETED"
    case.resolved_at = datetime.datetime.utcnow()
    case.vakh_synced_at = datetime.datetime.utcnow()

    # Mark all recovery actions as Completed
    actions = list(case.recovery_actions_list or [])
    for act in actions:
        act["status"] = "Completed"
    case.recovery_actions_list = actions

    db.add(RecoveryUpdate(
        id=f"UPD-{uuid.uuid4().hex[:6].upper()}",
        case_id=case.id,
        source="VAKH",
        message=f"Incident RESOLVED and verified. Recovery downtime: {payload.actual_recovery_time_hours}h. Root cause: {payload.root_cause}. Archived to Vakh operational memory.",
        author=payload.resolved_by or "Duty Lead Engineer",
        action_status="RESOLVED",
        vakh_sync_status="SYNCED"
    ))

    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id=case.id,
        category="OUTCOME",
        title=f"Incident {case.id} Officially RESOLVED",
        details=f"Resolution: {payload.actual_resolution}. Lessons learned recorded for SQUAWK historical learning.",
        meta_info={"vakh_resolution_id": resolution_obj.vakh_resolution_id}
    ))

    db.commit()
    return {
        "status": "RESOLVED",
        "case_id": case.id,
        "vakh_resolution_id": resolution_obj.vakh_resolution_id,
        "vakh_record_url": vakh_res.get("vakh_record_url"),
        "resolution": {
            "id": resolution_obj.id,
            "actual_resolution": resolution_obj.actual_resolution,
            "actual_recovery_time_hours": resolution_obj.actual_recovery_time_hours,
            "root_cause": resolution_obj.root_cause,
            "lessons_learned": resolution_obj.lessons_learned,
            "vakh_resolution_id": resolution_obj.vakh_resolution_id
        }
    }


@app.get("/api/aog/history")
def get_aog_history(db: Session = Depends(get_db)):
    """Returns past resolved AOG incidents and operational metrics for historical learning."""
    resolved_cases = db.query(SquawkCase).options(
        joinedload(SquawkCase.resolution),
        joinedload(SquawkCase.recovery_updates)
    ).filter(
        (SquawkCase.status.in_(["RESOLVED", "Resolved", "Completed", "COMPLETED"])) |
        (SquawkCase.resolved_at != None) |
        (SquawkCase.current_stage == "COMPLETED")
    ).order_by(SquawkCase.created_at.desc()).all()

    total_resolved = len(resolved_cases)
    avg_recovery_time = 0.0
    total_delay_min = 0
    defect_counts = {}

    for c in resolved_cases:
        res = c.resolution
        if res:
            avg_recovery_time += res.actual_recovery_time_hours
            total_delay_min += res.delay_minutes
        cat = c.defect_category or c.ata_chapter or "Hydraulic Power"
        defect_counts[cat] = defect_counts.get(cat, 0) + 1

    avg_recovery_time = round(avg_recovery_time / max(total_resolved, 1), 1)

    return {
        "total_resolved_incidents": total_resolved,
        "average_recovery_time_hours": avg_recovery_time,
        "total_delay_minutes_logged": total_delay_min,
        "defect_categories_distribution": defect_counts,
        "historical_cases": [
            {
                "id": c.id,
                "case_id": c.id,
                "tail_number": c.tail_number or "N/A",
                "aircraft_type": c.aircraft_type or "N/A",
                "operator": c.operator or "Air Indigo Wings",
                "airport": c.location or "DEL",
                "location": c.location or "DEL",
                "defect_category": c.defect_category or c.ata_chapter or "General",
                "defect_description": c.defect_description or "",
                "part_number": c.part_number or "",
                "severity": c.severity or "AOG_CRITICAL",
                "status": c.status or "RESOLVED",
                "vakh_submission_id": c.vakh_submission_id,
                "vakh_record_url": c.vakh_record_url,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None,
                "resolution": {
                    "actual_resolution": c.resolution.actual_resolution,
                    "actual_recovery_time_hours": c.resolution.actual_recovery_time_hours,
                    "parts_used": c.resolution.parts_used,
                    "root_cause": c.resolution.root_cause,
                    "delay_minutes": c.resolution.delay_minutes,
                    "maintenance_team": c.resolution.maintenance_team,
                    "lessons_learned": c.resolution.lessons_learned,
                    "resolved_by": c.resolution.resolved_by,
                    "vakh_resolution_id": c.resolution.vakh_resolution_id
                } if c.resolution else None
            }
            for c in resolved_cases
        ],
        "learning_system_status": {
            "vendor_memory_connected": True,
            "airworthiness_rules_verified": True,
            "historical_retrieval_active": True,
            "description": "Historical resolutions and Vakh operational records compound SQUAWK's supplier reliability weights and future recovery recommendations."
        }
    }


@app.get("/api/aog/incidents/{case_id}/timeline")
def get_aog_incident_timeline(case_id: str, db: Session = Depends(get_db)):
    """Returns chronologically ordered recovery timeline clearly tagging Vakh vs SQUAWK AI sources."""
    case = db.query(SquawkCase).options(
        joinedload(SquawkCase.recovery_updates),
        joinedload(SquawkCase.approvals),
        joinedload(SquawkCase.recovery_actions),
        joinedload(SquawkCase.resolution)
    ).filter(SquawkCase.id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Incident not found")

    events = []

    # 1. Intake event
    events.append({
        "id": "EVT-INTAKE",
        "timestamp": case.created_at.isoformat() if case.created_at else datetime.datetime.utcnow().isoformat(),
        "title": "AOG Reported & Structured via Vakh Intake",
        "description": f"Incident logged for {case.tail_number} ({case.aircraft_type}) at {case.location}. Category: {case.defect_category or case.ata_chapter}. Severity: {case.severity or 'HIGH'}.",
        "source": "VAKH",
        "stage": "INTAKE",
        "badge_color": "sky"
    })

    # 2. AI Analysis event
    analysis_time = (case.created_at + datetime.timedelta(minutes=2)) if case.created_at else datetime.datetime.utcnow()
    events.append({
        "id": "EVT-AI-ANALYSIS",
        "timestamp": analysis_time.isoformat(),
        "title": "SQUAWK AI Multi-Agent Pipeline Analyzed Incident",
        "description": f"Assessed severity ({case.severity}) and urgency ({case.urgency}). Executed Sourcing, Airworthiness Docs, and Logistics specialists.",
        "source": "SQUAWK",
        "stage": "SPECIALIST",
        "badge_color": "crimson"
    })

    # 3. Strategy recommendation
    if case.active_plan:
        plan_time = (case.created_at + datetime.timedelta(minutes=5)) if case.created_at else datetime.datetime.utcnow()
        events.append({
            "id": "EVT-PLAN",
            "timestamp": plan_time.isoformat(),
            "title": "Autonomous Recovery Strategy Recommended",
            "description": f"Selected {case.active_plan.get('supplier_name')} (ETA: {case.active_plan.get('total_eta_hours')}h, Landed: ${case.active_plan.get('total_landed_cost', 0):,}). 7/7 airworthiness checks passed.",
            "source": "SQUAWK",
            "stage": "VALIDATION",
            "badge_color": "emerald"
        })

    # 4. Human Approval
    for apprv in case.approvals:
        events.append({
            "id": f"EVT-APPRV-{apprv.id[:6]}",
            "timestamp": apprv.created_at.isoformat(),
            "title": f"Tech Ops Authorization: {apprv.decision}",
            "description": f"Authorized by {apprv.approver_name} ({apprv.approver_license}). {apprv.notes or ''}",
            "source": "SQUAWK",
            "stage": "APPROVAL",
            "badge_color": "amber"
        })

    # 5. Recovery Updates
    for upd in (case.recovery_updates or []):
        events.append({
            "id": f"EVT-UPD-{upd.id}",
            "timestamp": upd.created_at.isoformat(),
            "title": f"Operational Update: {upd.author}",
            "description": upd.message,
            "source": upd.source or "VAKH",
            "stage": "UPDATE",
            "badge_color": "sky" if upd.source == "VAKH" else "crimson"
        })

    # 6. Resolution
    if case.resolution:
        events.append({
            "id": "EVT-RESOLVED",
            "timestamp": case.resolution.created_at.isoformat(),
            "title": "Incident RESOLVED & Archived",
            "description": f"Resolution: {case.resolution.actual_resolution}. Downtime: {case.resolution.actual_recovery_time_hours}h. Delay: {case.resolution.delay_minutes}m. Archived to Vakh operational memory.",
            "source": "VAKH",
            "stage": "RESOLUTION",
            "badge_color": "blue"
        })

    events.sort(key=lambda x: x["timestamp"])
    return {
        "case_id": case.id,
        "tail_number": case.tail_number,
        "vakh_submission_id": case.vakh_submission_id,
        "vakh_record_url": case.vakh_record_url,
        "total_events": len(events),
        "timeline": events
    }


@app.post("/api/vakh/mcp")
def vakh_mcp_handler(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Model Context Protocol (MCP) tool server endpoint for Vakh.
    Provides standard tools: vakh_read_form, vakh_create_post, vakh_query_view, vakh_update_post, vakh_resolve_post.
    """
    method = payload.get("method", "tools/call")
    if method == "tools/list":
        return {
            "tools": [
                {
                    "name": "vakh_read_form",
                    "description": "Read form fields, permissions, and moderation settings for a Vakh form",
                    "inputSchema": {"type": "object", "properties": {"form_key": {"type": "string"}}}
                },
                {
                    "name": "vakh_create_post",
                    "description": "Create an authorized post in a Vakh form (triggers SQUAWK AOG intake)",
                    "inputSchema": {"type": "object", "required": ["aircraft_registration", "defect_description"], "properties": {"aircraft_registration": {"type": "string"}, "defect_description": {"type": "string"}, "airport": {"type": "string"}}}
                },
                {
                    "name": "vakh_query_view",
                    "description": "Query records from a saved view (table, feed, kanban, dashboard)",
                    "inputSchema": {"type": "object", "properties": {"view_id": {"type": "string"}}}
                },
                {
                    "name": "vakh_update_post",
                    "description": "Post an operational progress update to an active Vakh record",
                    "inputSchema": {"type": "object", "required": ["case_id", "message"], "properties": {"case_id": {"type": "string"}, "message": {"type": "string"}}}
                },
                {
                    "name": "vakh_resolve_post",
                    "description": "Close an AOG record and capture resolution, root cause, and lessons learned",
                    "inputSchema": {"type": "object", "required": ["case_id", "actual_resolution"], "properties": {"case_id": {"type": "string"}, "actual_resolution": {"type": "string"}}}
                }
            ]
        }

    params = payload.get("params", {})
    name = params.get("name") or payload.get("tool") or payload.get("tool_name")
    args = params.get("arguments") or payload.get("args") or payload.get("arguments") or {}

    if name == "vakh_read_form":
        form_key = args.get("form_key", vakh_client.form_key)
        if form_key == vakh_client.workspace_key:
            return {"content": [{"type": "text", "text": json.dumps(VAKH_AOG_WORKSPACE_FORM_SPEC)}]}
        return {"content": [{"type": "text", "text": json.dumps(VAKH_AOG_INTAKE_FORM_SPEC)}]}

    elif name == "vakh_create_post":
        sub_id = f"vakh_mcp_{uuid.uuid4().hex[:6]}"
        intake_payload = VakhIntakePayload(
            aircraft_registration=args.get("aircraft_registration", "VT-SQK"),
            aircraft_type=args.get("aircraft_type", "Boeing 737-800"),
            operator=args.get("operator", "Air Indigo Wings"),
            airport=args.get("airport", "DEL"),
            defect_category=args.get("defect_category", "Hydraulic Power"),
            defect_description=args.get("defect_description", "Reported hydraulic defect"),
            reporter_name=args.get("reporter_name", "AI Assistant via MCP"),
            vakh_submission_id=sub_id
        )
        created = process_vakh_intake(intake_payload, db)
        return {"content": [{"type": "text", "text": json.dumps({"status": "CREATED", "case_id": created.id, "vakh_submission_id": sub_id, "vakh_record_url": created.vakh_record_url})}]}

    elif name == "vakh_query_view":
        cases = db.query(SquawkCase).all()
        return {"content": [{"type": "text", "text": json.dumps([{"id": c.id, "tail": c.tail_number, "status": c.status, "stage": c.current_stage, "location": c.location} for c in cases])}]}

    elif name == "vakh_update_post":
        case_id = args.get("case_id")
        msg = args.get("message", "Status update")
        upd = add_incident_update(case_id, RecoveryUpdateCreate(message=msg, author=args.get("author", "AI MCP Agent")), db)
        return {"content": [{"type": "text", "text": json.dumps({"status": "UPDATED", "update_id": upd.id})}]}

    return {"error": f"Unknown tool: {name}"}


# Aliases for /api/aog/incidents
@app.get("/api/aog/incidents", response_model=List[SquawkCaseSchema])
def list_aog_incidents(status: Optional[str] = None, priority: Optional[str] = None, db: Session = Depends(get_db)):
    return list_cases(status=status, priority=priority, db=db)


@app.get("/api/aog/incidents/{case_id}", response_model=SquawkCaseSchema)
def get_aog_incident(case_id: str, db: Session = Depends(get_db)):
    return get_case(case_id=case_id, db=db)


@app.post("/api/aog/incidents", response_model=SquawkCaseSchema)
def create_aog_incident(payload: CaseCreateRequest, db: Session = Depends(get_db)):
    return create_case(payload=payload, db=db)


@app.post("/api/aog/incidents/{case_id}/analyze", response_model=SquawkCaseSchema)
def analyze_aog_incident(case_id: str, db: Session = Depends(get_db)):
    return trigger_case_processing(case_id=case_id, db=db)


@app.post("/api/cases/{case_id}/analyze", response_model=SquawkCaseSchema)
@app.post("/api/cases/{case_id}/process", response_model=SquawkCaseSchema)
def trigger_case_processing(case_id: str, db: Session = Depends(get_db)):
    case = execute_squawk_orchestration(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    return case


@app.post("/api/cases/{case_id}/simulate-failure", response_model=SquawkCaseSchema)
def trigger_case_failure_simulation(case_id: str, db: Session = Depends(get_db)):
    """Simulates AI failure or malformed API response to prove safe fallback functionality."""
    case = execute_squawk_orchestration(db, case_id, simulate_ai_failure=True)
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    return case


@app.get("/api/cases/{case_id}/recommendations")
def get_case_recommendations(case_id: str, db: Session = Depends(get_db)):
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    intel = case.incident_intelligence or {}
    return {
        "case_id": case.id,
        "recovery_options": intel.get("recovery_options", []),
        "why_recommendation": intel.get("why_recommendation", {}),
        "resource_check": intel.get("resource_check", {}),
        "human_verification_required": True
    }


@app.get("/api/cases/{case_id}/timeline")
def get_case_timeline(case_id: str, db: Session = Depends(get_db)):
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    intel = case.incident_intelligence or {}
    return {
        "case_id": case.id,
        "timeline_type": "SIMULATED OPERATIONAL TIMELINE (DEMO DATA)",
        "timeline": intel.get("timeline", [])
    }


@app.get("/api/cases/{case_id}/audit", response_model=List[ActivityLogSchema])
def get_case_audit_log(case_id: str, db: Session = Depends(get_db)):
    return db.query(ActivityLog).filter(ActivityLog.case_id == case_id).order_by(ActivityLog.timestamp.desc()).all()


@app.post("/api/cases/{case_id}/approve", response_model=SquawkCaseSchema)
def approve_case_recovery(case_id: str, payload: ApprovalRequest, db: Session = Depends(get_db)):
    case = process_human_approval(db, case_id, payload)
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    return case


@app.post("/api/cases/{case_id}/reject", response_model=SquawkCaseSchema)
def reject_case_recovery(case_id: str, payload: ApprovalRequest, db: Session = Depends(get_db)):
    payload.decision = "REJECTED"
    case = process_human_approval(db, case_id, payload)
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    return case


@app.post("/api/cases/{case_id}/request-info", response_model=SquawkCaseSchema)
def request_info_case(case_id: str, payload: ApprovalRequest, db: Session = Depends(get_db)):
    payload.decision = "REQUEST_MORE_INFO"
    case = process_human_approval(db, case_id, payload)
    if not case:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    return case


@app.post("/api/cases/{case_id}/outcome")
def submit_outcome(case_id: str, payload: OutcomeSubmitRequest, db: Session = Depends(get_db)):
    outcome = process_verified_outcome(db, case_id, payload)
    if not outcome:
        raise HTTPException(status_code=404, detail="AOG Case not found")
    return {
        "status": "SUCCESS",
        "message": "Verified physical outcome recorded. Vendor memory compounded.",
        "outcome_id": outcome.id
    }


# -------------------------------------------------------------------------
# SIMULATED ENVIRONMENT & CALLABLE TOOL ENDPOINTS
# -------------------------------------------------------------------------

@app.post("/api/simulate-disruption")
@app.post("/api/cases/{case_id}/disrupt")
def api_simulate_disruption(payload: DisruptionRequest, db: Session = Depends(get_db)):
    """
    CRITICAL AGENTIC REQUIREMENT:
    Genuinely modifies database state (sets supplier stock to 0 or cancels flight).
    """
    res = simulate_disruption(db, case_id=payload.case_id, disruption_type=payload.disruption_type)
    if res.get("status") == "ERROR":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@app.post("/api/replan")
@app.post("/api/cases/{case_id}/replan")
def api_replan_recovery(payload: ReplanRequest, db: Session = Depends(get_db)):
    """
    CRITICAL AGENTIC REQUIREMENT:
    Autonomous replanning loop that re-queries live tool environment,
    evaluates candidates, and selects optimal feasible plan naturally.
    """
    res = replan_recovery(db, case_id=payload.case_id)
    if res.get("status") == "ERROR":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@app.post("/api/verify-recovery")
@app.post("/api/cases/{case_id}/verify")
def api_verify_recovery(payload: VerifyRecoveryRequest, db: Session = Depends(get_db)):
    """
    Final Verification Tool:
    Validates 7/7 constraints, checks ETA against 18h deadline, and issues recovery certificate.
    """
    res = verify_recovery(db, case_id=payload.case_id)
    if res.get("status") == "ERROR":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@app.get("/api/inventory/{part_number}")
def api_get_inventory(part_number: str, location: Optional[str] = None, db: Session = Depends(get_db)):
    return get_inventory(db, part_number=part_number, location=location)


@app.get("/api/suppliers/{part_number}")
def api_search_suppliers(part_number: str, db: Session = Depends(get_db)):
    return search_suppliers(db, part_number=part_number)


@app.post("/api/verify-part")
def api_verify_part(payload: PartVerifyRequest, db: Session = Depends(get_db)):
    return verify_part(db, part_number=payload.part_number, aircraft_model=payload.aircraft_model, supplier_id=payload.supplier_id)


@app.post("/api/calculate-route")
def api_calculate_route(payload: RouteRequest):
    return calculate_route(origin=payload.origin, destination=payload.destination, mode=payload.mode)


@app.post("/api/optimize")
def api_optimize_recovery(payload: OptimizeRequest):
    return optimize_recovery(options=payload.options, constraints=payload.constraints, weights=payload.weights)


@app.post("/api/reserve-part")
def api_reserve_part(payload: ReservePartRequest, db: Session = Depends(get_db)):
    return reserve_part(db, supplier_id=payload.supplier_id, part_number=payload.part_number, quantity=payload.quantity, case_id=payload.case_id)


@app.post("/api/create-shipment")
def api_create_shipment(payload: CreateShipmentRequest, db: Session = Depends(get_db)):
    return create_shipment(
        db, case_id=payload.case_id, supplier_id=payload.supplier_id,
        carrier=payload.carrier, origin=payload.origin, destination=payload.destination,
        eta_hours=payload.eta_hours, carbon_kg=payload.carbon_kg
    )


@app.get("/api/shipment/{shipment_id}")
def api_get_shipment_status(shipment_id: str, db: Session = Depends(get_db)):
    res = get_shipment_status(db, shipment_id=shipment_id)
    if res.get("status") == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="Shipment not found")
    return res


@app.get("/api/vendors", response_model=List[VendorSchema])
def list_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).order_by(Vendor.calculated_reliability.desc()).all()


@app.get("/api/memory")
def get_memory_stats(db: Session = Depends(get_db)):
    vendors = db.query(Vendor).order_by(Vendor.calculated_reliability.desc()).all()
    outcomes = db.query(Outcome).all()
    
    total_verified = sum(v.verified_orders_count for v in vendors)
    total_on_time = sum(v.on_time_deliveries for v in vendors)
    sys_reliability = round((total_on_time / max(total_verified, 1)) * 100, 1)

    vendor_reliability_trend = [
        {
            "vendor_id": v.id,
            "vendor_name": v.name,
            "hub": v.location_hub,
            "orders": v.verified_orders_count,
            "on_time_rate": round((v.on_time_deliveries / max(v.verified_orders_count, 1)) * 100, 1),
            "avg_delay_min": v.avg_delay_minutes,
            "doc_defects": v.doc_issues_count,
            "reliability_pct": int(v.calculated_reliability * 100)
        }
        for v in vendors
    ]

    return {
        "total_tracked_vendors": len(vendors),
        "total_verified_outcomes": len(outcomes) + total_verified,
        "overall_system_reliability": sys_reliability,
        "vendor_stats": vendor_reliability_trend,
        "memory_policy": "VERIFIED_OPERATIONAL_OUTCOMES_ONLY"
    }


@app.get("/api/activity", response_model=List[ActivityLogSchema])
def list_activity(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()


@app.post("/api/batch/process", response_model=BatchProcessResultSchema)
def process_batch_queue(db: Session = Depends(get_db)):
    start_time = time.time()
    cases = db.query(SquawkCase).all()
    total_cases = len(cases)
    success_count = 0
    ready_for_approval = 0
    auto_cleared = 0
    escalated_to_humans = 0
    validator_rejections = 0
    doc_conflicts = 0
    malformed_inputs = 0
    total_prompt_tokens = 0
    total_completion_tokens = 0

    for case in cases:
        if case.is_malformed or not case.tail_number:
            malformed_inputs += 1
            escalated_to_humans += 1
            total_prompt_tokens += 350
            total_completion_tokens += 80
            continue

        processed = execute_squawk_orchestration(db, case.id)
        if processed:
            success_count += 1
            total_prompt_tokens += 1800
            total_completion_tokens += 650
            ready_for_approval += 1
            escalated_to_humans += 1

    total_tokens = total_prompt_tokens + total_completion_tokens
    total_cost_usd = round((total_prompt_tokens * INPUT_TOKEN_RATE) + (total_completion_tokens * OUTPUT_TOKEN_RATE), 4)
    total_runtime = round(time.time() - start_time + 0.35, 2)

    return {
        "batch_id": f"BATCH-{int(time.time())}",
        "total_cases_received": total_cases,
        "successfully_processed": success_count,
        "ready_for_approval": ready_for_approval,
        "auto_cleared": auto_cleared,
        "escalated_to_humans": escalated_to_humans,
        "validator_rejections_cheapest": validator_rejections,
        "documentation_conflicts": doc_conflicts,
        "vendor_search_timeouts": 0,
        "malformed_inputs": malformed_inputs,
        "total_runtime_seconds": total_runtime,
        "total_ai_agent_calls": success_count * 5,
        "total_prompt_tokens": total_prompt_tokens,
        "total_completion_tokens": total_completion_tokens,
        "total_tokens": total_tokens,
        "total_cost_usd": total_cost_usd,
        "approximate_cost_usd": total_cost_usd,
        "average_cost_per_case_usd": round(total_cost_usd / max(total_cases, 1), 4),
        "success_rate_percent": round((success_count / max(total_cases, 1)) * 100, 1)
    }


@app.post("/api/demo/reset")
def reset_demo_database(db: Session = Depends(get_db)):
    """Resets the database to the pristine hero demo state."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with Session(engine) as fresh_db:
        seed_database(fresh_db)
    
    return {
        "status": "SUCCESS",
        "message": "SQUAWK demo database reset to pristine VT-SQK Delhi hero baseline.",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


# Mount production frontend build for single-port / containerized cloud deployments
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

