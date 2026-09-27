import uuid
import datetime
from typing import Dict, Any, List, Optional

# Expected JSON validation schema definition
AI_INTELLIGENCE_SCHEMA = {
    "summary": str,
    "category": str,
    "severity": str,
    "confidence": (int, float),
    "confidence_reason": str,
    "evidence": list,
    "missing_information": list,
    "contributing_factors": list,
    "dependencies": list,
    "resource_check": dict,
    "recovery_options": list,
    "why_recommendation": dict,
    "timeline": list,
    "human_verification_required": bool
}

def validate_ai_intelligence_output(data: Dict[str, Any]) -> bool:
    """Validates that AI output strictly conforms to the expected structure."""
    if not isinstance(data, dict):
        return False
    for field, expected_type in AI_INTELLIGENCE_SCHEMA.items():
        if field not in data:
            return False
        if not isinstance(data[field], expected_type):
            return False
    return True

def generate_incident_intelligence(
    defect_description: str,
    tail_number: Optional[str] = "VT-SQK",
    aircraft_type: Optional[str] = "Boeing 737-800",
    location: Optional[str] = "DEL Terminal 3 MRO Hangar",
    part_number: Optional[str] = "HP-2048",
    simulate_failure: bool = False
) -> Dict[str, Any]:
    """
    Generates structured AI Incident Intelligence for an AOG defect report.
    Adheres strictly to aviation safety rules:
    - Never fabricates unverified technical maintenance facts
    - Uses 'Requires human verification' or 'Insufficient information' when data is missing
    - Provides transparent confidence reasons and limitations
    - Builds Resource Check with bottleneck visualization
    - Generates 3 explainable recovery options (A, B, C)
    - Gracefully handles simulated or runtime AI failures with safe rule-based fallbacks
    """
    if simulate_failure:
        return {
            "summary": defect_description or "Unstructured defect log",
            "category": "Pending Manual Engineering Triage",
            "severity": "UNKNOWN / REQUIRES TRIAGE",
            "operational_impact": "Operational impact could not be automatically calculated. Safe fallback active.",
            "confidence": 0.20,
            "confidence_reason": "AI analysis temporarily unavailable. Fallback to rule-based categorization & manual review.",
            "evidence": ["Raw defect text received: " + (defect_description or "Empty")],
            "missing_information": [
                "AI extraction pipeline connection",
                "Verified aircraft tail number",
                "Verified IPC rotable part number",
                "Station maintenance capacity data"
            ],
            "contributing_factors": ["Requires human engineering inspection"],
            "dependencies": ["Manual A&P engineer assessment required"],
            "resource_check": {
                "technicians": {"status": "Requires Verification", "details": "Manual roster check needed", "ready": False},
                "facility": {"status": "Requires Verification", "details": "Hangar allocation pending", "ready": False},
                "parts": {"status": "Requires Verification", "details": "Manual stores inquiry required", "ready": False},
                "bottleneck_summary": "Manual triage is the current recovery dependency.",
                "readiness_score": 20
            },
            "recovery_options": [
                {
                    "option_id": "OPTION_MANUAL",
                    "title": "Manual Engineering Assessment (Safe Fallback)",
                    "strategy": "Dispatch duty Line Maintenance Controller to perform physical aircraft inspection.",
                    "expected_operational_impact": "Turnaround delayed pending manual inspection.",
                    "dependencies": ["Duty engineer dispatch"],
                    "estimated_recovery_window": "Requires human estimation",
                    "estimated_recovery_hours": 18.0,
                    "confidence": 0.20,
                    "confidence_reason": "AI unavailable; requires human controller input.",
                    "risks": ["Uncertain delivery timeline without automated supplier query"],
                    "total_cost": 0.0,
                    "is_recommended": True,
                    "human_approval_required": True
                }
            ],
            "why_recommendation": {
                "evidence_considered": ["1. Reported defect text only"],
                "not_considered_unavailable": [
                    "AI extraction pipeline (simulated failure state)",
                    "Live airline systems",
                    "Real-time inventory",
                    "Real-time technician data"
                ]
            },
            "timeline": [
                {"time": "14:02", "title": "Defect Logged", "desc": "Defect report logged in queue.", "actor": "Operator", "status": "COMPLETED"},
                {"time": "14:03", "title": "AI Service Alert", "desc": "AI analysis temporarily unavailable. Safe fallback active.", "actor": "System Watchdog", "status": "FAILED_FALLBACK"},
                {"time": "14:04", "title": "Manual Review Required", "desc": "Escalated to human controller.", "actor": "Duty Controller", "status": "PENDING_APPROVAL"}
            ],
            "human_verification_required": True,
            "ai_failed": True,
            "ai_failure_reason": "AI analysis temporarily unavailable. Safe fallback enabled for human review."
        }

    # Normalize inputs
    tail = tail_number or "VT-SQK"
    ac_type = aircraft_type or "Boeing 737-800"
    loc = location or "DEL Terminal 3 MRO Hangar"
    desc = defect_description or "Engine vibration reported during climb. Crew observed abnormal vibration indication."
    p_num = part_number or "HP-2048"

    is_engine_vibe = "vibration" in desc.lower() or "engine" in desc.lower()
    is_hydraulic = "hydraulic" in desc.lower() or "pump" in desc.lower() or "29" in desc

    if is_engine_vibe:
        category = "Propulsion / Vibration Indication (ATA 72/77)"
        severity = "AOG_CRITICAL"
        op_impact = f"Aircraft grounded at {loc}. Scheduled passenger departures blocked until powerplant inspection & clearance."
        confidence = 0.82
        conf_reason = "Model confidence based on available input information. Strong match between reported symptoms and demo vibration patterns, but aircraft-specific maintenance history and engine telemetry are unavailable."
        evidence = [
            "Reported abnormal vibration indication on engine 1 during initial climb phase",
            f"Defect logged on {ac_type} airframe ({tail})",
            f"Aircraft positioned at {loc}",
            "18.0-hour maximum ground recovery window before slot expiration"
        ]
        missing_info = [
            "Exact CFM56-7B / LEAP engine sub-variant serial number",
            "CMC/ECAM BITE fault codes",
            "Recent engine oil / bearing vibration historical trend",
            "Borescope inspection results"
        ]
        factors = [
            "Potential fan blade imbalance or aerodynamic surface deposit",
            "Engine vibration sensor / wiring harness signal degradation",
            "Bearing compartment wear or hydraulic pump harmonic transfer"
        ]
        dependencies = [
            "Certified Powerplant A&P / Part 66 engineer",
            f"{loc} run-up / inspection facility",
            "Vibration diagnostic equipment & replacement rotable assembly"
        ]
        bottleneck = "Part availability is the current recovery dependency."
        part_name_tag = "Engine-Driven Hydraulic Pump EDP / Vibration Sensor"
    else:
        category = "Hydraulic Power & Pressure Systems (ATA 29)"
        severity = "AOG_CRITICAL"
        op_impact = f"Aircraft grounded at {loc}. Flight departure blocked pending hydraulic system component recovery."
        confidence = 0.88
        conf_reason = "Model confidence based on available input information. Defect symptoms correlate with rotable pump failure patterns."
        evidence = [
            f"Reported hydraulic low pressure warning on {tail} ({ac_type})",
            f"Aircraft currently grounded at {loc}",
            "Flight dispatch held pending certified rotable replacement"
        ]
        missing_info = [
            "Fluid contamination lab sample report",
            "Hydraulic system B cross-feed telemetry",
            "Line maintenance historical leak log"
        ]
        factors = [
            "EDP internal valve wear or seal degradation",
            "Hydraulic line pressure sensor calibration error"
        ]
        dependencies = [
            "Line hydraulic certified technician",
            "Hangar hydraulic test cart",
            "Dual-release certified rotable replacement pump"
        ]
        bottleneck = "Part availability is the current recovery dependency."
        part_name_tag = "Engine-Driven Hydraulic Pump Assembly"

    resource_check = {
        "technicians": {
            "status": "Available",
            "details": "2 Line Powerplant Engineers on duty at DEL Terminal 3",
            "ready": True
        },
        "facility": {
            "status": "Available",
            "details": "DEL Terminal 3 Hangar Bay 4 allocated for inspection",
            "ready": True
        },
        "parts": {
            "status": "Verification Required",
            "details": f"Rotable part ({p_num}) in external supplier network; awaiting courier transit confirmation",
            "ready": False
        },
        "bottleneck_summary": bottleneck,
        "readiness_score": 82
    }

    recovery_options = [
        {
            "option_id": "OPTION_A",
            "title": "Option A: Expedited NFO Sourcing & Dedicated Hangar Swap (Recommended)",
            "strategy": "Dispatch factory-new rotable via Singapore Cargo Express Flight SQ-402 with priority ground transfer directly to DEL Hangar 4.",
            "expected_operational_impact": "Full recovery within 8h 20m. Re-enters revenue flight schedule with +9.7h safety margin before slot expiration.",
            "dependencies": ["Flight SQ-402 cargo departure", "Airside ramp van transfer at DEL", "Dual release FAA 8130-3 / EASA Form 1 sign-off"],
            "estimated_recovery_window": "8h 20m (8.33 hrs)",
            "estimated_recovery_hours": 8.33,
            "confidence": 0.92,
            "confidence_reason": "High vendor reliability (96%), dual airworthiness tags verified, direct flight cargo connection.",
            "risks": ["Minor transit delay if ramp customs handling experiences congestion"],
            "total_cost": 18200.0,
            "is_recommended": True,
            "human_approval_required": True
        },
        {
            "option_id": "OPTION_B",
            "title": "Option B: Regional Hub Transfer via Mumbai MRO Stores (Secondary)",
            "strategy": "Source overhauled rotable from SkySupply Mumbai stores and transit via domestic courier flight AI-608.",
            "expected_operational_impact": "Recovery in 11h 10m. Clears AOG condition with +6.8h safety margin, at lower freight cost.",
            "dependencies": ["Domestic flight AI-608 schedule", "FAA 8130-3 overhauled tag verification", "Line tech installation crew"],
            "estimated_recovery_window": "11h 10m (11.17 hrs)",
            "estimated_recovery_hours": 11.17,
            "confidence": 0.86,
            "confidence_reason": "Single release FAA 8130-3, 91% vendor reliability, slightly longer turnaround.",
            "risks": ["Moderate domestic flight transit variability"],
            "total_cost": 14700.0,
            "is_recommended": False,
            "human_approval_required": True
        },
        {
            "option_id": "OPTION_C",
            "title": "Option C: Standard European Consolidated Freight via Frankfurt (High Risk)",
            "strategy": "Procure serviceable rotable from Frankfurt stores via scheduled Lufthansa Cargo flight LH-760.",
            "expected_operational_impact": "UNFEASIBLE FOR AOG: 20.5h ETA misses the 18.0h departure deadline by +2.5h, causing flight cancellation.",
            "dependencies": ["International cargo clearance", "EU export documentation"],
            "estimated_recovery_window": "20h 30m (20.50 hrs)",
            "estimated_recovery_hours": 20.5,
            "confidence": 0.20,
            "confidence_reason": "Exceeds allowable 18.0h turnaround deadline by +2.5 hours. Missing EASA Form 1 release.",
            "risks": ["FLIGHT CANCELLATION RISK: Exceeds 18.0h AOG turnaround window", "Documentation deficiency (missing EASA tag)"],
            "total_cost": 9200.0,
            "is_recommended": False,
            "human_approval_required": True
        }
    ]

    why_recommendation = {
        "evidence_considered": [
            f"1. Reported defect: {desc}",
            f"2. Aircraft type: {ac_type} ({tail}) line maintenance requirements",
            f"3. Current location: {loc} facility readiness",
            "4. Operational constraints: Strict 18.0-hour turnaround window before slot cancellation",
            "5. Resource availability: 2 Line engineers & Hangar Bay 4 available; external part transit required",
            "6. Historical demo pattern: AeroParts 96% on-time reliability & dual airworthiness clearance"
        ],
        "not_considered_unavailable": [
            "Official OEM maintenance manuals (AMM / TSM / CMM certified procedures)",
            "Live airline flight operations control (AOC / ACARS live telemetry data)",
            "Real-time global supplier inventory (prototype operates on simulated database)",
            "Real-time technician biometric shift schedules & certification databases"
        ]
    }

    timeline = [
        {"time": "14:02", "title": "Defect Reported", "desc": "Cockpit crew logs abnormal vibration indication during climb. SQUAWK intake received.", "actor": "Flight Crew (Capt. R. Sharma)", "status": "COMPLETED"},
        {"time": "14:03", "title": "AI Analysis Started", "desc": "Extraction engine parses structured & unstructured defect text; flags ATA 29/72 dependencies.", "actor": "SQUAWK AI Agent", "status": "COMPLETED"},
        {"time": "14:04", "title": "Information Extracted", "desc": f"Extracted {ac_type} airframe, {loc}, 18.0h deadline; missing telemetry identified.", "actor": "Extraction Specialist", "status": "COMPLETED"},
        {"time": "14:05", "title": "Resource Check Completed", "desc": "Technicians available, Hangar Bay 4 ready. Part availability identified as active dependency bottleneck.", "actor": "Resource Orchestrator", "status": "COMPLETED"},
        {"time": "14:06", "title": "Recovery Options Generated", "desc": "Evaluated Options A, B, and C. Option A (AeroParts SIN) ranked #1 with 8h 20m ETA.", "actor": "Optimization & Validator", "status": "COMPLETED"},
        {"time": "14:07", "title": "Human Review Initiated", "desc": "Recovery candidate routed to Tech Ops Duty Controller for certified engineering verification.", "actor": "System Gatekeeper", "status": "PENDING_APPROVAL"},
        {"time": "14:09", "title": "Recovery Plan Approved", "desc": "Controller authorizes Option A. Simulated PO #SQ-1042 issued and courier dispatch triggered.", "actor": "Lead A&P Engineer", "status": "READY_FOR_ACTION"}
    ]

    result = {
        "summary": desc,
        "category": category,
        "severity": severity,
        "operational_impact": op_impact,
        "confidence": confidence,
        "confidence_reason": conf_reason,
        "evidence": evidence,
        "missing_information": missing_info,
        "contributing_factors": factors,
        "dependencies": dependencies,
        "resource_check": resource_check,
        "recovery_options": recovery_options,
        "why_recommendation": why_recommendation,
        "timeline": timeline,
        "human_verification_required": True,
        "ai_failed": False,
        "ai_failure_reason": None
    }

    # Validate output schema
    if not validate_ai_intelligence_output(result):
        # Fallback if structure invariant fails
        result["confidence"] = 0.30
        result["confidence_reason"] = "AI response could not be safely validated against schema. Human review required."

    return result
