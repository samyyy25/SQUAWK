import uuid
import datetime
from sqlalchemy.orm import Session
from app.models import (
    Aircraft, Vendor, Part, PartDocument, SquawkCase,
    RecoveryCandidate, AgentResult, ValidationResult,
    Approval, RecoveryAction, Outcome, VendorMemory, ActivityLog
)

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Aircraft).count() > 0:
        return

    print("[INFO] Seeding SQUAWK database with realistic AOG dataset...")

    # 1. Seed Aircraft
    aircraft_list = [
        Aircraft(tail_number="VT-SQK", aircraft_type="Boeing 737-800", operator="Air Indigo Wings", home_base="DEL", current_location="DEL"),
        Aircraft(tail_number="N42Q", aircraft_type="Boeing 737-800", operator="Skyline Airways", home_base="ORD", current_location="ORD"),
        Aircraft(tail_number="N18AX", aircraft_type="Airbus A320-200", operator="TransGlobal Express", home_base="DFW", current_location="DFW"),
        Aircraft(tail_number="N72LK", aircraft_type="Boeing 777-300ER", operator="Pacific Horizon", home_base="LAX", current_location="LAX"),
        Aircraft(tail_number="N905AA", aircraft_type="Boeing 787-9", operator="Apex Airlines", home_base="MIA", current_location="MIA"),
        Aircraft(tail_number="N311VA", aircraft_type="Airbus A321neo", operator="CoastAir", home_base="JFK", current_location="JFK"),
        Aircraft(tail_number="N540UA", aircraft_type="Embraer E175", operator="RegionalLink", home_base="DEN", current_location="DEN"),
        Aircraft(tail_number="N882DL", aircraft_type="Airbus A350-900", operator="GlobalWings", home_base="ATL", current_location="ATL"),
    ]
    for a in aircraft_list:
        db.add(a)
    db.commit()

    # 2. Seed Vendors
    vendors_data = [
        {
            "id": "VEND-AEROPARTS",
            "name": "AeroParts Inc. (Singapore)",
            "location_hub": "SIN",
            "cage_code": "1K489",
            "base_rating": 0.96,
            "verified_orders_count": 28,
            "on_time_deliveries": 27,
            "avg_delay_minutes": 18.0,
            "doc_issues_count": 0,
            "calculated_reliability": 0.96,
            "contact_email": "aog.sin@aeroparts.aero",
            "contact_aog_desk": "+65 6788 0100"
        },
        {
            "id": "VEND-SKYSUPPLY",
            "name": "SkySupply Global (Mumbai Hub)",
            "location_hub": "BOM",
            "cage_code": "9X102",
            "base_rating": 0.91,
            "verified_orders_count": 24,
            "on_time_deliveries": 22,
            "avg_delay_minutes": 35.0,
            "doc_issues_count": 1,
            "calculated_reliability": 0.91,
            "contact_email": "desk.bom@skysupply.aero",
            "contact_aog_desk": "+91 22 6688 0400"
        },
        {
            "id": "VEND-GLOBAL",
            "name": "GlobalParts Aviation GmbH",
            "location_hub": "FRA",
            "cage_code": "7G231",
            "base_rating": 0.84,
            "verified_orders_count": 18,
            "on_time_deliveries": 15,
            "avg_delay_minutes": 120.0,
            "doc_issues_count": 2,
            "calculated_reliability": 0.84,
            "contact_email": "aog@globalparts.de",
            "contact_aog_desk": "+49 69 555-0810"
        },
        {
            "id": "VEND-APEX",
            "name": "Apex Rotables & Spares",
            "location_hub": "DFW",
            "cage_code": "3C994",
            "base_rating": 0.93,
            "verified_orders_count": 22,
            "on_time_deliveries": 21,
            "avg_delay_minutes": 25.0,
            "doc_issues_count": 0,
            "calculated_reliability": 0.93,
            "contact_email": "priority@apexrotables.com",
            "contact_aog_desk": "+1 (972) 555-APEX"
        },
        {
            "id": "VEND-JETC",
            "name": "JetComponent Express",
            "location_hub": "LAX",
            "cage_code": "4M551",
            "base_rating": 0.86,
            "verified_orders_count": 14,
            "on_time_deliveries": 12,
            "avg_delay_minutes": 55.0,
            "doc_issues_count": 1,
            "calculated_reliability": 0.86,
            "contact_email": "orders@jetcomponent.com",
            "contact_aog_desk": "+1 (310) 555-JETC"
        }
    ]

    for v in vendors_data:
        vendor_obj = Vendor(**v)
        db.add(vendor_obj)
        db.add(VendorMemory(
            id=str(uuid.uuid4()),
            vendor_id=v["id"],
            total_orders=v["verified_orders_count"],
            on_time_deliveries=v["on_time_deliveries"],
            avg_delay_minutes=v["avg_delay_minutes"],
            documentation_defects=v["doc_issues_count"],
            reliability_score=v["calculated_reliability"]
        ))
    db.commit()

    # 3. Seed Rotable Parts
    parts_data = [
        # HP-2048 (Flagship Hero Part)
        {
            "id": "PART-HP2048-AERO",
            "part_number": "HP-2048",
            "alternate_part_numbers": ["HP-2048-1", "HP-2048A"],
            "description": "Engine-Driven Hydraulic Pump Assembly (EDP)",
            "ata_chapter": "29 - Hydraulic Power",
            "vendor_id": "VEND-AEROPARTS",
            "condition": "Factory New",
            "quantity_available": 2,
            "unit_price": 14900.0,
            "currency": "USD",
            "warehouse_location": "SIN / Changi Cargo Hub Bay 4",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-EDP-88410",
            "tags_notes": "Dual Release (FAA 8130-3 + EASA Form 1) with 121 OEM birth certificate."
        },
        {
            "id": "PART-HP2048-SKY",
            "part_number": "HP-2048",
            "alternate_part_numbers": ["HP-2048-1"],
            "description": "Engine-Driven Hydraulic Pump Assembly (EDP)",
            "ata_chapter": "29 - Hydraulic Power",
            "vendor_id": "VEND-SKYSUPPLY",
            "condition": "Overhauled",
            "quantity_available": 3,
            "unit_price": 12900.0,
            "currency": "USD",
            "warehouse_location": "BOM / Mumbai MRO Central Stores",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-EDP-72019",
            "tags_notes": "FAA Form 8130-3 Overhauled tag with authorized 121 trace."
        },
        {
            "id": "PART-HP2048-GLOB",
            "part_number": "HP-2048",
            "alternate_part_numbers": [],
            "description": "Engine-Driven Hydraulic Pump Assembly (EDP)",
            "ata_chapter": "29 - Hydraulic Power",
            "vendor_id": "VEND-GLOBAL",
            "condition": "Serviceable",
            "quantity_available": 1,
            "unit_price": 5000.0,
            "currency": "USD",
            "warehouse_location": "FRA / Frankfurt Cargo Bay 12",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": False,
            "has_coc": False,
            "serial_number": "SN-EDP-31002",
            "tags_notes": "Missing EASA Form 1 release. Trace certificate incomplete."
        },
        # Other parts for secondary cases
        {
            "id": "PART-TCAS-APEX",
            "part_number": "RAD-TCAS-3444",
            "alternate_part_numbers": ["RAD-TCAS-3444A"],
            "description": "TCAS II Directional Antenna Processor",
            "ata_chapter": "34 - Navigation",
            "vendor_id": "VEND-APEX",
            "condition": "Factory New",
            "quantity_available": 2,
            "unit_price": 8400.0,
            "currency": "USD",
            "warehouse_location": "DFW / Alliance Cargo 2",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-TCAS-1029",
            "tags_notes": "Dual release with complete birth record."
        },
        {
            "id": "PART-GEN-JETC",
            "part_number": "GEN-IDG-2401",
            "alternate_part_numbers": [],
            "description": "Integrated Drive Generator (IDG 90kVA)",
            "ata_chapter": "24 - Electrical Power",
            "vendor_id": "VEND-JETC",
            "condition": "Overhauled",
            "quantity_available": 1,
            "unit_price": 38500.0,
            "currency": "USD",
            "warehouse_location": "LAX / Imperial Cargo",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-IDG-55102",
            "tags_notes": "Overhauled tag with OEM rewind certificate."
        }
    ]

    for p in parts_data:
        part_obj = Part(**p)
        db.add(part_obj)
    db.commit()

    # 4. Seed Flagship Hero Case (SQK-2048)
    hero_case = SquawkCase(
        id="CASE-SQK-2048",
        tail_number="VT-SQK",
        aircraft_type="Boeing 737-800",
        defect_description="Hydraulic System A Engine-Driven Pump (EDP) low pressure warning during post-flight line check.",
        raw_intake_payload={
            "source": "ACARS Defect Feed / Line Maintenance Terminal 3",
            "flight": "SQ-204",
            "reported_by": "Capt. R. Sharma (Air Indigo Wings)",
            "timestamp": "2026-09-12T16:00:00Z"
        },
        ata_chapter="29 - Hydraulic Power",
        part_number="HP-2048",
        part_name="Engine-Driven Hydraulic Pump Assembly",
        priority="AOG",
        location="DEL",
        current_stage="HUMAN_REVIEW",
        confidence_score=0.96,
        risk_level="LOW",
        status="Awaiting Approval",
        estimated_recovery_hours=8.33,
        deadline_hours=18.0,
        max_acceptable_cost=25000.0,
        carbon_kg=420.0,
        replan_count=0,
        is_demo=True,
        demo_key="hero_sqk2048",
        demo_badge="FLAGSHIP AOG SCENARIO",
        active_plan={
            "supplier_id": "VEND-AEROPARTS",
            "supplier_name": "AeroParts Inc. (Singapore)",
            "part_id": "PART-HP2048-AERO",
            "part_number": "HP-2048",
            "condition": "Factory New",
            "quantity_available": 2,
            "part_cost": 14900.0,
            "freight_cost": 3300.0,
            "total_landed_cost": 18200.0,
            "total_eta_hours": 8.33,
            "carrier": "Singapore Cargo Express (Flight SQ-402)",
            "origin": "SIN",
            "destination": "DEL",
            "route_description": "Changi (SIN) -> Indira Gandhi Intl (DEL) -> Direct Hangar 4 Transfer",
            "carbon_kg": 420.0,
            "reliability_score": 0.96,
            "compliance_status": "PASS",
            "compliance_pass": True,
            "compliance_notes": "Dual Release (FAA 8130-3 + EASA Form 1) with complete OEM birth certificate.",
            "recovery_score": 92.4,
            "score_breakdown": {
                "delivery": 53.7, "reliability": 96.0, "cost": 27.2, "compliance": 100.0, "carbon": 58.0
            },
            "is_feasible": True,
            "rank": 1,
            "is_recommended": True
        },
        scoring_weights={"delivery": 0.40, "reliability": 0.25, "cost": 0.15, "compliance": 0.10, "carbon": 0.10},
        tool_call_history=[
            {
                "id": "TOOL-A001",
                "agent": "ORCHESTRATOR",
                "tool": "get_aircraft_status",
                "args": {"aircraft_id": "VT-SQK"},
                "result": {"status": "AOG_CRITICAL", "model": "Boeing 737-800", "location": "DEL", "required_part": "HP-2048", "deadline": 18.0},
                "duration_ms": 25,
                "status": "SUCCESS",
                "timestamp": "2026-09-12T16:02:10Z"
            },
            {
                "id": "TOOL-A002",
                "agent": "SOURCING_AGENT",
                "tool": "get_inventory",
                "args": {"part_number": "HP-2048", "location": "DEL"},
                "result": {"location": "DEL", "available_quantity": 0, "status": "STOCKOUT_AOG_TRIGGERED"},
                "duration_ms": 32,
                "status": "SUCCESS",
                "timestamp": "2026-09-12T16:02:15Z"
            },
            {
                "id": "TOOL-A003",
                "agent": "SOURCING_AGENT",
                "tool": "search_suppliers",
                "args": {"part_number": "HP-2048"},
                "result": {"suppliers_found": 3, "suppliers": ["AeroParts Inc. (Singapore)", "SkySupply Global (Mumbai Hub)", "GlobalParts Aviation GmbH"]},
                "duration_ms": 48,
                "status": "SUCCESS",
                "timestamp": "2026-09-12T16:02:22Z"
            },
            {
                "id": "TOOL-A004",
                "agent": "COMPLIANCE_AGENT",
                "tool": "verify_part",
                "args": {"part_number": "HP-2048", "supplier": "AeroParts Inc. (Singapore)"},
                "result": {"status": "PASS", "has_8130_3": True, "has_easa_form_1": True, "trace": True},
                "duration_ms": 38,
                "status": "SUCCESS",
                "timestamp": "2026-09-12T16:02:30Z"
            },
            {
                "id": "TOOL-A005",
                "agent": "LOGISTICS_AGENT",
                "tool": "calculate_route",
                "args": {"origin": "SIN", "destination": "DEL"},
                "result": {"carrier": "Singapore Cargo Express (Flight SQ-402)", "eta_hours": 8.33, "freight_cost": 3300.0, "carbon_kg": 420.0},
                "duration_ms": 41,
                "status": "SUCCESS",
                "timestamp": "2026-09-12T16:02:38Z"
            },
            {
                "id": "TOOL-A006",
                "agent": "OPTIMIZATION_AGENT",
                "tool": "optimize_recovery",
                "args": {"candidates_count": 3, "weights": {"delivery": 0.40, "reliability": 0.25, "cost": 0.15, "compliance": 0.10, "carbon": 0.10}},
                "result": {"ranked": ["AeroParts Inc. (Singapore)", "SkySupply Global (Mumbai Hub)", "GlobalParts Aviation GmbH"], "recommended": "AeroParts Inc. (Singapore)"},
                "duration_ms": 22,
                "status": "SUCCESS",
                "timestamp": "2026-09-12T16:02:44Z"
            }
        ],
        decision_trace=[
            {
                "step": "AOG_DEFECT_IDENTIFIED",
                "goal": "Recover grounded Boeing 737-800 (VT-SQK) at Delhi Airport within 18.0h window",
                "observation": "Hydraulic System A EDP low pressure warning. Required rotable part: HP-2048.",
                "reasoning": "Local DEL warehouse inventory check is the immediate first step to minimize ground delay.",
                "action": "CALL get_inventory('HP-2048', 'DEL')",
                "outcome": "Local stock query completed.",
                "timestamp": "2026-09-12T16:02:15Z"
            },
            {
                "step": "LOCAL_INVENTORY_DEPLETED",
                "goal": "Locate certified replacement rotable across external supplier networks",
                "observation": "Local Delhi stores has 0 units in stock. Sourcing escalation required.",
                "reasoning": "Sourcing Agent must search qualified external suppliers across Singapore, Mumbai, and Frankfurt.",
                "action": "CALL search_suppliers('HP-2048')",
                "outcome": "3 external suppliers identified with active part listings.",
                "timestamp": "2026-09-12T16:02:22Z"
            },
            {
                "step": "OPTIMAL_STRATEGY_SELECTED",
                "goal": "Select best compliant recovery plan satisfying the 18.0h deadline",
                "observation": "Supplier C (GlobalParts) disqualified (20.5h ETA exceeds 18.0h deadline). Supplier A (AeroParts) offers fastest ETA (8h 20m) and 96% reliability.",
                "reasoning": "Selected AeroParts Inc. because it satisfies the 18.0h deadline (8.3h ETA), maintains 96% vendor reliability, passed dual airworthiness compliance, and achieves the highest composite score (92.4/100).",
                "action": "RECOMMEND AeroParts Inc. FOR DEMO ENGINEER APPROVAL",
                "outcome": "Recovery plan prepared with 8h 20m ETA and $18,200 landed cost. Awaiting Demo Engineer Authorization.",
                "timestamp": "2026-09-12T16:02:44Z"
            }
        ],
        disruptions_log=[]
    )
    db.add(hero_case)
    db.commit()

    # 5. Add Candidates for Hero Case
    candidates_hero = [
        RecoveryCandidate(
            id="CAND-HERO-01",
            case_id="CASE-SQK-2048",
            vendor_id="VEND-AEROPARTS",
            part_id="PART-HP2048-AERO",
            vendor_name="AeroParts Inc. (Singapore)",
            part_number="HP-2048",
            condition="Factory New",
            part_cost=14900.0,
            freight_cost=3300.0,
            total_landed_cost=18200.0,
            estimated_eta_hours=8.33,
            shipping_method="Singapore Cargo Express (Flight SQ-402)",
            documentation_status="PASS",
            doc_notes="Dual Release (FAA 8130-3 + EASA Form 1) with complete OEM birth certificate.",
            vendor_reliability_score=0.96,
            overall_rank=1,
            is_recommended=True,
            is_flagged=False,
            confidence=0.96
        ),
        RecoveryCandidate(
            id="CAND-HERO-02",
            case_id="CASE-SQK-2048",
            vendor_id="VEND-SKYSUPPLY",
            part_id="PART-HP2048-SKY",
            vendor_name="SkySupply Global (Mumbai Hub)",
            part_number="HP-2048",
            condition="Overhauled",
            part_cost=12900.0,
            freight_cost=1800.0,
            total_landed_cost=14700.0,
            estimated_eta_hours=11.17,
            shipping_method="Blue Dart Aviation / Air India Cargo (Flight AI-608)",
            documentation_status="PASS",
            doc_notes="FAA Form 8130-3 Overhauled tag with authorized 121 trace.",
            vendor_reliability_score=0.91,
            overall_rank=2,
            is_recommended=False,
            is_flagged=False,
            confidence=0.91
        ),
        RecoveryCandidate(
            id="CAND-HERO-03",
            case_id="CASE-SQK-2048",
            vendor_id="VEND-GLOBAL",
            part_id="PART-HP2048-GLOB",
            vendor_name="GlobalParts Aviation GmbH",
            part_number="HP-2048",
            condition="Serviceable",
            part_cost=5000.0,
            freight_cost=4200.0,
            total_landed_cost=9200.0,
            estimated_eta_hours=20.5,
            shipping_method="Lufthansa Cargo (Flight LH-760)",
            documentation_status="FAIL",
            doc_notes="DEADLINE_EXCEEDED: ETA of 20.5h exceeds max allowable window of 18.0h by +2.5h. Missing EASA release.",
            vendor_reliability_score=0.84,
            overall_rank=3,
            is_recommended=False,
            is_flagged=True,
            flag_reason="DEADLINE_EXCEEDED: 20.5h ETA misses 18.0h deadline by +2.5h.",
            confidence=0.20
        )
    ]
    for c in candidates_hero:
        db.add(c)

    # Add Validation Result for Hero Case
    db.add(ValidationResult(
        id=str(uuid.uuid4()),
        case_id="CASE-SQK-2048",
        status="VALIDATED",
        conflicts_detected=["DEADLINE_EXCEEDED: GlobalParts 20.5h ETA exceeds 18.0h deadline."],
        flagged_candidates=["GlobalParts Aviation GmbH"],
        valid_candidates=["AeroParts Inc. (Singapore)", "SkySupply Global (Mumbai Hub)"],
        risk_level="LOW",
        confidence=0.96,
        requires_human_review=True,
        reasoning_summary="Selected AeroParts Inc. because it satisfies the 18.0h deadline (8h 20m ETA), maintains 96% vendor reliability, and passed dual airworthiness compliance."
    ))

    # Activity Log
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        case_id="CASE-SQK-2048",
        category="PIPELINE",
        title="AOG Case SQK-2048 Ingested & Analyzed",
        details="Boeing 737-800 (VT-SQK) at DEL. Recommended recovery: AeroParts Inc. (ETA: 8h 20m, Landed: $18,200). Awaiting Demo Engineer Authorization."
    ))

    # Secondary Cases for realism
    secondary_cases = [
        {
            "id": "CASE-TCAS-02",
            "tail_number": "N18AX",
            "aircraft_type": "Airbus A320-200",
            "defect_description": "TCAS Processor failure (ATA 34). In-flight collision avoidance degraded.",
            "part_number": "RAD-TCAS-3444",
            "part_name": "TCAS II Directional Antenna Processor",
            "priority": "AOG",
            "location": "DFW",
            "current_stage": "HUMAN_REVIEW",
            "confidence_score": 0.94,
            "risk_level": "LOW",
            "status": "Awaiting Approval",
            "estimated_recovery_hours": 6.5,
            "deadline_hours": 14.0,
            "is_demo": False
        },
        {
            "id": "CASE-GEN-03",
            "tail_number": "N72LK",
            "aircraft_type": "Boeing 777-300ER",
            "defect_description": "Right engine Integrated Drive Generator (IDG) thermal disconnect (ATA 24).",
            "part_number": "GEN-IDG-2401",
            "part_name": "Integrated Drive Generator 90kVA",
            "priority": "AOG",
            "location": "LAX",
            "current_stage": "APPROVED",
            "confidence_score": 0.91,
            "risk_level": "MEDIUM",
            "status": "Approved & Dispatched",
            "estimated_recovery_hours": 12.0,
            "deadline_hours": 24.0,
            "is_demo": False
        }
    ]

    for sc in secondary_cases:
        case_obj = SquawkCase(**sc)
        db.add(case_obj)

    db.commit()
    print("[SUCCESS] Database seeding completed successfully.")
