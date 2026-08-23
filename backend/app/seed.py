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

    # 1. Seed Aircraft (at least 8 aircraft)
    aircraft_list = [
        Aircraft(tail_number="N42Q", aircraft_type="Boeing 737-800", operator="Skyline Airways", home_base="ORD", current_location="ORD"),
        Aircraft(tail_number="N18AX", aircraft_type="Airbus A320-200", operator="TransGlobal Express", home_base="DFW", current_location="DFW"),
        Aircraft(tail_number="N72LK", aircraft_type="Boeing 777-300ER", operator="Pacific Horizon", home_base="LAX", current_location="LAX"),
        Aircraft(tail_number="N905AA", aircraft_type="Boeing 787-9", operator="Apex Airlines", home_base="MIA", current_location="MIA"),
        Aircraft(tail_number="N311VA", aircraft_type="Airbus A321neo", operator="CoastAir", home_base="JFK", current_location="JFK"),
        Aircraft(tail_number="N540UA", aircraft_type="Embraer E175", operator="RegionalLink", home_base="DEN", current_location="DEN"),
        Aircraft(tail_number="N882DL", aircraft_type="Airbus A350-900", operator="GlobalWings", home_base="ATL", current_location="ATL"),
        Aircraft(tail_number="N674SW", aircraft_type="Boeing 737 MAX 8", operator="Sunbelt Air", home_base="PHX", current_location="PHX"),
    ]
    for a in aircraft_list:
        db.add(a)
    db.commit()

    # 2. Seed Vendors (at least 8 vendors with operational memory)
    vendors_data = [
        {
            "id": "VEND-AERO-01",
            "name": "AeroParts Inc.",
            "location_hub": "ORD",
            "cage_code": "1K489",
            "base_rating": 0.94,
            "verified_orders_count": 15,
            "on_time_deliveries": 14,
            "avg_delay_minutes": 25.0,
            "doc_issues_count": 0,
            "calculated_reliability": 0.94,
            "contact_email": "aog@aeroparts-supply.com",
            "contact_aog_desk": "+1 (800) 555-AERO"
        },
        {
            "id": "VEND-GLOB-02",
            "name": "Global Aviation Supply",
            "location_hub": "MIA",
            "cage_code": "7G231",
            "base_rating": 0.58,
            "verified_orders_count": 12,
            "on_time_deliveries": 7,
            "avg_delay_minutes": 210.0,
            "doc_issues_count": 3,
            "calculated_reliability": 0.58,
            "contact_email": "desk@globalaviationsupply.com",
            "contact_aog_desk": "+1 (305) 555-0199"
        },
        {
            "id": "VEND-APEX-03",
            "name": "Apex Rotables & Spares",
            "location_hub": "DFW",
            "cage_code": "3C994",
            "base_rating": 0.91,
            "verified_orders_count": 22,
            "on_time_deliveries": 20,
            "avg_delay_minutes": 35.0,
            "doc_issues_count": 1,
            "calculated_reliability": 0.91,
            "contact_email": "priority@apexrotables.com",
            "contact_aog_desk": "+1 (972) 555-APEX"
        },
        {
            "id": "VEND-SKYH-04",
            "name": "SkyHawk Logistics Hub",
            "location_hub": "ATL",
            "cage_code": "9X102",
            "base_rating": 0.88,
            "verified_orders_count": 18,
            "on_time_deliveries": 16,
            "avg_delay_minutes": 45.0,
            "doc_issues_count": 1,
            "calculated_reliability": 0.88,
            "contact_email": "dispatch@skyhawkhub.com",
            "contact_aog_desk": "+1 (404) 555-0144"
        },
        {
            "id": "VEND-JETC-05",
            "name": "JetComponent Express",
            "location_hub": "LAX",
            "cage_code": "4M551",
            "base_rating": 0.85,
            "verified_orders_count": 10,
            "on_time_deliveries": 8,
            "avg_delay_minutes": 65.0,
            "doc_issues_count": 1,
            "calculated_reliability": 0.85,
            "contact_email": "orders@jetcomponentexpress.com",
            "contact_aog_desk": "+1 (310) 555-JETC"
        },
        {
            "id": "VEND-EUR-06",
            "name": "EuroSpares Aviation GmbH",
            "location_hub": "FRA",
            "cage_code": "D8832",
            "base_rating": 0.96,
            "verified_orders_count": 30,
            "on_time_deliveries": 29,
            "avg_delay_minutes": 15.0,
            "doc_issues_count": 0,
            "calculated_reliability": 0.96,
            "contact_email": "aog@eurospares.de",
            "contact_aog_desk": "+49 69 555-0810"
        },
        {
            "id": "VEND-PAC-07",
            "name": "Pacific Aero Surplus",
            "location_hub": "SEA",
            "cage_code": "2T190",
            "base_rating": 0.72,
            "verified_orders_count": 14,
            "on_time_deliveries": 10,
            "avg_delay_minutes": 140.0,
            "doc_issues_count": 2,
            "calculated_reliability": 0.72,
            "contact_email": "support@pacificaerosurplus.com",
            "contact_aog_desk": "+1 (206) 555-7822"
        },
        {
            "id": "VEND-ATL-08",
            "name": "Atlantic Avionics Solutions",
            "location_hub": "JFK",
            "cage_code": "6B441",
            "base_rating": 0.92,
            "verified_orders_count": 19,
            "on_time_deliveries": 18,
            "avg_delay_minutes": 20.0,
            "doc_issues_count": 0,
            "calculated_reliability": 0.92,
            "contact_email": "ops@atlanticavionics.com",
            "contact_aog_desk": "+1 (718) 555-9011"
        }
    ]

    for v in vendors_data:
        vendor_obj = Vendor(**v)
        db.add(vendor_obj)
        # Add memory row
        db.add(VendorMemory(
            id=f"MEM-{v['id']}",
            vendor_id=v['id'],
            total_orders=v['verified_orders_count'],
            on_time_deliveries=v['on_time_deliveries'],
            avg_delay_minutes=v['avg_delay_minutes'],
            documentation_defects=v['doc_issues_count'],
            reliability_score=v['calculated_reliability']
        ))
    db.commit()

    # 3. Seed Aviation Parts (15+ parts, with certificates)
    parts_data = [
        # Hero Case parts: HYD-PUMP-2901
        {
            "id": "PART-01",
            "part_number": "HYD-PUMP-2901",
            "description": "Engine-Driven Hydraulic Pump EDP",
            "ata_chapter": "29 - Hydraulic Power",
            "vendor_id": "VEND-AERO-01", # AeroParts Inc. (Good vendor)
            "condition": "OH",
            "quantity_available": 2,
            "unit_price": 19800.0,
            "warehouse_location": "ORD",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-HYD-99824",
            "tags_notes": "Dual Release FAA 8130-3 / EASA Form 1 on file. Zero hours since OH."
        },
        {
            "id": "PART-02",
            "part_number": "HYD-PUMP-2901",
            "description": "Engine-Driven Hydraulic Pump EDP",
            "ata_chapter": "29 - Hydraulic Power",
            "vendor_id": "VEND-GLOB-02", # Global Aviation Supply (Cheaper, but missing FAA 8130-3 tag)
            "condition": "SV",
            "quantity_available": 1,
            "unit_price": 14900.0, # Cheapest, but will be flagged
            "warehouse_location": "MIA",
            "has_8130_3": False, # MISSING 8130-3!
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-HYD-11409",
            "tags_notes": "Internal shop tear-down tag only. FAA 8130-3 certificate is pending re-certification."
        },
        {
            "id": "PART-03",
            "part_number": "HYD-PUMP-2901",
            "description": "Engine-Driven Hydraulic Pump EDP",
            "ata_chapter": "29 - Hydraulic Power",
            "vendor_id": "VEND-APEX-03", # Apex Spares
            "condition": "FN",
            "quantity_available": 1,
            "unit_price": 24500.0,
            "warehouse_location": "DFW",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-HYD-OEM-4401",
            "tags_notes": "Factory New Parker Aerospace OEM cert with 8130-3."
        },
        {
            "id": "PART-04",
            "part_number": "HYD-PUMP-2901",
            "description": "Engine-Driven Hydraulic Pump EDP",
            "ata_chapter": "29 - Hydraulic Power",
            "vendor_id": "VEND-PAC-07",
            "condition": "AR",
            "quantity_available": 1,
            "unit_price": 12800.0,
            "warehouse_location": "SEA",
            "has_8130_3": False,
            "has_easa_form_1": False,
            "has_trace_to_oem": False,
            "has_coc": False,
            "serial_number": "SN-HYD-UNKNOWN",
            "tags_notes": "As removed from retired airframe. Non-incident statement missing."
        },
        # Other critical parts
        {
            "id": "PART-05",
            "part_number": "BRK-ASSY-3208",
            "description": "Carbon Brake Assembly Main Gear",
            "ata_chapter": "32 - Landing Gear",
            "vendor_id": "VEND-APEX-03",
            "condition": "OH",
            "quantity_available": 3,
            "unit_price": 18200.0,
            "warehouse_location": "DFW",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-BRK-8921",
            "tags_notes": "Safran Landing Systems authorized overhaul with 8130-3 dual release."
        },
        {
            "id": "PART-06",
            "part_number": "SNSR-AOA-3411",
            "description": "Angle of Attack Sensor Transmitter",
            "ata_chapter": "34 - Navigation",
            "vendor_id": "VEND-ATL-08",
            "condition": "FN",
            "quantity_available": 2,
            "unit_price": 14200.0,
            "warehouse_location": "JFK",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-AOA-0034",
            "tags_notes": "Factory calibrated with OEM certification."
        },
        {
            "id": "PART-07",
            "part_number": "VALV-PRSOV-3601",
            "description": "Bleed Air Pressure Regulating Shutoff Valve",
            "ata_chapter": "36 - Pneumatic",
            "vendor_id": "VEND-SKYH-04",
            "condition": "SV",
            "quantity_available": 1,
            "unit_price": 11500.0,
            "warehouse_location": "ATL",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-VLV-369",
            "tags_notes": "Serviceable release tag on file."
        },
        {
            "id": "PART-08",
            "part_number": "GEN-IDG-2402",
            "description": "Integrated Drive Generator (IDG 90kVA)",
            "ata_chapter": "24 - Electrical Power",
            "vendor_id": "VEND-EUR-06",
            "condition": "OH",
            "quantity_available": 1,
            "unit_price": 48000.0,
            "warehouse_location": "FRA",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-IDG-7719",
            "tags_notes": "Honeywell approved MRO overhaul tag."
        },
        {
            "id": "PART-09",
            "part_number": "ACT-FLAP-2710",
            "description": "Outboard Flap Power Drive Rotary Actuator",
            "ata_chapter": "27 - Flight Controls",
            "vendor_id": "VEND-JETC-05",
            "condition": "SV",
            "quantity_available": 2,
            "unit_price": 16400.0,
            "warehouse_location": "LAX",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-ACT-5501",
            "tags_notes": "Moog Aerospace serviceable release."
        },
        {
            "id": "PART-10",
            "part_number": "APU-FUEL-4903",
            "description": "Auxiliary Power Unit Fuel Control Unit",
            "ata_chapter": "49 - Airborne Auxiliary Power",
            "vendor_id": "VEND-AERO-01",
            "condition": "OH",
            "quantity_available": 1,
            "unit_price": 22100.0,
            "warehouse_location": "ORD",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-APU-8812",
            "tags_notes": "Complete trace to Collins Aerospace."
        },
        {
            "id": "PART-11",
            "part_number": "RAD-TCAS-3444",
            "description": "TCAS II Directional Antenna Unit",
            "ata_chapter": "34 - Navigation",
            "vendor_id": "VEND-ATL-08",
            "condition": "FN",
            "quantity_available": 3,
            "unit_price": 8900.0,
            "warehouse_location": "JFK",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-TCAS-201",
            "tags_notes": "Factory new sealed box with FAA Form 8130-3."
        },
        {
            "id": "PART-12",
            "part_number": "WND-COCKPIT-5611",
            "description": "Captain Heated Windshield Panel",
            "ata_chapter": "56 - Windows",
            "vendor_id": "VEND-SKYH-04",
            "condition": "FN",
            "quantity_available": 1,
            "unit_price": 31000.0,
            "warehouse_location": "ATL",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-WND-901",
            "tags_notes": "PPG Aerospace certified."
        },
        {
            "id": "PART-13",
            "part_number": "PUMP-FUEL-BOOST-2821",
            "description": "Center Tank Fuel Boost Pump",
            "ata_chapter": "28 - Fuel",
            "vendor_id": "VEND-APEX-03",
            "condition": "OH",
            "quantity_available": 2,
            "unit_price": 13900.0,
            "warehouse_location": "DFW",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-BST-110",
            "tags_notes": "Eaton Aerospace overhauled unit."
        },
        {
            "id": "PART-14",
            "part_number": "OXY-CREW-MASK-3510",
            "description": "Quick-Donning Crew Oxygen Mask & Regulator",
            "ata_chapter": "35 - Oxygen",
            "vendor_id": "VEND-JETC-05",
            "condition": "FN",
            "quantity_available": 4,
            "unit_price": 6400.0,
            "warehouse_location": "LAX",
            "has_8130_3": True,
            "has_easa_form_1": False,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-MSK-4001",
            "tags_notes": "Zodiac Aerospace certified mask."
        },
        {
            "id": "PART-15",
            "part_number": "STARTER-ENG-8011",
            "description": "Pneumatic Engine Air Starter Turbine",
            "ata_chapter": "80 - Starting",
            "vendor_id": "VEND-EUR-06",
            "condition": "OH",
            "quantity_available": 1,
            "unit_price": 27500.0,
            "warehouse_location": "FRA",
            "has_8130_3": True,
            "has_easa_form_1": True,
            "has_trace_to_oem": True,
            "has_coc": True,
            "serial_number": "SN-STR-994",
            "tags_notes": "Full dual release release certs."
        }
    ]

    for p in parts_data:
        part_obj = Part(**p)
        db.add(part_obj)
        # Add doc records
        if p["has_8130_3"]:
            db.add(PartDocument(
                id=f"DOC-8130-{p['id']}",
                part_id=p['id'],
                doc_type="FAA Form 8130-3",
                doc_number=f"FAA-8130-3-{p['id']}-REV4",
                issuer="FAA Authorized DAR",
                is_valid=True
            ))
        if p["has_easa_form_1"]:
            db.add(PartDocument(
                id=f"DOC-EASA-{p['id']}",
                part_id=p['id'],
                doc_type="EASA Form 1",
                doc_number=f"EASA-F1-{p['id']}-2026",
                issuer="LBA German CAA",
                is_valid=True
            ))
    db.commit()

    # 4. Seed AOG Cases (15+ cases including HERO case N42Q, malformed, documentation conflict, etc.)
    cases_data = [
        # HERO DEMO CASE: N42Q
        {
            "id": "CASE-N42Q-01",
            "tail_number": "N42Q",
            "aircraft_type": "Boeing 737-800",
            "defect_description": "System A Engine-Driven Hydraulic Pump low pressure warning on gate arrival. Metal contamination check clear. Requires replacement EDP pump assembly before flight dispatch.",
            "raw_intake_payload": {
                "source": "ACARS / Pilot Defect Log",
                "flight": "SK-482",
                "logged_by": "Capt. Sullivan",
                "defect_code": "HYD-SYS-A-LO-PRESS"
            },
            "ata_chapter": "29 - Hydraulic Power",
            "part_number": "HYD-PUMP-2901",
            "part_name": "Engine-Driven Hydraulic Pump EDP",
            "priority": "AOG",
            "location": "ORD",
            "current_stage": "HUMAN_REVIEW",
            "confidence_score": 0.91,
            "risk_level": "LOW",
            "status": "Awaiting Approval",
            "estimated_recovery_hours": 4.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(minutes=24)
        },
        # CASE 2: N18AX
        {
            "id": "CASE-N18AX-02",
            "tail_number": "N18AX",
            "aircraft_type": "Airbus A320-200",
            "defect_description": "Main gear carbon brake assembly #2 hydraulic actuator piston weeping fluid beyond permissible limits in MEL.",
            "raw_intake_payload": {"source": "TechLog Inspection", "station": "DFW"},
            "ata_chapter": "32 - Landing Gear",
            "part_number": "BRK-ASSY-3208",
            "part_name": "Carbon Brake Assembly Main Gear",
            "priority": "AOG",
            "location": "DFW",
            "current_stage": "HUMAN_REVIEW",
            "confidence_score": 0.88,
            "risk_level": "LOW",
            "status": "Awaiting Approval",
            "estimated_recovery_hours": 6.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(minutes=45)
        },
        # CASE 3: N72LK (Documentation Review / Low Confidence)
        {
            "id": "CASE-N72LK-03",
            "tail_number": "N72LK",
            "aircraft_type": "Boeing 777-300ER",
            "defect_description": "Left Angle of Attack vane erratic readings during climbout. Intermittent disagree flag.",
            "raw_intake_payload": {"source": "CMC BITE Test"},
            "ata_chapter": "34 - Navigation",
            "part_number": "SNSR-AOA-3411",
            "part_name": "Angle of Attack Sensor Transmitter",
            "priority": "URGENT",
            "location": "LAX",
            "current_stage": "SPECIALIST_ROUTING",
            "confidence_score": 0.62,
            "risk_level": "HIGH",
            "status": "Needs Review",
            "estimated_recovery_hours": 8.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=1)
        },
        # CASE 4: Malformed input (Missing Tail Number)
        {
            "id": "CASE-ERR-04",
            "tail_number": None,
            "aircraft_type": "Boeing 737",
            "defect_description": "Bleed valve jammed open in high stage mode at gate. Urgent assistance requested.",
            "raw_intake_payload": {"source": "Radio Dispatch Note", "raw_text": "Need bleed valve immediately. Tail unknown, parked at Terminal 2."},
            "ata_chapter": "36 - Pneumatic",
            "part_number": "VALV-PRSOV-3601",
            "part_name": "Bleed Air PRSOV",
            "priority": "AOG",
            "location": "ATL",
            "current_stage": "MANUAL_TAGGING",
            "confidence_score": 0.20,
            "risk_level": "CRITICAL",
            "status": "Needs Review",
            "estimated_recovery_hours": 12.0,
            "is_malformed": True,
            "malformed_reason": "Missing required aircraft identifier (tail_number). Sent to Operations Manual Tagging Queue.",
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        },
        # CASE 5: Malformed Part Number
        {
            "id": "CASE-ERR-05",
            "tail_number": "N905AA",
            "aircraft_type": "Boeing 787-9",
            "defect_description": "Engine starter failed to spin up. Suspected air turbine issue.",
            "raw_intake_payload": {"source": "Crew report"},
            "ata_chapter": "80 - Starting",
            "part_number": "UNKNOWN-PART-99",
            "part_name": "Pneumatic Starter",
            "priority": "AOG",
            "location": "MIA",
            "current_stage": "MANUAL_TAGGING",
            "confidence_score": 0.35,
            "risk_level": "HIGH",
            "status": "Needs Review",
            "estimated_recovery_hours": 14.0,
            "is_malformed": True,
            "malformed_reason": "Part number UNKNOWN-PART-99 cannot be verified against Illustrated Parts Catalog (IPC). Requires Tech Ops lookup.",
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=30)
        },
        # CASE 6: N311VA
        {
            "id": "CASE-N311VA-06",
            "tail_number": "N311VA",
            "aircraft_type": "Airbus A321neo",
            "defect_description": "Center tank boost pump low output pressure during refueling transfer sequence.",
            "raw_intake_payload": {"source": "Maintenance Log"},
            "ata_chapter": "28 - Fuel",
            "part_number": "PUMP-FUEL-BOOST-2821",
            "part_name": "Center Tank Fuel Boost Pump",
            "priority": "AOG",
            "location": "JFK",
            "current_stage": "APPROVED",
            "confidence_score": 0.94,
            "risk_level": "LOW",
            "status": "Approved",
            "estimated_recovery_hours": 3.5,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=3)
        },
        # CASE 7: N540UA
        {
            "id": "CASE-N540UA-07",
            "tail_number": "N540UA",
            "aircraft_type": "Embraer E175",
            "defect_description": "Crew oxygen mask microphone intermittent on VHF1.",
            "raw_intake_payload": {"source": "Pre-flight Inspection"},
            "ata_chapter": "35 - Oxygen",
            "part_number": "OXY-CREW-MASK-3510",
            "part_name": "Crew Oxygen Mask",
            "priority": "URGENT",
            "location": "DEN",
            "current_stage": "SPECIALIST_ROUTING",
            "confidence_score": 0.89,
            "risk_level": "LOW",
            "status": "Processing",
            "estimated_recovery_hours": 4.5,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=3, minutes=45)
        },
        # CASE 8: N882DL
        {
            "id": "CASE-N882DL-08",
            "tail_number": "N882DL",
            "aircraft_type": "Airbus A350-900",
            "defect_description": "Integrated Drive Generator IDG 1 oil temperature amber alert during turnaround.",
            "raw_intake_payload": {"source": "ECAM Alert"},
            "ata_chapter": "24 - Electrical Power",
            "part_number": "GEN-IDG-2402",
            "part_name": "Integrated Drive Generator",
            "priority": "AOG",
            "location": "ATL",
            "current_stage": "HUMAN_REVIEW",
            "confidence_score": 0.93,
            "risk_level": "LOW",
            "status": "Awaiting Approval",
            "estimated_recovery_hours": 7.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=4)
        },
        # CASE 9: N674SW
        {
            "id": "CASE-N674SW-09",
            "tail_number": "N674SW",
            "aircraft_type": "Boeing 737 MAX 8",
            "defect_description": "Right cockpit windshield electric heating element open circuit. Visual inspection shows hairline grid separation.",
            "raw_intake_payload": {"source": "Line Maintenance"},
            "ata_chapter": "56 - Windows",
            "part_number": "WND-COCKPIT-5611",
            "part_name": "Captain Heated Windshield Panel",
            "priority": "AOG",
            "location": "PHX",
            "current_stage": "SPECIALIST_ROUTING",
            "confidence_score": 0.85,
            "risk_level": "MEDIUM",
            "status": "Processing",
            "estimated_recovery_hours": 5.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        },
        # CASE 10: N42Q Previous closed case
        {
            "id": "CASE-N42Q-HIST-10",
            "tail_number": "N42Q",
            "aircraft_type": "Boeing 737-800",
            "defect_description": "TCAS antenna damaged by ground servicing high-loader.",
            "raw_intake_payload": {"source": "Ground Damage Report"},
            "ata_chapter": "34 - Navigation",
            "part_number": "RAD-TCAS-3444",
            "part_name": "TCAS II Directional Antenna",
            "priority": "AOG",
            "location": "ORD",
            "current_stage": "COMPLETED",
            "confidence_score": 0.95,
            "risk_level": "LOW",
            "status": "Closed",
            "estimated_recovery_hours": 2.5,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=2)
        },
        # CASE 11
        {
            "id": "CASE-N18AX-HIST-11",
            "tail_number": "N18AX",
            "aircraft_type": "Airbus A320-200",
            "defect_description": "APU fuel control unit internal bypass valve sticking during cold startup.",
            "raw_intake_payload": {"source": "APU BITE"},
            "ata_chapter": "49 - Auxiliary Power",
            "part_number": "APU-FUEL-4903",
            "part_name": "APU Fuel Control Unit",
            "priority": "AOG",
            "location": "DFW",
            "current_stage": "COMPLETED",
            "confidence_score": 0.92,
            "risk_level": "LOW",
            "status": "Closed",
            "estimated_recovery_hours": 4.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=3)
        },
        # CASE 12
        {
            "id": "CASE-N72LK-HIST-12",
            "tail_number": "N72LK",
            "aircraft_type": "Boeing 777-300ER",
            "defect_description": "Outboard flap rotary actuator bearing excessive play detected during A-Check.",
            "raw_intake_payload": {"source": "Scheduled Inspection"},
            "ata_chapter": "27 - Flight Controls",
            "part_number": "ACT-FLAP-2710",
            "part_name": "Outboard Flap Rotary Actuator",
            "priority": "URGENT",
            "location": "LAX",
            "current_stage": "COMPLETED",
            "confidence_score": 0.90,
            "risk_level": "LOW",
            "status": "Closed",
            "estimated_recovery_hours": 5.5,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=5)
        },
        # CASE 13: Vendor Search Timeout simulation
        {
            "id": "CASE-TIMEOUT-13",
            "tail_number": "N905AA",
            "aircraft_type": "Boeing 787-9",
            "defect_description": "Cabin air compressor secondary controller communication loss over AFDX network.",
            "raw_intake_payload": {"source": "Central Maintenance Computer"},
            "ata_chapter": "21 - Air Conditioning",
            "part_number": "CTRL-CAC-2199",
            "part_name": "CAC Electronic Controller",
            "priority": "AOG",
            "location": "MIA",
            "current_stage": "SPECIALIST_ROUTING",
            "confidence_score": 0.40,
            "risk_level": "HIGH",
            "status": "Needs Review",
            "estimated_recovery_hours": 10.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=6)
        },
        # CASE 14: Documentation Conflict Case
        {
            "id": "CASE-DOC-CONFLICT-14",
            "tail_number": "N311VA",
            "aircraft_type": "Airbus A321neo",
            "defect_description": "Engine air starter turbine housing microfracture detected via borescope.",
            "raw_intake_payload": {"source": "Borescope Inspection Report"},
            "ata_chapter": "80 - Starting",
            "part_number": "STARTER-ENG-8011",
            "part_name": "Pneumatic Engine Starter",
            "priority": "AOG",
            "location": "JFK",
            "current_stage": "HUMAN_REVIEW",
            "confidence_score": 0.72,
            "risk_level": "MEDIUM",
            "status": "Needs Review",
            "estimated_recovery_hours": 6.5,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=7)
        },
        # CASE 15: Fresh Ingest Case
        {
            "id": "CASE-INGEST-15",
            "tail_number": "N540UA",
            "aircraft_type": "Embraer E175",
            "defect_description": "Hydraulic System B reservoir low level sensor alert after pushback.",
            "raw_intake_payload": {"source": "Flight Crew Radio"},
            "ata_chapter": "29 - Hydraulic Power",
            "part_number": "HYD-PUMP-2901",
            "part_name": "Engine-Driven Hydraulic Pump EDP",
            "priority": "AOG",
            "location": "DEN",
            "current_stage": "INTAKE",
            "confidence_score": 0.50,
            "risk_level": "MEDIUM",
            "status": "Processing",
            "estimated_recovery_hours": 4.0,
            "is_malformed": False,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
        }
    ]

    for c in cases_data:
        case_obj = SquawkCase(**c)
        db.add(case_obj)
    db.commit()

    # 5. Populate Specialists & Candidates for HERO CASE (CASE-N42Q-01)
    hero_case_id = "CASE-N42Q-01"
    
    # Sourcing specialist output for Hero Case
    db.add(AgentResult(
        id=f"RES-SRC-{hero_case_id}",
        case_id=hero_case_id,
        specialist_name="Sourcing Specialist",
        status="COMPLETED",
        confidence=0.96,
        raw_output={
            "candidates": [
                {
                    "vendor_id": "VEND-AERO-01",
                    "vendor_name": "AeroParts Inc.",
                    "part_id": "PART-01",
                    "part_number": "HYD-PUMP-2901",
                    "condition": "OH (Overhauled)",
                    "part_cost": 19800.0,
                    "warehouse": "ORD",
                    "match_type": "EXACT_PART_NUMBER_MATCH",
                    "available_qty": 2
                },
                {
                    "vendor_id": "VEND-GLOB-02",
                    "vendor_name": "Global Aviation Supply",
                    "part_id": "PART-02",
                    "part_number": "HYD-PUMP-2901",
                    "condition": "SV (Serviceable)",
                    "part_cost": 14900.0,
                    "warehouse": "MIA",
                    "match_type": "EXACT_PART_NUMBER_MATCH",
                    "available_qty": 1
                },
                {
                    "vendor_id": "VEND-APEX-03",
                    "vendor_name": "Apex Rotables & Spares",
                    "part_id": "PART-03",
                    "part_number": "HYD-PUMP-2901",
                    "condition": "FN (Factory New)",
                    "part_cost": 24500.0,
                    "warehouse": "DFW",
                    "match_type": "EXACT_PART_NUMBER_MATCH",
                    "available_qty": 1
                },
                {
                    "vendor_id": "VEND-PAC-07",
                    "vendor_name": "Pacific Aero Surplus",
                    "part_id": "PART-04",
                    "part_number": "HYD-PUMP-2901",
                    "condition": "AR (As Removed)",
                    "part_cost": 12800.0,
                    "warehouse": "SEA",
                    "match_type": "EXACT_PART_NUMBER_MATCH",
                    "available_qty": 1
                }
            ],
            "confidence": 0.96,
            "missing_information": []
        },
        execution_time_ms=420
    ))

    # Documentation specialist output for Hero Case
    db.add(AgentResult(
        id=f"RES-DOC-{hero_case_id}",
        case_id=hero_case_id,
        specialist_name="Documentation Specialist",
        status="COMPLETED",
        confidence=0.92,
        raw_output={
            "evaluations": [
                {
                    "vendor_name": "AeroParts Inc.",
                    "documentation_status": "Complete",
                    "has_faa_8130_3": True,
                    "has_easa_form_1": True,
                    "has_trace": True,
                    "notes": "Verified Dual Release FAA 8130-3 / EASA Form 1 on file. Zero hours since FAA 145 repair station OH."
                },
                {
                    "vendor_name": "Global Aviation Supply",
                    "documentation_status": "Missing Required Document",
                    "has_faa_8130_3": False,
                    "has_easa_form_1": False,
                    "has_trace": True,
                    "notes": "CRITICAL: FAA Form 8130-3 airworthiness certificate is MISSING. Part holds only internal shop teardown tag."
                },
                {
                    "vendor_name": "Apex Rotables & Spares",
                    "documentation_status": "Complete",
                    "has_faa_8130_3": True,
                    "has_easa_form_1": False,
                    "has_trace": True,
                    "notes": "OEM Certificate of Conformance and FAA 8130-3 present."
                },
                {
                    "vendor_name": "Pacific Aero Surplus",
                    "documentation_status": "Incomplete",
                    "has_faa_8130_3": False,
                    "has_easa_form_1": False,
                    "has_trace": False,
                    "notes": "Non-incident statement and trace to 121 operator missing."
                }
            ],
            "disclaimer": "Documentation Specialist evaluates presence of evidence in database only. Formal airworthiness release requires FAA/EASA certified maintenance personnel."
        },
        execution_time_ms=380
    ))

    # Logistics specialist output for Hero Case
    db.add(AgentResult(
        id=f"RES-LOG-{hero_case_id}",
        case_id=hero_case_id,
        specialist_name="Logistics Specialist",
        status="COMPLETED",
        confidence=0.95,
        raw_output={
            "routes": [
                {
                    "vendor_name": "AeroParts Inc.",
                    "origin": "ORD Warehouse (Local)",
                    "destination": "ORD Hangar 3",
                    "shipping_option": "Dedicated Local AOG Hot-Shot Van",
                    "freight_cost": 1300.0,
                    "part_cost": 19800.0,
                    "total_cost": 21100.0,
                    "eta_hours": 4.0,
                    "confidence": 0.95
                },
                {
                    "vendor_name": "Global Aviation Supply",
                    "origin": "MIA Hub",
                    "destination": "ORD Hangar 3",
                    "shipping_option": "Next Flight Out Cargo (MIA->ORD)",
                    "freight_cost": 2400.0,
                    "part_cost": 14900.0,
                    "total_cost": 17300.0,
                    "eta_hours": 12.0,
                    "confidence": 0.82
                },
                {
                    "vendor_name": "Apex Rotables & Spares",
                    "origin": "DFW Hub",
                    "destination": "ORD Hangar 3",
                    "shipping_option": "Next Flight Out Cargo (DFW->ORD)",
                    "freight_cost": 2100.0,
                    "part_cost": 24500.0,
                    "total_cost": 26600.0,
                    "eta_hours": 6.5,
                    "confidence": 0.90
                },
                {
                    "vendor_name": "Pacific Aero Surplus",
                    "origin": "SEA Hub",
                    "destination": "ORD Hangar 3",
                    "shipping_option": "Commercial Overnight Air",
                    "freight_cost": 1800.0,
                    "part_cost": 12800.0,
                    "total_cost": 14600.0,
                    "eta_hours": 18.0,
                    "confidence": 0.70
                }
            ]
        },
        execution_time_ms=410
    ))

    # Validator result for Hero Case
    db.add(ValidationResult(
        id=f"VAL-{hero_case_id}",
        case_id=hero_case_id,
        status="VALIDATED_WITH_HUMAN_REVIEW",
        conflicts_detected=[
            {
                "candidate": "Global Aviation Supply",
                "conflict_type": "DOCUMENTATION_AIRWORTHINESS_DEFICIT",
                "severity": "CRITICAL_FLAG",
                "description": "Sourcing Specialist identified Global Aviation Supply as lowest base cost ($14,900), but Documentation Specialist discovered that mandatory FAA Form 8130-3 airworthiness tag is absent. Cannot install without legal release documentation."
            },
            {
                "candidate": "Pacific Aero Surplus",
                "conflict_type": "TRACE_DEFICIT",
                "severity": "HIGH_FLAG",
                "description": "Missing OEM trace and non-incident statement from previous operator."
            }
        ],
        flagged_candidates=["Global Aviation Supply", "Pacific Aero Surplus"],
        valid_candidates=["AeroParts Inc.", "Apex Rotables & Spares"],
        risk_level="LOW",
        confidence=0.91,
        requires_human_review=True,
        reasoning_summary="Validator analyzed 4 candidate options. Although Global Aviation Supply is $3,800 cheaper, it is FLAGGED due to missing FAA 8130-3 airworthiness tags. AeroParts Inc. is RECOMMENDED as it provides complete Dual Release documentation, fastest 4-hour local hot-shot delivery, and 94% historical vendor reliability score."
    ))

    # Hero Candidates
    hero_candidates = [
        RecoveryCandidate(
            id="CAND-N42Q-01",
            case_id=hero_case_id,
            vendor_id="VEND-AERO-01",
            part_id="PART-01",
            vendor_name="AeroParts Inc.",
            part_number="HYD-PUMP-2901",
            condition="OH (Overhauled)",
            part_cost=19800.0,
            freight_cost=1300.0,
            total_landed_cost=21100.0,
            estimated_eta_hours=4.0,
            shipping_method="Dedicated Local AOG Hot-Shot Van",
            documentation_status="Complete",
            doc_notes="Dual Release FAA 8130-3 / EASA Form 1 verified",
            vendor_reliability_score=0.94,
            overall_rank=1,
            is_recommended=True,
            is_flagged=False,
            flag_reason=None,
            confidence=0.91
        ),
        RecoveryCandidate(
            id="CAND-N42Q-02",
            case_id=hero_case_id,
            vendor_id="VEND-GLOB-02",
            part_id="PART-02",
            vendor_name="Global Aviation Supply",
            part_number="HYD-PUMP-2901",
            condition="SV (Serviceable)",
            part_cost=14900.0,
            freight_cost=2400.0,
            total_landed_cost=17300.0,
            estimated_eta_hours=12.0,
            shipping_method="Next Flight Out Cargo (MIA->ORD)",
            documentation_status="Missing Required Tag",
            doc_notes="FAA Form 8130-3 missing. Internal shop tag only.",
            vendor_reliability_score=0.58,
            overall_rank=3,
            is_recommended=False,
            is_flagged=True,
            flag_reason="FLAGGED: Missing FAA Form 8130-3 airworthiness certificate. Higher operational risk.",
            confidence=0.55
        ),
        RecoveryCandidate(
            id="CAND-N42Q-03",
            case_id=hero_case_id,
            vendor_id="VEND-APEX-03",
            part_id="PART-03",
            vendor_name="Apex Rotables & Spares",
            part_number="HYD-PUMP-2901",
            condition="FN (Factory New)",
            part_cost=24500.0,
            freight_cost=2100.0,
            total_landed_cost=26600.0,
            estimated_eta_hours=6.5,
            shipping_method="Next Flight Out Cargo (DFW->ORD)",
            documentation_status="Complete",
            doc_notes="Factory New Parker OEM cert with FAA 8130-3",
            vendor_reliability_score=0.91,
            overall_rank=2,
            is_recommended=False,
            is_flagged=False,
            flag_reason=None,
            confidence=0.88
        ),
        RecoveryCandidate(
            id="CAND-N42Q-04",
            case_id=hero_case_id,
            vendor_id="VEND-PAC-07",
            part_id="PART-04",
            vendor_name="Pacific Aero Surplus",
            part_number="HYD-PUMP-2901",
            condition="AR (As Removed)",
            part_cost=12800.0,
            freight_cost=1800.0,
            total_landed_cost=14600.0,
            estimated_eta_hours=18.0,
            shipping_method="Commercial Overnight Air",
            documentation_status="Incomplete",
            doc_notes="Missing trace to 121 operator and non-incident cert.",
            vendor_reliability_score=0.72,
            overall_rank=4,
            is_recommended=False,
            is_flagged=True,
            flag_reason="FLAGGED: Uncertified pedigree and high delivery latency (18 hrs).",
            confidence=0.48
        )
    ]
    for cand in hero_candidates:
        db.add(cand)

    # 6. Seed Activity Logs
    logs = [
        ActivityLog(
            id=str(uuid.uuid4()),
            case_id=hero_case_id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=24),
            category="PIPELINE",
            title="AOG Case Received",
            details="Intake webhook parsed defect report for Boeing 737-800 N42Q (Hydraulic EDP fault)."
        ),
        ActivityLog(
            id=str(uuid.uuid4()),
            case_id=hero_case_id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=23),
            category="PIPELINE",
            title="RocketRide Pipeline Started",
            details="Pipeline 'source_recovery.pipe' initiated with parallel execution branches."
        ),
        ActivityLog(
            id=str(uuid.uuid4()),
            case_id=hero_case_id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=22),
            category="SPECIALIST",
            title="Sourcing Specialist Completed",
            details="Matched 4 vendor candidates for part HYD-PUMP-2901 across inventory hubs."
        ),
        ActivityLog(
            id=str(uuid.uuid4()),
            case_id=hero_case_id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=22),
            category="SPECIALIST",
            title="Documentation Specialist Completed",
            details="Evaluated 8130-3 and EASA Form 1 certificates. Flagged missing documentation on candidate B."
        ),
        ActivityLog(
            id=str(uuid.uuid4()),
            case_id=hero_case_id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=21),
            category="SPECIALIST",
            title="Logistics Specialist Completed",
            details="Calculated landed costs and ETAs. Fastest viable route identified at 4.0 hrs."
        ),
        ActivityLog(
            id=str(uuid.uuid4()),
            case_id=hero_case_id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=20),
            category="VALIDATOR",
            title="Validator Agent Completed",
            details="Validator reconciled specialist outputs. Flagged Global Aviation Supply for missing 8130-3. Recommended AeroParts Inc."
        ),
        ActivityLog(
            id=str(uuid.uuid4()),
            case_id=hero_case_id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=19),
            category="APPROVAL",
            title="Human Review Required",
            details="Case routed to Duty Tech Ops Director for recovery plan authorization."
        ),
    ]
    for l in logs:
        db.add(l)

    # 7. Seed sample previous closed case outcome (to demonstrate historical memory feedback loop)
    hist_case_id = "CASE-N42Q-HIST-10"
    db.add(Outcome(
        id="OUTCOME-N42Q-HIST-10",
        case_id=hist_case_id,
        vendor_id="VEND-AERO-01",
        predicted_eta_hours=2.5,
        actual_delivery_hours=2.4,
        predicted_cost=8900.0,
        actual_cost=8900.0,
        documentation_accepted=True,
        recovery_successful=True,
        vendor_performance_rating=5,
        operator_notes="Delivered ahead of schedule directly to Hangar 3 with pristine 8130-3 tag. Aircraft returned to service."
    ))

    db.commit()
    print("[SUCCESS] Database seeding completed successfully.")
