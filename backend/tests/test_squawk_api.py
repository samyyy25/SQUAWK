import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["environment"] == "SIMULATED AOG OPERATIONS ENVIRONMENT"
    assert data["agentic_tools_count"] == 12


def test_vt_sqk_flagship_case():
    response = client.get("/api/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 1

    hero = next((c for c in cases if c["tail_number"] == "VT-SQK"), None)
    assert hero is not None
    assert hero["id"] == "CASE-SQK-2048"
    assert hero["aircraft_type"] == "Boeing 737-800"
    assert hero["location"] == "DEL"
    assert hero["part_number"] == "HP-2048"
    assert hero["deadline_hours"] == 18.0
    assert len(hero["candidates"]) == 3

    # Candidate 1: AeroParts Singapore (Recommended)
    c1 = hero["candidates"][0]
    assert c1["vendor_name"] == "AeroParts Inc. (Singapore)"
    assert c1["is_recommended"] is True
    assert c1["total_landed_cost"] == 18200.0
    assert round(c1["estimated_eta_hours"], 1) == 8.3

    # Candidate 2: SkySupply Global (Alternative)
    c2 = hero["candidates"][1]
    assert c2["vendor_name"] == "SkySupply Global (Mumbai Hub)"
    assert c2["is_recommended"] is False
    assert c2["total_landed_cost"] == 14700.0
    assert round(c2["estimated_eta_hours"], 1) == 11.2

    # Candidate 3: GlobalParts (Disqualified: Exceeds 18h deadline)
    c3 = hero["candidates"][2]
    assert c3["vendor_name"] == "GlobalParts Aviation GmbH"
    assert c3["is_flagged"] is True
    assert "DEADLINE_EXCEEDED" in c3["flag_reason"]


def test_simulated_tools_endpoints():
    # 1. get_inventory
    inv = client.get("/api/inventory/HP-2048?location=DEL").json()
    assert inv["available_quantity"] == 0
    assert inv["status"] == "STOCKOUT_AOG_TRIGGERED"

    # 2. search_suppliers
    sups = client.get("/api/suppliers/HP-2048").json()
    assert len(sups) >= 3
    aero = next(s for s in sups if s["supplier_id"] == "VEND-AEROPARTS")
    assert aero["has_8130_3"] is True
    assert aero["has_easa_form_1"] is True

    # 3. verify_part
    ver = client.post("/api/verify-part", json={
        "part_number": "HP-2048",
        "aircraft_model": "Boeing 737-800",
        "supplier_id": "VEND-AEROPARTS"
    }).json()
    assert ver["status"] == "PASS"
    assert ver["compliance_pass"] is True

    # 4. calculate_route
    route = client.post("/api/calculate-route", json={
        "origin": "SIN",
        "destination": "DEL"
    }).json()
    assert round(route["total_eta_hours"], 1) == 8.3
    assert route["freight_cost"] == 3300.0
    assert route["carbon_kg"] == 420.0

    # 5. optimize
    opt = client.post("/api/optimize", json={
        "options": [
            {
                "supplier_name": "AeroParts", "quantity_available": 2, "total_eta_hours": 8.33,
                "total_landed_cost": 18200.0, "reliability_score": 0.96, "compliance_pass": True, "carbon_kg": 420.0
            },
            {
                "supplier_name": "SkySupply", "quantity_available": 3, "total_eta_hours": 11.17,
                "total_landed_cost": 14700.0, "reliability_score": 0.91, "compliance_pass": True, "carbon_kg": 510.0
            }
        ],
        "constraints": {"max_recovery_hours": 18.0, "max_acceptable_cost": 25000.0},
        "weights": {"delivery": 0.40, "reliability": 0.25, "cost": 0.15, "compliance": 0.10, "carbon": 0.10}
    }).json()
    assert len(opt["ranked_plans"]) == 2
    assert opt["recommended_plan"]["supplier_name"] == "AeroParts"


def test_human_approval_creates_reservations_and_shipments():
    payload = {
        "selected_candidate_id": "CAND-HERO-01",
        "decision": "APPROVED",
        "approver_name": "Demo Lead Engineer",
        "approver_license": "SIM-AOG-TECH #482910",
        "notes": "Approved for hot-shot carrier dispatch."
    }
    resp = client.post("/api/cases/CASE-SQK-2048/approve", json=payload)
    assert resp.status_code == 200
    case = resp.json()
    assert "Approved" in case["status"]
    assert len(case["recovery_actions"]) >= 2
    assert len(case["shipments"]) >= 1
    assert case["shipments"][0]["tracking_awb"].startswith("AWB-")


def test_controlled_disruption_genuinely_modifies_state():
    # Trigger stockout disruption
    disr_resp = client.post("/api/cases/CASE-SQK-2048/disrupt", json={
        "case_id": "CASE-SQK-2048",
        "disruption_type": "SUPPLIER_STOCKOUT"
    })
    assert disr_resp.status_code == 200
    disr_data = disr_resp.json()
    assert disr_data["status"] == "DISRUPTED"
    assert "AeroParts" in disr_data["description"]

    # Verify Supplier A's quantity in DB is genuinely 0!
    sups = client.get("/api/suppliers/HP-2048").json()
    aero = next(s for s in sups if s["supplier_id"] == "VEND-AEROPARTS")
    assert aero["quantity_available"] == 0


def test_autonomous_replanning_loop():
    # Replan without hard-coding: agent re-queries tools and chooses SkySupply naturally!
    replan_resp = client.post("/api/cases/CASE-SQK-2048/replan", json={
        "case_id": "CASE-SQK-2048"
    })
    assert replan_resp.status_code == 200
    replan_data = replan_resp.json()
    assert replan_data["status"] == "REPLAN_SUCCESS"
    assert replan_data["replan_count"] >= 1

    selected = replan_data["selected_plan"]
    assert selected["supplier_name"] == "SkySupply Global (Mumbai Hub)"
    assert selected["total_eta_hours"] <= 18.0
    assert selected["quantity_available"] > 0

    # Verify case state updated
    case = client.get("/api/cases/CASE-SQK-2048").json()
    assert case["status"] == "Awaiting Approval"
    assert case["active_plan"]["supplier_name"] == "SkySupply Global (Mumbai Hub)"


def test_final_recovery_verification():
    # Approve replan
    client.post("/api/cases/CASE-SQK-2048/approve", json={
        "decision": "APPROVED",
        "approver_name": "Demo Lead Engineer",
        "approver_license": "SIM-AOG-TECH #482910",
        "notes": "Approved replan with SkySupply."
    })

    # Run final verification tool
    ver_resp = client.post("/api/cases/CASE-SQK-2048/verify", json={
        "case_id": "CASE-SQK-2048"
    })
    assert ver_resp.status_code == 200
    report = ver_resp.json()
    assert report["verification_status"] == "PASS"
    assert report["constraints_passed"] == "7/7"
    assert report["deadline"] == "18h 00m"
    assert report["margin_hours"] > 0
    assert "CERT-AOG-" in report["digital_certificate_id"]


def test_demo_reset():
    resp = client.post("/api/demo/reset")
    assert resp.status_code == 200
    assert resp.json()["status"] == "SUCCESS"

    hero = client.get("/api/cases/CASE-SQK-2048").json()
    assert hero["tail_number"] == "VT-SQK"
    assert hero["active_plan"]["supplier_name"] == "AeroParts Inc. (Singapore)"
