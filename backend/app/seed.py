import uuid
import datetime
from sqlalchemy.orm import Session
from app.models import (
    Aircraft, Vendor, Part, PartDocument, SquawkCase,
    RecoveryCandidate, AgentResult, ValidationResult,
    Approval, RecoveryAction, Outcome, VendorMemory, ActivityLog
)
from app.incident_intelligence import generate_incident_intelligence

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Aircraft).count() > 0:
        return

    print("[INFO] Seeding SQUAWK database with 5 pristine AOG demo intakes...")

    # 1. Seed Aircraft
    aircraft_list = [
        Aircraft(tail_number="VT-SQK", aircraft_type="Boeing 737-800", operator="Air Indigo Wings", home_base="DEL", current_location="DEL"),
        Aircraft(tail_number="N42Q", aircraft_type="Boeing 737-800", operator="Skyline Airways", home_base="ORD", current_location="ORD"),
        Aircraft(tail_number="N18AX", aircraft_type="Airbus A320-200", operator="TransGlobal Express", home_base="DFW", current_location="DFW"),
        Aircraft(tail_number="N72LK", aircraft_type="Boeing 777-300ER", operator="Pacific Horizon", home_base="LAX", current_location="LAX"),
        Aircraft(tail_number="N311VA", aircraft_type="Airbus A321neo", operator="CoastAir", home_base="JFK", current_location="JFK"),
        Aircraft(tail_number="N905AA", aircraft_type="Boeing 787-9", operator="Apex Airlines", home_base="MIA", current_location="MIA"),
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
        # HP-2048 (Case 1: VT-SQK DEL)
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

        # NOZ-HPT-7214 (Case 2: N42Q ORD)
        {
            "id": "PART-NOZ-APEX",
            "part_number": "NOZ-HPT-7214",
            "alternate_part_numbers": ["NOZ-HPT-7214-A"],
            "description": "High Pressure Turbine Stage 1 Nozzle Guide Vane",
            "ata_chapter": "72 - Engine / Turbine",
            "vendor_id": "VEND-APEX",
            "condition": "Factory New",
            "quantity_available": 4,
            "unit_price": 18500.0,
            "currency": "USD",
            "warehouse_location": "DFW / Alliance Cargo Terminal 3",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-HPT-99411",
            "tags_notes": "OEM Factory New certified with full life-cycle history."
        },
        {
            "id": "PART-NOZ-AERO",
            "part_number": "NOZ-HPT-7214",
            "alternate_part_numbers": [],
            "description": "High Pressure Turbine Stage 1 Nozzle Guide Vane",
            "ata_chapter": "72 - Engine / Turbine",
            "vendor_id": "VEND-AEROPARTS",
            "condition": "Overhauled",
            "quantity_available": 2,
            "unit_price": 16200.0,
            "currency": "USD",
            "warehouse_location": "SIN / Changi Cargo Hub Bay 4",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-HPT-81023",
            "tags_notes": "Dual Release (FAA 8130-3 + EASA Form 1)."
        },

        # RAD-TCAS-3444 (Case 3: N18AX DFW)
        {
            "id": "PART-TCAS-APEX",
            "part_number": "RAD-TCAS-3444",
            "alternate_part_numbers": ["RAD-TCAS-3444A"],
            "description": "TCAS II Directional Antenna Processor",
            "ata_chapter": "34 - Navigation / TCAS",
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
            "tags_notes": "Dual release with complete birth record and FAA 8130-3."
        },
        {
            "id": "PART-TCAS-SKY",
            "part_number": "RAD-TCAS-3444",
            "alternate_part_numbers": [],
            "description": "TCAS II Directional Antenna Processor",
            "ata_chapter": "34 - Navigation / TCAS",
            "vendor_id": "VEND-SKYSUPPLY",
            "condition": "Serviceable",
            "quantity_available": 1,
            "unit_price": 6900.0,
            "currency": "USD",
            "warehouse_location": "BOM / Mumbai MRO Central Stores",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-TCAS-3349",
            "tags_notes": "Single FAA 8130-3 serviceable release."
        },

        # GEN-IDG-2401 (Case 4: N72LK LAX)
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
        },
        {
            "id": "PART-GEN-AERO",
            "part_number": "GEN-IDG-2401",
            "alternate_part_numbers": [],
            "description": "Integrated Drive Generator (IDG 90kVA)",
            "ata_chapter": "24 - Electrical Power",
            "vendor_id": "VEND-AEROPARTS",
            "condition": "Factory New",
            "quantity_available": 1,
            "unit_price": 44000.0,
            "currency": "USD",
            "warehouse_location": "SIN / Changi Cargo Hub Bay 4",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-IDG-99014",
            "tags_notes": "Factory New OEM sealed unit."
        },

        # ACM-ECS-2109 (Case 5: N311VA JFK)
        {
            "id": "PART-ACM-GLOB",
            "part_number": "ACM-ECS-2109",
            "alternate_part_numbers": ["ACM-ECS-2109-1"],
            "description": "Air Cycle Machine Pack Assembly",
            "ata_chapter": "21 - Air Conditioning / ECS",
            "vendor_id": "VEND-GLOBAL",
            "condition": "Overhauled",
            "quantity_available": 2,
            "unit_price": 13500.0,
            "currency": "USD",
            "warehouse_location": "FRA / Frankfurt Cargo Bay 12",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-ACM-44102",
            "tags_notes": "Dual Release (FAA 8130-3 + EASA Form 1) with balanced rotor log."
        },
        {
            "id": "PART-ACM-APEX",
            "part_number": "ACM-ECS-2109",
            "alternate_part_numbers": [],
            "description": "Air Cycle Machine Pack Assembly",
            "ata_chapter": "21 - Air Conditioning / ECS",
            "vendor_id": "VEND-APEX",
            "condition": "Factory New",
            "quantity_available": 1,
            "unit_price": 16800.0,
            "currency": "USD",
            "warehouse_location": "DFW / Alliance Cargo 2",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-ACM-77890",
            "tags_notes": "Factory New OEM dual certified."
        }
    ]

    for p in parts_data:
        part_obj = Part(**p)
        db.add(part_obj)
    db.commit()

    # -------------------------------------------------------------
    # 4. SEED THE 5 PRISTINE DEMO INTAKE CASES
    # -------------------------------------------------------------

    # CASE 1 (Hero Flagship): VT-SQK at DEL
    case1_intel = generate_incident_intelligence(
        defect_description="Engine vibration reported during climb. Crew observed abnormal vibration indication. Hydraulic System A EDP low pressure warning.",
        tail_number="VT-SQK",
        aircraft_type="Boeing 737-800",
        location="DEL Terminal 3 MRO Hangar",
        part_number="HP-2048"
    )
    case1 = SquawkCase(
        id="CASE-SQK-2048",
        tail_number="VT-SQK",
        aircraft_type="Boeing 737-800",
        defect_description="Engine vibration reported during climb. Crew observed abnormal vibration indication.",
        raw_intake_payload={
            "source": "ACARS Defect Feed / Line Maintenance Terminal 3",
            "flight": "SQ-204",
            "reported_by": "Capt. R. Sharma (Air Indigo Wings)",
            "timestamp": "2026-09-27T16:00:00Z"
        },
        ata_chapter="29 - Hydraulic Power / 72 - Engine",
        part_number="HP-2048",
        part_name="Engine-Driven Hydraulic Pump Assembly (EDP)",
        priority="AOG",
        location="DEL Terminal 3 MRO Hangar",
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
        demo_badge="FLAGSHIP HERO AOG",
        incident_intelligence=case1_intel,
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
            "score_breakdown": {"delivery": 53.7, "reliability": 96.0, "cost": 27.2, "compliance": 100.0, "carbon": 58.0},
            "is_feasible": True,
            "rank": 1,
            "is_recommended": True
        },
        scoring_weights={"delivery": 0.40, "reliability": 0.25, "cost": 0.15, "compliance": 0.10, "carbon": 0.10},
        tool_call_history=[
            {"id": "TOOL-A001", "agent": "ORCHESTRATOR", "tool": "get_aircraft_status", "args": {"aircraft_id": "VT-SQK"}, "result": {"status": "AOG_CRITICAL", "location": "DEL"}, "status": "SUCCESS", "timestamp": "2026-09-27T16:02:10Z"},
            {"id": "TOOL-A002", "agent": "SOURCING_AGENT", "tool": "get_inventory", "args": {"part_number": "HP-2048", "location": "DEL"}, "result": {"available_quantity": 0, "status": "STOCKOUT"}, "status": "SUCCESS", "timestamp": "2026-09-27T16:02:15Z"},
            {"id": "TOOL-A003", "agent": "SOURCING_AGENT", "tool": "search_suppliers", "args": {"part_number": "HP-2048"}, "result": {"suppliers_found": 3}, "status": "SUCCESS", "timestamp": "2026-09-27T16:02:22Z"},
            {"id": "TOOL-A004", "agent": "VALIDATOR_AGENT", "tool": "verify_part", "args": {"part_number": "HP-2048"}, "result": {"status": "PASS"}, "status": "SUCCESS", "timestamp": "2026-09-27T16:02:30Z"}
        ],
        decision_trace=[
            {"step": "AOG_DEFECT_IDENTIFIED", "goal": "Recover grounded 737-800 at DEL within 18h", "observation": "Hydraulic EDP Low Pressure. Required part: HP-2048.", "reasoning": "Local DEL warehouse empty. Sourcing escalation required.", "action": "CALL search_suppliers('HP-2048')", "outcome": "3 suppliers evaluated.", "timestamp": "2026-09-27T16:02:22Z"},
            {"step": "OPTIMAL_STRATEGY_SELECTED", "goal": "Authorize fastest compliant plan", "observation": "AeroParts SIN offers 8h 20m ETA with 96% reliability and dual FAA/EASA release.", "reasoning": "Satisfies 18h window, dual compliance pass.", "action": "RECOMMEND AeroParts Inc.", "outcome": "Awaiting Lead Engineer sign-off.", "timestamp": "2026-09-27T16:02:44Z"}
        ]
    )
    db.add(case1)

    # Candidates for Case 1
    candidates_c1 = [
        RecoveryCandidate(id="CAND-C1-01", case_id="CASE-SQK-2048", vendor_id="VEND-AEROPARTS", part_id="PART-HP2048-AERO", vendor_name="AeroParts Inc. (Singapore)", part_number="HP-2048", condition="Factory New", part_cost=14900.0, freight_cost=3300.0, total_landed_cost=18200.0, estimated_eta_hours=8.33, shipping_method="Singapore Cargo Express (Flight SQ-402)", documentation_status="PASS", doc_notes="Dual Release (FAA 8130-3 + EASA Form 1) with complete OEM birth certificate.", vendor_reliability_score=0.96, overall_rank=1, is_recommended=True, is_flagged=False, confidence=0.96),
        RecoveryCandidate(id="CAND-C1-02", case_id="CASE-SQK-2048", vendor_id="VEND-SKYSUPPLY", part_id="PART-HP2048-SKY", vendor_name="SkySupply Global (Mumbai Hub)", part_number="HP-2048", condition="Overhauled", part_cost=12900.0, freight_cost=1800.0, total_landed_cost=14700.0, estimated_eta_hours=11.17, shipping_method="Air India Cargo (Flight AI-608)", documentation_status="PASS", doc_notes="FAA Form 8130-3 Overhauled tag with authorized 121 trace.", vendor_reliability_score=0.91, overall_rank=2, is_recommended=False, is_flagged=False, confidence=0.91),
        RecoveryCandidate(id="CAND-C1-03", case_id="CASE-SQK-2048", vendor_id="VEND-GLOBAL", part_id="PART-HP2048-GLOB", vendor_name="GlobalParts Aviation GmbH", part_number="HP-2048", condition="Serviceable", part_cost=5000.0, freight_cost=4200.0, total_landed_cost=9200.0, estimated_eta_hours=20.5, shipping_method="Lufthansa Cargo (Flight LH-760)", documentation_status="FAIL", doc_notes="DEADLINE_EXCEEDED: ETA of 20.5h exceeds max allowable window of 18.0h.", vendor_reliability_score=0.84, overall_rank=3, is_recommended=False, is_flagged=True, flag_reason="DEADLINE_EXCEEDED: 20.5h ETA misses 18.0h deadline by +2.5h.", confidence=0.20)
    ]
    for c in candidates_c1:
        db.add(c)

    db.add(ValidationResult(
        id=str(uuid.uuid4()), case_id="CASE-SQK-2048", status="VALIDATED",
        conflicts_detected=["DEADLINE_EXCEEDED: GlobalParts 20.5h ETA exceeds 18.0h deadline."],
        flagged_candidates=["GlobalParts Aviation GmbH"],
        valid_candidates=["AeroParts Inc. (Singapore)", "SkySupply Global (Mumbai Hub)"],
        risk_level="LOW", confidence=0.96, requires_human_review=True,
        reasoning_summary="Selected AeroParts Inc. because it satisfies the 18.0h deadline (8h 20m ETA), maintains 96% vendor reliability, and passed dual airworthiness compliance."
    ))
    db.add(ActivityLog(id=str(uuid.uuid4()), case_id="CASE-SQK-2048", category="PIPELINE", title="AOG Case SQK-2048 Ingested & Analyzed", details="Boeing 737-800 (VT-SQK) at DEL. Recommended recovery: AeroParts Inc. (ETA: 8h 20m). Awaiting Human Sign-off."))

    # CASE 2: N42Q at ORD (Chicago O'Hare)
    case2_intel = generate_incident_intelligence(
        defect_description="High Pressure Turbine (HPT) Stage 1 Nozzle thermal stress indication during post-flight borescope. Borescope photo indicates coating spallation beyond AMM limits.",
        tail_number="N42Q",
        aircraft_type="Boeing 737-800",
        location="ORD Gate B12 Hangar",
        part_number="NOZ-HPT-7214"
    )
    case2 = SquawkCase(
        id="CASE-ORD-4201",
        tail_number="N42Q",
        aircraft_type="Boeing 737-800",
        defect_description="High Pressure Turbine (HPT) Stage 1 Nozzle thermal stress indication during post-flight borescope.",
        raw_intake_payload={
            "source": "Borescope Inspection Report / TechLog Scan",
            "flight": "SK-420",
            "reported_by": "Lead Powerplant Inspector (ORD Base)",
            "timestamp": "2026-09-27T17:15:00Z"
        },
        ata_chapter="72 - Engine / Turbine",
        part_number="NOZ-HPT-7214",
        part_name="HPT Stage 1 Nozzle Guide Vane Segment",
        priority="AOG",
        location="ORD Gate B12 Hangar",
        current_stage="SPECIALIST_ROUTING",
        confidence_score=0.92,
        risk_level="MEDIUM",
        status="Processing",
        estimated_recovery_hours=6.8,
        deadline_hours=16.0,
        max_acceptable_cost=30000.0,
        carbon_kg=310.0,
        replan_count=0,
        is_demo=True,
        demo_key="ord_n42q",
        demo_badge="PARALLEL AI SOURCING",
        incident_intelligence=case2_intel,
        active_plan={
            "supplier_id": "VEND-APEX",
            "supplier_name": "Apex Rotables & Spares (DFW)",
            "part_id": "PART-NOZ-APEX",
            "part_number": "NOZ-HPT-7214",
            "condition": "Factory New",
            "quantity_available": 4,
            "part_cost": 18500.0,
            "freight_cost": 2900.0,
            "total_landed_cost": 21400.0,
            "total_eta_hours": 6.8,
            "carrier": "FedEx Priority Aviation Cargo (Flight FX-142)",
            "origin": "DFW",
            "destination": "ORD",
            "route_description": "DFW Alliance Cargo -> Chicago O'Hare Direct Line Ramp",
            "carbon_kg": 310.0,
            "reliability_score": 0.93,
            "compliance_status": "PASS",
            "compliance_pass": True,
            "compliance_notes": "Dual Release (FAA Form 8130-3 + EASA Form 1) with full OEM birth record.",
            "recovery_score": 94.1,
            "is_feasible": True,
            "rank": 1,
            "is_recommended": True
        }
    )
    db.add(case2)

    candidates_c2 = [
        RecoveryCandidate(id="CAND-C2-01", case_id="CASE-ORD-4201", vendor_id="VEND-APEX", part_id="PART-NOZ-APEX", vendor_name="Apex Rotables & Spares (DFW)", part_number="NOZ-HPT-7214", condition="Factory New", part_cost=18500.0, freight_cost=2900.0, total_landed_cost=21400.0, estimated_eta_hours=6.8, shipping_method="FedEx Priority Aviation Cargo (FX-142)", documentation_status="PASS", doc_notes="FAA 8130-3 + EASA Form 1 Dual Release.", vendor_reliability_score=0.93, overall_rank=1, is_recommended=True, is_flagged=False, confidence=0.93),
        RecoveryCandidate(id="CAND-C2-02", case_id="CASE-ORD-4201", vendor_id="VEND-AEROPARTS", part_id="PART-NOZ-AERO", vendor_name="AeroParts Inc. (Singapore)", part_number="NOZ-HPT-7214", condition="Overhauled", part_cost=16200.0, freight_cost=5800.0, total_landed_cost=22000.0, estimated_eta_hours=14.5, shipping_method="Singapore Cargo (SQ-12)", documentation_status="PASS", doc_notes="Dual Release tags verified.", vendor_reliability_score=0.96, overall_rank=2, is_recommended=False, is_flagged=False, confidence=0.88)
    ]
    for c in candidates_c2:
        db.add(c)

    db.add(ValidationResult(
        id=str(uuid.uuid4()), case_id="CASE-ORD-4201", status="VALIDATING",
        conflicts_detected=[], flagged_candidates=[], valid_candidates=["Apex Rotables & Spares (DFW)", "AeroParts Inc. (Singapore)"],
        risk_level="MEDIUM", confidence=0.92, requires_human_review=True,
        reasoning_summary="Apex Rotables offers 6.8h landed turnaround from DFW to ORD with full FAA Form 8130-3 certification."
    ))
    db.add(ActivityLog(id=str(uuid.uuid4()), case_id="CASE-ORD-4201", category="SOURCING", title="Parallel Sourcing Dispatched for N42Q", details="Turbine nozzle guide vane search running across DFW and SIN hubs. 2 certified rotable matches found."))

    # CASE 3: N18AX at DFW (Dallas Fort Worth)
    case3_intel = generate_incident_intelligence(
        defect_description="TCAS Processor failure (ATA 34). In-flight collision avoidance degraded. Direct replacement required prior to revenue flight release.",
        tail_number="N18AX",
        aircraft_type="Airbus A320-200",
        location="DFW Terminal E Gate 18",
        part_number="RAD-TCAS-3444"
    )
    case3 = SquawkCase(
        id="CASE-DFW-1802",
        tail_number="N18AX",
        aircraft_type="Airbus A320-200",
        defect_description="TCAS Processor failure (ATA 34). In-flight collision avoidance degraded.",
        raw_intake_payload={
            "source": "Pilot ACARS Post-Flight Log / MCC Feed",
            "flight": "TG-180",
            "reported_by": "First Officer M. Vance",
            "timestamp": "2026-09-27T18:00:00Z"
        },
        ata_chapter="34 - Navigation / TCAS",
        part_number="RAD-TCAS-3444",
        part_name="TCAS II Directional Antenna Processor",
        priority="AOG",
        location="DFW Terminal E Gate 18",
        current_stage="HUMAN_REVIEW",
        confidence_score=0.94,
        risk_level="LOW",
        status="Awaiting Approval",
        estimated_recovery_hours=5.5,
        deadline_hours=14.0,
        max_acceptable_cost=15000.0,
        carbon_kg=180.0,
        replan_count=0,
        is_demo=True,
        demo_key="dfw_n18ax",
        demo_badge="AVIONICS FAST-TRACK",
        incident_intelligence=case3_intel,
        active_plan={
            "supplier_id": "VEND-APEX",
            "supplier_name": "Apex Rotables & Spares (DFW Local)",
            "part_id": "PART-TCAS-APEX",
            "part_number": "RAD-TCAS-3444",
            "condition": "Factory New",
            "quantity_available": 2,
            "part_cost": 8400.0,
            "freight_cost": 1800.0,
            "total_landed_cost": 10200.0,
            "total_eta_hours": 5.5,
            "carrier": "Local DFW Airside Dedicated Courier",
            "origin": "DFW",
            "destination": "DFW",
            "route_description": "DFW Alliance Warehouse -> Terminal E Gate 18 Airside Transfer",
            "carbon_kg": 45.0,
            "reliability_score": 0.93,
            "compliance_status": "PASS",
            "compliance_pass": True,
            "compliance_notes": "Dual Release (FAA 8130-3 + EASA Form 1) with factory calibration certificate.",
            "recovery_score": 96.2,
            "is_feasible": True,
            "rank": 1,
            "is_recommended": True
        }
    )
    db.add(case3)

    candidates_c3 = [
        RecoveryCandidate(id="CAND-C3-01", case_id="CASE-DFW-1802", vendor_id="VEND-APEX", part_id="PART-TCAS-APEX", vendor_name="Apex Rotables & Spares (DFW)", part_number="RAD-TCAS-3444", condition="Factory New", part_cost=8400.0, freight_cost=1800.0, total_landed_cost=10200.0, estimated_eta_hours=5.5, shipping_method="DFW Dedicated Airside Van", documentation_status="PASS", doc_notes="FAA Form 8130-3 Factory New tag with OEM trace.", vendor_reliability_score=0.93, overall_rank=1, is_recommended=True, is_flagged=False, confidence=0.94),
        RecoveryCandidate(id="CAND-C3-02", case_id="CASE-DFW-1802", vendor_id="VEND-SKYSUPPLY", part_id="PART-TCAS-SKY", vendor_name="SkySupply Global (Mumbai Hub)", part_number="RAD-TCAS-3444", condition="Serviceable", part_cost=6900.0, freight_cost=4500.0, total_landed_cost=11400.0, estimated_eta_hours=13.0, shipping_method="Air India Cargo", documentation_status="PASS", doc_notes="Single FAA 8130-3 release.", vendor_reliability_score=0.91, overall_rank=2, is_recommended=False, is_flagged=False, confidence=0.85)
    ]
    for c in candidates_c3:
        db.add(c)

    db.add(ValidationResult(
        id=str(uuid.uuid4()), case_id="CASE-DFW-1802", status="VALIDATED",
        conflicts_detected=[], flagged_candidates=[], valid_candidates=["Apex Rotables & Spares (DFW)"],
        risk_level="LOW", confidence=0.94, requires_human_review=True,
        reasoning_summary="Apex Rotables provides local 5.5h airside transit at DFW with Factory New dual release TCAS processor."
    ))
    db.add(ActivityLog(id=str(uuid.uuid4()), case_id="CASE-DFW-1802", category="VALIDATION", title="TCAS Sourcing Validated for N18AX", details="Apex Rotables DFW selected (5.5h ETA, $10,200). Ready for Lead Engineer authorization."))

    # CASE 4: N72LK at LAX (Los Angeles)
    case4_intel = generate_incident_intelligence(
        defect_description="Right engine Integrated Drive Generator (IDG) thermal disconnect and oil pressure loss (ATA 24). Generator offline.",
        tail_number="N72LK",
        aircraft_type="Boeing 777-300ER",
        location="LAX Maintenance Hangar 5",
        part_number="GEN-IDG-2401"
    )
    case4 = SquawkCase(
        id="CASE-LAX-7203",
        tail_number="N72LK",
        aircraft_type="Boeing 777-300ER",
        defect_description="Right engine Integrated Drive Generator (IDG) thermal disconnect and oil pressure loss (ATA 24).",
        raw_intake_payload={
            "source": "EICAS Maintenance Telemetry / Flight Crew Debrief",
            "flight": "PH-720",
            "reported_by": "Capt. E. Lindqvist",
            "timestamp": "2026-09-27T14:30:00Z"
        },
        ata_chapter="24 - Electrical Power",
        part_number="GEN-IDG-2401",
        part_name="Integrated Drive Generator 90kVA",
        priority="AOG",
        location="LAX Maintenance Hangar 5",
        current_stage="APPROVED",
        confidence_score=0.91,
        risk_level="LOW",
        status="Approved & Dispatched",
        estimated_recovery_hours=12.0,
        deadline_hours=24.0,
        max_acceptable_cost=55000.0,
        carbon_kg=520.0,
        replan_count=0,
        is_demo=True,
        demo_key="lax_n72lk",
        demo_badge="DISPATCHED ROTABLE",
        incident_intelligence=case4_intel,
        active_plan={
            "supplier_id": "VEND-JETC",
            "supplier_name": "JetComponent Express (LAX Local)",
            "part_id": "PART-GEN-JETC",
            "part_number": "GEN-IDG-2401",
            "condition": "Overhauled",
            "quantity_available": 1,
            "part_cost": 38500.0,
            "freight_cost": 4000.0,
            "total_landed_cost": 42500.0,
            "total_eta_hours": 12.0,
            "carrier": "JetComponent Priority Logistics Van",
            "origin": "LAX",
            "destination": "LAX",
            "route_description": "LAX Imperial Cargo -> Hangar 5 Dedicated Delivery",
            "carbon_kg": 60.0,
            "reliability_score": 0.86,
            "compliance_status": "PASS",
            "compliance_pass": True,
            "compliance_notes": "FAA Form 8130-3 + EASA Form 1 with OEM rewind certificate.",
            "recovery_score": 90.8,
            "is_feasible": True,
            "rank": 1,
            "is_recommended": True
        }
    )
    db.add(case4)

    candidates_c4 = [
        RecoveryCandidate(id="CAND-C4-01", case_id="CASE-LAX-7203", vendor_id="VEND-JETC", part_id="PART-GEN-JETC", vendor_name="JetComponent Express (LAX)", part_number="GEN-IDG-2401", condition="Overhauled", part_cost=38500.0, freight_cost=4000.0, total_landed_cost=42500.0, estimated_eta_hours=12.0, shipping_method="JetComponent Hotshot Van", documentation_status="PASS", doc_notes="Dual release with OEM rewind certificate.", vendor_reliability_score=0.86, overall_rank=1, is_recommended=True, is_flagged=False, confidence=0.91),
        RecoveryCandidate(id="CAND-C4-02", case_id="CASE-LAX-7203", vendor_id="VEND-AEROPARTS", part_id="PART-GEN-AERO", vendor_name="AeroParts Inc. (Singapore)", part_number="GEN-IDG-2401", condition="Factory New", part_cost=44000.0, freight_cost=7500.0, total_landed_cost=51500.0, estimated_eta_hours=18.5, shipping_method="Singapore Cargo Express", documentation_status="PASS", doc_notes="Factory New OEM unit.", vendor_reliability_score=0.96, overall_rank=2, is_recommended=False, is_flagged=False, confidence=0.89)
    ]
    for c in candidates_c4:
        db.add(c)

    db.add(ValidationResult(
        id=str(uuid.uuid4()), case_id="CASE-LAX-7203", status="APPROVED",
        conflicts_detected=[], flagged_candidates=[], valid_candidates=["JetComponent Express (LAX)"],
        risk_level="LOW", confidence=0.91, requires_human_review=False,
        reasoning_summary="Lead Engineer authorized JetComponent Express recovery. EDI Purchase Order SQ-9941 dispatched."
    ))
    db.add(ActivityLog(id=str(uuid.uuid4()), case_id="CASE-LAX-7203", category="HUMAN_APPROVAL", title="Recovery Plan Approved & Dispatched (N72LK)", details="Authorized by Tech Ops Duty Controller (License A&P-774120). Shipment courier dispatched to LAX Hangar 5."))

    # CASE 5: N311VA at JFK (New York JFK)
    case5_intel = generate_incident_intelligence(
        defect_description="Environmental Control System (ECS) Pack 1 Air Cycle Machine turbine bearing friction warning (ATA 21). System isolated.",
        tail_number="N311VA",
        aircraft_type="Airbus A321neo",
        location="JFK Terminal 4 Line Station",
        part_number="ACM-ECS-2109"
    )
    case5 = SquawkCase(
        id="CASE-JFK-3105",
        tail_number="N311VA",
        aircraft_type="Airbus A321neo",
        defect_description="Environmental Control System (ECS) Pack 1 Air Cycle Machine turbine bearing friction warning (ATA 21).",
        raw_intake_payload={
            "source": "TechLog Digital Upload / Station Controller",
            "flight": "CA-311",
            "reported_by": "Station Lead A. Kowalski",
            "timestamp": "2026-09-27T12:00:00Z"
        },
        ata_chapter="21 - Air Conditioning / ECS",
        part_number="ACM-ECS-2109",
        part_name="Air Cycle Machine Pack Assembly",
        priority="CRITICAL",
        location="JFK Terminal 4 Line Station",
        current_stage="COMPLETED",
        confidence_score=0.98,
        risk_level="LOW",
        status="Resolved",
        estimated_recovery_hours=7.2,
        deadline_hours=20.0,
        max_acceptable_cost=22000.0,
        carbon_kg=290.0,
        replan_count=0,
        is_demo=True,
        demo_key="jfk_n311va",
        demo_badge="RESOLVED & VERIFIED",
        incident_intelligence=case5_intel,
        active_plan={
            "supplier_id": "VEND-GLOBAL",
            "supplier_name": "GlobalParts Aviation GmbH (Frankfurt)",
            "part_id": "PART-ACM-GLOB",
            "part_number": "ACM-ECS-2109",
            "condition": "Overhauled",
            "quantity_available": 2,
            "part_cost": 13500.0,
            "freight_cost": 3300.0,
            "total_landed_cost": 16800.0,
            "total_eta_hours": 7.2,
            "carrier": "Lufthansa Cargo Priority (Flight LH-400)",
            "origin": "FRA",
            "destination": "JFK",
            "route_description": "Frankfurt (FRA) -> New York JFK -> Direct Airside Delivery",
            "carbon_kg": 290.0,
            "reliability_score": 0.84,
            "compliance_status": "PASS",
            "compliance_pass": True,
            "compliance_notes": "Dual Release (FAA 8130-3 + EASA Form 1) with balanced rotor certificate.",
            "recovery_score": 93.5,
            "is_feasible": True,
            "rank": 1,
            "is_recommended": True
        }
    )
    db.add(case5)

    candidates_c5 = [
        RecoveryCandidate(id="CAND-C5-01", case_id="CASE-JFK-3105", vendor_id="VEND-GLOBAL", part_id="PART-ACM-GLOB", vendor_name="GlobalParts Aviation GmbH (FRA)", part_number="ACM-ECS-2109", condition="Overhauled", part_cost=13500.0, freight_cost=3300.0, total_landed_cost=16800.0, estimated_eta_hours=7.2, shipping_method="Lufthansa Cargo Priority (LH-400)", documentation_status="PASS", doc_notes="FAA Form 8130-3 + EASA Form 1 Dual Release.", vendor_reliability_score=0.84, overall_rank=1, is_recommended=True, is_flagged=False, confidence=0.98),
        RecoveryCandidate(id="CAND-C5-02", case_id="CASE-JFK-3105", vendor_id="VEND-APEX", part_id="PART-ACM-APEX", vendor_name="Apex Rotables & Spares (DFW)", part_number="ACM-ECS-2109", condition="Factory New", part_cost=16800.0, freight_cost=2400.0, total_landed_cost=19200.0, estimated_eta_hours=8.1, shipping_method="FedEx Aviation Express", documentation_status="PASS", doc_notes="Factory New OEM unit.", vendor_reliability_score=0.93, overall_rank=2, is_recommended=False, is_flagged=False, confidence=0.92)
    ]
    for c in candidates_c5:
        db.add(c)

    db.add(ValidationResult(
        id=str(uuid.uuid4()), case_id="CASE-JFK-3105", status="RESOLVED",
        conflicts_detected=[], flagged_candidates=[], valid_candidates=["GlobalParts Aviation GmbH (FRA)"],
        risk_level="LOW", confidence=0.98, requires_human_review=False,
        reasoning_summary="Part delivered, physical airworthiness tags verified, installation complete and aircraft cleared for revenue service."
    ))
    db.add(ActivityLog(id=str(uuid.uuid4()), case_id="CASE-JFK-3105", category="OUTCOME", title="AOG Resolved for N311VA", details="Part ACM-ECS-2109 installed at JFK Terminal 4. Airworthiness sign-off issued. Aircraft returned to line service."))

    db.commit()
    print("[SUCCESS] 5 Demo Intakes successfully seeded in SQUAWK database.")
