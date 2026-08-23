import uuid
import datetime
from sqlalchemy.orm import Session
from app.models import (
    SquawkCase, AgentResult, ValidationResult, RecoveryCandidate,
    Approval, RecoveryAction, Outcome, VendorMemory, Vendor, ActivityLog
)
from app.specialists import SourcingSpecialist, DocumentationSpecialist, LogisticsSpecialist
from app.validator import ValidatorAgent, RecommendationEngine
from app.pipeline_runner import pipeline_runner

sourcing_specialist = SourcingSpecialist()
doc_specialist = DocumentationSpecialist()
logistics_specialist = LogisticsSpecialist()
validator_agent = ValidatorAgent()
recommendation_engine = RecommendationEngine()

def execute_squawk_orchestration(db: Session, case_id: str):
    """
    Executes the full RocketRide SQUAWK orchestration workflow:
    1. Parse/Validate
    2. Parallel Specialists (Sourcing, Documentation, Logistics)
    3. Validator (AI Checking AI)
    4. Recommendation Engine
    5. Gate for Human Decision
    """
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        return None

    # Step 1: Input Validation
    if not case.tail_number or not case.part_number or case.is_malformed:
        case.current_stage = "MANUAL_TAGGING"
        case.status = "Needs Review"
        case.confidence_score = 0.25
        case.risk_level = "CRITICAL"
        if not case.malformed_reason:
            case.malformed_reason = "Mandatory aircraft tail number or verified part number missing."
        db.commit()

        # Log activity
        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            case_id=case.id,
            category="PIPELINE",
            title="Escalated to Operations Queue",
            details=f"Case {case.id} lacks required fields. {case.malformed_reason}"
        ))
        db.commit()
        return case

    # Update Stage to Processing
    case.current_stage = "SPECIALIST_ROUTING"
    case.status = "Processing"
    db.commit()

    # Step 2: Trigger RocketRide Pipeline Run
    rr_res = pipeline_runner.run_pipeline("source_recovery", {"case_id": case.id, "part_number": case.part_number})

    # Step 3: Run Specialists in Parallel
    sourcing_output = sourcing_specialist.process(db, case)
    doc_output = doc_specialist.process(db, case, sourcing_output)
    logistics_output = logistics_specialist.process(db, case, sourcing_output)

    # Clear old results if re-processing
    db.query(AgentResult).filter(AgentResult.case_id == case.id).delete()
    db.query(RecoveryCandidate).filter(RecoveryCandidate.case_id == case.id).delete()
    db.query(ValidationResult).filter(ValidationResult.case_id == case.id).delete()

    # Save specialist outputs
    db.add(AgentResult(
        id=str(uuid.uuid4()),
        case_id=case.id,
        specialist_name="Sourcing Specialist",
        status="COMPLETED",
        confidence=sourcing_output["confidence"],
        raw_output=sourcing_output,
        execution_time_ms=sourcing_output["execution_ms"]
    ))
    db.add(AgentResult(
        id=str(uuid.uuid4()),
        case_id=case.id,
        specialist_name="Documentation Specialist",
        status="COMPLETED",
        confidence=doc_output["confidence"],
        raw_output=doc_output,
        execution_time_ms=doc_output["execution_ms"]
    ))
    db.add(AgentResult(
        id=str(uuid.uuid4()),
        case_id=case.id,
        specialist_name="Logistics Specialist",
        status="COMPLETED",
        confidence=logistics_output["confidence"],
        raw_output=logistics_output,
        execution_time_ms=logistics_output["execution_ms"]
    ))

    # Step 4: Validator AI Checking AI
    val_output = validator_agent.validate(db, case, sourcing_output, doc_output, logistics_output)

    db.add(ValidationResult(
        id=str(uuid.uuid4()),
        case_id=case.id,
        status=val_output["status"],
        conflicts_detected=val_output["conflicts_detected"],
        flagged_candidates=val_output["flagged_candidates"],
        valid_candidates=val_output["valid_candidates"],
        risk_level=val_output["risk_level"],
        confidence=val_output["confidence"],
        requires_human_review=val_output["requires_human_review"],
        reasoning_summary=val_output["reasoning_summary"]
    ))

    # Step 5: Recommendation Engine Ranking
    ranked_candidates = recommendation_engine.rank_and_score(val_output)

    for cand_data in ranked_candidates:
        db.add(RecoveryCandidate(
            id=str(uuid.uuid4()),
            case_id=case.id,
            vendor_id=cand_data["vendor_id"],
            part_id=cand_data.get("part_id"),
            vendor_name=cand_data["vendor_name"],
            part_number=cand_data["part_number"],
            condition=cand_data["condition"],
            part_cost=cand_data["part_cost"],
            freight_cost=cand_data["freight_cost"],
            total_landed_cost=cand_data["total_landed_cost"],
            estimated_eta_hours=cand_data["estimated_eta_hours"],
            shipping_method=cand_data["shipping_method"],
            documentation_status=cand_data["documentation_status"],
            doc_notes=cand_data.get("doc_notes"),
            vendor_reliability_score=cand_data["vendor_reliability_score"],
            overall_rank=cand_data["overall_rank"],
            is_recommended=cand_data["is_recommended"],
            is_flagged=cand_data["is_flagged"],
            flag_reason=cand_data.get("flag_reason"),
            confidence=cand_data["confidence"]
        ))

    # Update case final status
    case.confidence_score = val_output["confidence"]
    case.risk_level = val_output["risk_level"]
    case.current_stage = "HUMAN_REVIEW"
    case.status = "Awaiting Approval"
    
    # Set estimated recovery hours from top candidate
    top_cand = next((c for c in ranked_candidates if c["is_recommended"]), None)
    if top_cand:
        case.estimated_recovery_hours = top_cand["estimated_eta_hours"]
    elif ranked_candidates:
        case.estimated_recovery_hours = ranked_candidates[0]["estimated_eta_hours"]

    # Log activities
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id=case.id,
        category="SPECIALIST",
        title="Parallel Specialists Completed",
        details=f"Sourcing ({len(sourcing_output['candidates'])} found), Docs checked, Logistics computed."
    ))
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id=case.id,
        category="VALIDATOR",
        title="Validator Reconciled Candidates",
        details=val_output["reasoning_summary"]
    ))
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id=case.id,
        category="APPROVAL",
        title="Awaiting Tech Ops Approval",
        details=f"Case {case.id} routed to human controller for authorization."
    ))

    db.commit()
    db.refresh(case)
    return case


def process_human_approval(db: Session, case_id: str, approval_data) -> SquawkCase:
    """
    Records human decision and generates real-world simulated recovery actions.
    """
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        return None

    decision = approval_data.decision.upper()
    
    # Record approval
    approval_obj = Approval(
        id=str(uuid.uuid4()),
        case_id=case.id,
        selected_candidate_id=approval_data.selected_candidate_id,
        decision=decision,
        approver_name=approval_data.approver_name,
        approver_license=approval_data.approver_license,
        notes=approval_data.notes
    )
    db.add(approval_obj)

    if decision in ("APPROVED", "ALTERNATIVE_CHOSEN"):
        case.status = "Approved"
        case.current_stage = "APPROVED"

        # Generate simulated real-world actions
        po_number = f"SQ-{uuid.uuid4().hex[:4].upper()}"
        actions = [
            RecoveryAction(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action_type="PO_CREATED",
                reference_number=po_number,
                title=f"Purchase Request #{po_number} Created",
                details={"po_number": po_number, "status": "ISSUED", "authorized_by": approval_data.approver_name},
                is_demo_action=True
            ),
            RecoveryAction(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action_type="VENDOR_DISPATCHED",
                reference_number=f"DSP-{uuid.uuid4().hex[:4].upper()}",
                title="Vendor Priority AOG Request Sent",
                details={"channel": "EDI/AOG Desk Dispatch", "priority": "CRITICAL"},
                is_demo_action=True
            ),
            RecoveryAction(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action_type="OPS_NOTIFIED",
                reference_number=f"NOTIF-{case.tail_number}",
                title="Line Maintenance Operations Team Notified",
                details={"station": case.location, "aircraft": case.tail_number, "gate_hold": True},
                is_demo_action=True
            ),
            RecoveryAction(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action_type="WORK_ORDER_UPDATED",
                reference_number=f"WO-{case.tail_number}-2026",
                title=f"Work Order WO-{case.tail_number} Updated with Tracking ID",
                details={"status": "AWAITING_PARTS_COURIER"},
                is_demo_action=True
            )
        ]
        for a in actions:
            db.add(a)

        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            case_id=case.id,
            category="ACTION",
            title=f"Recovery Approved — PO #{po_number} Generated",
            details=f"Authorized by {approval_data.approver_name} ({approval_data.approver_license}). Simulated dispatch actions created."
        ))

    elif decision == "REJECTED":
        case.status = "Rejected"
        case.current_stage = "REJECTED"
        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            case_id=case.id,
            category="APPROVAL",
            title="Recovery Recommendation Rejected",
            details=f"Rejected by {approval_data.approver_name}. Notes: {approval_data.notes or 'No notes provided'}"
        ))

    elif decision == "REQUEST_MORE_INFO":
        case.status = "Needs Review"
        case.current_stage = "SPECIALIST_ROUTING"
        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            case_id=case.id,
            category="APPROVAL",
            title="Operator Requested Additional Info",
            details=f"Re-routing to engineering investigation. Notes: {approval_data.notes or 'None'}"
        ))

    db.commit()
    db.refresh(case)
    return case


def process_verified_outcome(db: Session, case_id: str, outcome_data) -> Outcome:
    """
    Closes the loop by updating Vendor Memory with verified physical results.
    """
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        return None

    # Step 1: Run RocketRide outcome_tracker pipeline
    pipeline_runner.run_pipeline("outcome_tracker", {
        "case_id": case_id,
        "vendor_id": outcome_data.vendor_id,
        "actual_eta": outcome_data.actual_delivery_hours
    })

    # Step 2: Record Outcome
    outcome_obj = Outcome(
        id=str(uuid.uuid4()),
        case_id=case_id,
        vendor_id=outcome_data.vendor_id,
        predicted_eta_hours=outcome_data.predicted_eta_hours,
        actual_delivery_hours=outcome_data.actual_delivery_hours,
        predicted_cost=outcome_data.predicted_cost,
        actual_cost=outcome_data.actual_cost,
        documentation_accepted=outcome_data.documentation_accepted,
        recovery_successful=outcome_data.recovery_successful,
        vendor_performance_rating=outcome_data.vendor_performance_rating,
        operator_notes=outcome_data.operator_notes
    )
    db.add(outcome_obj)

    # Step 3: Update Vendor & VendorMemory models
    vendor = db.query(Vendor).filter(Vendor.id == outcome_data.vendor_id).first()
    memory = db.query(VendorMemory).filter(VendorMemory.vendor_id == outcome_data.vendor_id).first()

    if vendor:
        vendor.verified_orders_count += 1
        is_on_time = outcome_data.actual_delivery_hours <= (outcome_data.predicted_eta_hours + 0.5)
        if is_on_time:
            vendor.on_time_deliveries += 1
        
        delay_min = max(0.0, (outcome_data.actual_delivery_hours - outcome_data.predicted_eta_hours) * 60)
        vendor.avg_delay_minutes = round((vendor.avg_delay_minutes * (vendor.verified_orders_count - 1) + delay_min) / vendor.verified_orders_count, 1)
        
        if not outcome_data.documentation_accepted:
            vendor.doc_issues_count += 1
        
        # Calculate new reliability percentage
        reliability = (vendor.on_time_deliveries / vendor.verified_orders_count) * (0.85 if vendor.doc_issues_count > 0 else 1.0)
        vendor.calculated_reliability = round(min(1.0, max(0.20, reliability)), 2)

        if memory:
            memory.total_orders = vendor.verified_orders_count
            memory.on_time_deliveries = vendor.on_time_deliveries
            memory.avg_delay_minutes = vendor.avg_delay_minutes
            memory.documentation_defects = vendor.doc_issues_count
            memory.reliability_score = vendor.calculated_reliability
            memory.last_updated = datetime.datetime.utcnow()

    # Step 4: Mark case as closed
    case.status = "Closed"
    case.current_stage = "COMPLETED"

    # Step 5: Add log
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id=case.id,
        category="OUTCOME",
        title="Verified Operational Outcome Logged",
        details=f"Vendor memory updated for {vendor.name if vendor else outcome_data.vendor_id}. New reliability score: {int(vendor.calculated_reliability * 100 if vendor else 90)}%."
    ))

    db.commit()
    return outcome_obj
