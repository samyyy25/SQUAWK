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
    assert data["rocketride_connected"] is True

def test_list_cases_and_hero_case():
    response = client.get("/api/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 15

    hero = next((c for c in cases if c["tail_number"] == "N42Q"), None)
    assert hero is not None
    assert hero["ata_chapter"] == "29 - Hydraulic Power"
    assert hero["part_number"] == "HYD-PUMP-2901"
    assert len(hero["candidates"]) > 0

    # Verify Validator logic on Hero Case: AeroParts Inc is #1 recommended, Global Aviation Supply is flagged
    recommended = next((c for c in hero["candidates"] if c["is_recommended"]), None)
    assert recommended is not None
    assert recommended["vendor_name"] == "AeroParts Inc."
    assert recommended["is_flagged"] is False

    flagged_cheapest = next((c for c in hero["candidates"] if c["vendor_name"] == "Global Aviation Supply"), None)
    assert flagged_cheapest is not None
    assert flagged_cheapest["is_flagged"] is True
    assert "8130-3" in flagged_cheapest["flag_reason"]

def test_human_approval_creates_actions():
    hero_case_id = "CASE-N42Q-01"
    approval_payload = {
        "selected_candidate_id": "CAND-N42Q-01",
        "decision": "APPROVED",
        "approver_name": "Capt. Marcus Vance",
        "approver_license": "FAA A&P #482910",
        "notes": "Approved for immediate hot-shot delivery."
    }
    response = client.post(f"/api/cases/{hero_case_id}/approve", json=approval_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Approved"
    assert len(data["recovery_actions"]) >= 4

def test_verified_outcome_feedback_loop():
    payload = {
        "vendor_id": "VEND-AERO-01",
        "predicted_eta_hours": 4.0,
        "actual_delivery_hours": 3.9,
        "predicted_cost": 21100.0,
        "actual_cost": 21100.0,
        "documentation_accepted": True,
        "recovery_successful": True,
        "vendor_performance_rating": 5,
        "operator_notes": "Flawless delivery, 8130-3 tag verified on arrival."
    }
    response = client.post("/api/cases/CASE-N42Q-01/outcome", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "SUCCESS"

    # Check vendor memory stats endpoint
    mem_resp = client.get("/api/memory")
    assert mem_resp.status_code == 200
    mem_data = mem_resp.json()
    aero = next((v for v in mem_data["vendor_stats"] if v["vendor_name"] == "AeroParts Inc."), None)
    assert aero is not None
    assert aero["orders"] >= 15

def test_batch_processing():
    response = client.post("/api/batch/process")
    assert response.status_code == 200
    batch = response.json()
    assert batch["total_cases_received"] >= 15
    assert batch["successfully_processed"] >= 10
    assert batch["escalated_to_humans"] >= 3
    assert batch["total_ai_agent_calls"] >= 40
    assert batch["approximate_cost_usd"] > 0
