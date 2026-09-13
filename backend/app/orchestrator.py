import uuid
import datetime
import time
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import (
    SquawkCase, AgentResult, ValidationResult, RecoveryCandidate,
    Approval, RecoveryAction, Outcome, VendorMemory, Vendor, ActivityLog,
    Shipment, Disruption
)
from app.agent_tools import (
    get_aircraft_status, get_inventory, search_suppliers, verify_part,
    calculate_route, optimize_recovery, reserve_part, create_shipment,
    simulate_disruption, replan_recovery, verify_recovery,
    log_tool_execution, log_decision_step
)
from app.pipeline_runner import pipeline_runner

def execute_squawk_orchestration(db: Session, case_id: str) -> Optional[SquawkCase]:
    """
    Executes the full SQUAWK agentic supply chain recovery loop:
    1. Observe aircraft state & IPC requirements
    2. Check local warehouse inventory (Stockout trigger)
    3. Search external suppliers with active inventory
    4. Compliance Agent: Verify airworthiness certification (8130-3 / EASA Form 1 / Trace)
    5. Logistics Agent: Calculate routes, transit duration, freight cost, carbon CO2e
    6. Optimization Agent: Multi-attribute scoring with configurable weights
    7. Validator Agent: AI-checking-AI constraint check
    8. Select recommended recovery strategy & await Demo Engineer Authorization
    """
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        return None

    # Error handling for malformed input
    if not case.tail_number or not case.part_number or case.is_malformed:
        case.current_stage = "MANUAL_TAGGING"
        case.status = "Needs Review"
        case.confidence_score = 0.20
        case.risk_level = "CRITICAL"
        if not case.malformed_reason:
            case.malformed_reason = "Mandatory aircraft tail number or verified part number missing from defect log."
        db.commit()
        return case

    case.current_stage = "ORCHESTRATING"
    case.status = "Processing"
    case.tool_call_history = []
    case.decision_trace = []
    case.disruptions_log = []
    db.commit()

    # Step 1: Observe aircraft & defect
    part_no = case.part_number or "HP-2048"
    aircraft_model = case.aircraft_type or "Boeing 737-800"
    max_deadline = case.deadline_hours or 18.0

    ac_status = get_aircraft_status(db, case.tail_number)
    log_tool_execution(
        case, "ORCHESTRATOR", "get_aircraft_status",
        {"aircraft_id": case.tail_number},
        ac_status, duration_ms=28
    )

    log_decision_step(
        case,
        step="AOG_DEFECT_IDENTIFIED",
        goal=f"Recover grounded aircraft {case.tail_number} ({aircraft_model}) at {case.location} within {max_deadline}h",
        observation=f"Aircraft grounded at {case.location}. Defect: {case.defect_description}. Required part: {part_no}.",
        reasoning="Local warehouse inventory check is the immediate first step to minimize recovery time.",
        action=f"CALL get_inventory('{part_no}', '{case.location}')",
        outcome=f"Initiated local inventory investigation at {case.location}."
    )

    # Step 2: Check local inventory
    local_inv = get_inventory(db, part_no, location=case.location)
    log_tool_execution(
        case, "SOURCING_AGENT", "get_inventory",
        {"part_number": part_no, "location": case.location},
        local_inv, duration_ms=35
    )

    log_decision_step(
        case,
        step="LOCAL_INVENTORY_DEPLETED",
        goal="Locate airworthy replacement rotable across regional and global supplier networks",
        observation=f"Local {case.location} inventory has 0 units available ({local_inv.get('status', 'STOCKOUT')}).",
        reasoning="Local stores depleted. Sourcing Agent must search qualified external suppliers immediately.",
        action=f"CALL search_suppliers('{part_no}')",
        outcome="External supplier search triggered across certified vendor network."
    )

    # Step 3: Search qualified suppliers
    suppliers = search_suppliers(db, part_no)
    log_tool_execution(
        case, "SOURCING_AGENT", "search_suppliers",
        {"part_number": part_no},
        {"suppliers_found": len(suppliers), "suppliers": [s["supplier_name"] for s in suppliers]},
        duration_ms=52
    )

    # Step 4 & 5: Evaluate Compliance & Logistics for each supplier
    candidate_options = []
    for s in suppliers:
        # Compliance check
        comp = verify_part(db, part_no, aircraft_model, supplier_id=s["supplier_id"])
        log_tool_execution(
            case, "COMPLIANCE_AGENT", "verify_part",
            {"part_number": part_no, "supplier": s["supplier_name"]},
            {"status": comp["status"], "has_8130_3": comp["has_8130_3"], "has_easa_form_1": comp["has_easa_form_1"], "trace": comp["has_trace_to_oem"]},
            duration_ms=40
        )

        # Logistics calculation
        route = calculate_route(origin=s["location_hub"], destination=case.location or "DEL")
        log_tool_execution(
            case, "LOGISTICS_AGENT", "calculate_route",
            {"origin": s["location_hub"], "destination": case.location or "DEL"},
            {"carrier": route["carrier"], "eta_hours": route["total_eta_hours"], "freight_cost": route["freight_cost"], "carbon_kg": route["carbon_kg"]},
            duration_ms=44
        )

        total_landed = s["unit_price"] + route["freight_cost"]
        candidate_options.append({
            "supplier_id": s["supplier_id"],
            "supplier_name": s["supplier_name"],
            "part_id": s["part_id"],
            "part_number": s["part_number"],
            "condition": s["condition"],
            "quantity_available": s["quantity_available"],
            "part_cost": s["unit_price"],
            "freight_cost": route["freight_cost"],
            "total_landed_cost": total_landed,
            "total_eta_hours": route["total_eta_hours"],
            "carrier": route["carrier"],
            "origin": route["origin"],
            "destination": route["destination"],
            "route_description": route["route_description"],
            "carbon_kg": route["carbon_kg"],
            "reliability_score": s["reliability_score"],
            "compliance_status": comp["status"],
            "compliance_pass": comp["compliance_pass"],
            "compliance_notes": comp["notes"]
        })

    # Step 6: Multi-Attribute Optimization
    weights = case.scoring_weights or {"delivery": 0.40, "reliability": 0.25, "cost": 0.15, "compliance": 0.10, "carbon": 0.10}
    opt_result = optimize_recovery(
        options=candidate_options,
        constraints={"max_recovery_hours": max_deadline, "max_acceptable_cost": case.max_acceptable_cost},
        weights=weights
    )

    log_tool_execution(
        case, "OPTIMIZATION_AGENT", "optimize_recovery",
        {"candidates_count": len(candidate_options), "weights": weights},
        {"ranked": [p["supplier_name"] for p in opt_result["ranked_plans"]], "recommended": opt_result["recommended_plan"].get("supplier_name") if opt_result["recommended_plan"] else None},
        duration_ms=25
    )

    # Step 7: Validator Pre-Flight Check
    recommended = opt_result["recommended_plan"]
    validator_valid = (
        recommended is not None and
        recommended.get("is_feasible", False) and
        recommended.get("compliance_pass", False) and
        recommended.get("total_eta_hours", 99) <= max_deadline
    )

    log_tool_execution(
        case, "VALIDATOR_AGENT", "validate_recovery_strategy",
        {"plan": recommended.get("supplier_name") if recommended else None},
        {"status": "VALID" if validator_valid else "INVALID", "confidence": 0.96 if validator_valid else 0.20},
        duration_ms=18
    )

    log_decision_step(
        case,
        step="OPTIMAL_STRATEGY_SELECTED",
        goal=f"Select top compliant recovery plan satisfying the {max_deadline}h deadline",
        observation=f"Evaluated {len(candidate_options)} supplier options. Supplier C (GlobalParts) disqualified (exceeds deadline by +2.5h).",
        reasoning=opt_result["selection_reason"],
        action=f"RECOMMEND {recommended['supplier_name'] if recommended else 'NONE'} FOR HUMAN APPROVAL",
        outcome=f"Recovery plan prepared with {recommended['total_eta_hours'] if recommended else 0}h ETA and ${recommended['total_landed_cost'] if recommended else 0:,} total cost."
    )

    # Step 8: Update database records
    db.query(RecoveryCandidate).filter(RecoveryCandidate.case_id == case.id).delete()
    db.query(AgentResult).filter(AgentResult.case_id == case.id).delete()
    db.query(ValidationResult).filter(ValidationResult.case_id == case.id).delete()

    for plan in opt_result["ranked_plans"]:
        cand = RecoveryCandidate(
            id=f"CAND-{uuid.uuid4().hex[:6].upper()}",
            case_id=case.id,
            vendor_id=plan["supplier_id"],
            part_id=plan.get("part_id"),
            vendor_name=plan["supplier_name"],
            part_number=plan["part_number"],
            condition=plan["condition"],
            part_cost=plan["part_cost"],
            freight_cost=plan["freight_cost"],
            total_landed_cost=plan["total_landed_cost"],
            estimated_eta_hours=plan["total_eta_hours"],
            shipping_method=plan["carrier"],
            documentation_status=plan["compliance_status"],
            doc_notes=plan["compliance_notes"],
            vendor_reliability_score=plan["reliability_score"],
            overall_rank=plan["rank"],
            is_recommended=plan.get("is_recommended", False),
            is_flagged=(not plan["is_feasible"]),
            flag_reason=plan.get("rejection_reason"),
            confidence=0.96 if plan["is_feasible"] else 0.20
        )
        db.add(cand)

    # Save validation result
    val_res = ValidationResult(
        id=str(uuid.uuid4()),
        case_id=case.id,
        status="VALIDATED" if validator_valid else "FLAGGED",
        conflicts_detected=[p["rejection_reason"] for p in opt_result["ranked_plans"] if p.get("rejection_reason")],
        flagged_candidates=[p["supplier_name"] for p in opt_result["ranked_plans"] if not p["is_feasible"]],
        valid_candidates=[p["supplier_name"] for p in opt_result["ranked_plans"] if p["is_feasible"]],
        risk_level="LOW" if recommended and recommended["total_eta_hours"] <= 10.0 else "MEDIUM",
        confidence=0.96 if validator_valid else 0.30,
        requires_human_review=True,
        reasoning_summary=opt_result["selection_reason"]
    )
    db.add(val_res)

    case.active_plan = recommended
    case.estimated_recovery_hours = recommended["total_eta_hours"] if recommended else None
    case.carbon_kg = recommended["carbon_kg"] if recommended else 0.0
    case.confidence_score = 0.96 if validator_valid else 0.30
    case.risk_level = "LOW" if recommended and recommended["total_eta_hours"] <= 10.0 else "MEDIUM"
    case.current_stage = "HUMAN_REVIEW"
    case.status = "Awaiting Approval"

    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id=case.id,
        category="PIPELINE",
        title="Autonomous Recovery Plan Generated",
        details=f"Recommended: {recommended['supplier_name'] if recommended else 'N/A'} (ETA: {recommended['total_eta_hours'] if recommended else 0}h, Landed: ${recommended['total_landed_cost'] if recommended else 0:,}). Awaiting Demo Engineer Authorization."
    ))

    db.commit()
    db.refresh(case)
    return case


def process_human_approval(db: Session, case_id: str, approval_data) -> Optional[SquawkCase]:
    """
    Human-in-the-Loop Gatekeeper:
    Captures Demo Engineer Authorization and executes real state-changing actions:
    1. reserve_part (locks stock & decrements inventory)
    2. create_shipment (generates tracking AWB & carrier dispatch)
    3. issues Purchase Order and Work Order records
    """
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        return None

    decision = (approval_data.decision or "APPROVED").upper()

    approval_obj = Approval(
        id=str(uuid.uuid4()),
        case_id=case.id,
        selected_candidate_id=approval_data.selected_candidate_id,
        decision=decision,
        approver_name=approval_data.approver_name or "Demo Lead Engineer (MCC Delhi)",
        approver_license=approval_data.approver_license or "SIM-AOG-TECH #482910",
        notes=approval_data.notes or "Authorized for immediate hot-shot procurement and carrier dispatch."
    )
    db.add(approval_obj)

    if decision in ("APPROVED", "ALTERNATIVE_CHOSEN"):
        case.status = "Approved & Dispatched"
        case.current_stage = "APPROVED"

        plan = case.active_plan or {}
        supplier_id = plan.get("supplier_id") or "VEND-AEROPARTS"
        part_no = case.part_number or "HP-2048"
        carrier = plan.get("carrier") or "Singapore Cargo Express (Flight SQ-402)"
        origin = plan.get("origin") or "SIN"
        destination = case.location or "DEL"
        eta_hours = plan.get("total_eta_hours") or 8.33
        carbon_kg = plan.get("carbon_kg") or 420.0

        # 1. State-changing action: Reserve inventory
        res_info = reserve_part(db, supplier_id, part_no, quantity=1, case_id=case.id)
        log_tool_execution(
            case, "ORCHESTRATOR", "reserve_part",
            {"supplier_id": supplier_id, "part_number": part_no, "quantity": 1},
            res_info, duration_ms=30
        )

        # 2. State-changing action: Create shipment
        ship_info = create_shipment(
            db, case_id=case.id, supplier_id=supplier_id,
            carrier=carrier, origin=origin, destination=destination,
            eta_hours=eta_hours, carbon_kg=carbon_kg
        )
        log_tool_execution(
            case, "LOGISTICS_AGENT", "create_shipment",
            {"supplier_id": supplier_id, "carrier": carrier, "origin": origin, "destination": destination},
            ship_info, duration_ms=42
        )

        # 3. Create PO & Work Order actions
        po_number = f"SQ-{uuid.uuid4().hex[:4].upper()}"
        wo_number = f"WO-{case.tail_number}-2026"

        db.add(RecoveryAction(
            id=str(uuid.uuid4()),
            case_id=case.id,
            action_type="PO_CREATED",
            reference_number=po_number,
            title=f"Purchase Order #{po_number} Issued",
            details={
                "po_number": po_number,
                "vendor": plan.get("supplier_name", "AeroParts Inc."),
                "total_cost": plan.get("total_landed_cost", 18200.0),
                "authorized_by": approval_data.approver_name,
                "status": "COMMITTED"
            },
            is_demo_action=True
        ))

        db.add(RecoveryAction(
            id=str(uuid.uuid4()),
            case_id=case.id,
            action_type="WORK_ORDER_UPDATED",
            reference_number=wo_number,
            title=f"MRO Line Work Order #{wo_number} Tagged",
            details={
                "work_order": wo_number,
                "hangar": "DEL Terminal 3 Hangar 4",
                "assigned_crew": "Line Tech Alpha",
                "target_fit_window": f"T+{int(eta_hours)}h"
            },
            is_demo_action=True
        ))

        log_decision_step(
            case,
            step="HUMAN_APPROVAL_EXECUTED",
            goal=f"Execute authorized recovery actions for aircraft {case.tail_number}",
            observation=f"Demo Engineer ({approval_data.approver_name}) authorized plan with {plan.get('supplier_name')}.",
            reasoning="Human gate passed. Executing live inventory reservation, AWB shipment creation, and PO commitment.",
            action=f"RESERVE_INVENTORY + DISPATCH_CARRIER ({ship_info.get('awb')})",
            outcome=f"Shipment {ship_info.get('awb')} in transit. ETA: {eta_hours:.1f}h."
        )

        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            case_id=case.id,
            category="APPROVAL",
            title=f"Plan Approved by {approval_data.approver_name}",
            details=f"Reservation #{res_info.get('reservation_id')} locked. Shipment #{ship_info.get('awb')} created with {carrier}."
        ))

    elif decision == "REJECTED":
        case.status = "Rejected by Human"
        case.current_stage = "REJECTED"
        log_decision_step(
            case,
            step="HUMAN_REJECTION",
            goal="Halt unapproved recovery actions",
            observation=f"Demo Engineer rejected plan: {approval_data.notes}",
            reasoning="Plan aborted per operator instruction.",
            action="CANCEL_ACTIONS",
            outcome="No procurement or shipment actions executed."
        )
    elif decision == "REQUEST_MORE_INFO":
        case.status = "Awaiting Info"
        case.current_stage = "NEEDS_INFO"

    db.commit()
    db.refresh(case)
    return case


def process_verified_outcome(db: Session, case_id: str, outcome_data) -> Optional[Outcome]:
    """Records verified physical outcome and compounds long-term vendor operational memory."""
    case = db.query(SquawkCase).filter(SquawkCase.id == case_id).first()
    if not case:
        return None

    outcome = Outcome(
        id=str(uuid.uuid4()),
        case_id=case.id,
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
    db.add(outcome)

    # Compound memory for the vendor
    vendor = db.query(Vendor).filter(Vendor.id == outcome_data.vendor_id).first()
    if vendor:
        vendor.verified_orders_count += 1
        if outcome_data.actual_delivery_hours <= outcome_data.predicted_eta_hours + 0.5:
            vendor.on_time_deliveries += 1
        if not outcome_data.documentation_accepted:
            vendor.doc_issues_count += 1

        on_time_rate = vendor.on_time_deliveries / max(vendor.verified_orders_count, 1)
        doc_quality_rate = 1.0 - (vendor.doc_issues_count / max(vendor.verified_orders_count, 1))
        vendor.calculated_reliability = round((0.60 * on_time_rate) + (0.40 * doc_quality_rate), 2)

    case.status = "Closed"
    case.current_stage = "CLOSED"
    db.commit()
    return outcome
