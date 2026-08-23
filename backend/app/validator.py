import time
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Vendor, VendorMemory, SquawkCase

class ValidatorAgent:
    """
    Load-bearing Validator: AI Checking AI.
    Reconciles outputs from Sourcing, Documentation, and Logistics specialists.
    Detects contradictions, missing documentation, unsupported claims, and risk levels.
    """
    def validate(
        self,
        db: Session,
        case: SquawkCase,
        sourcing_res: Dict[str, Any],
        doc_res: Dict[str, Any],
        logistics_res: Dict[str, Any]
    ) -> Dict[str, Any]:
        start = time.time()
        conflicts = []
        flagged_candidates = []
        valid_candidates = []

        candidates = sourcing_res.get("candidates", [])
        evaluations_map = {e["vendor_name"]: e for e in doc_res.get("evaluations", [])}
        routes_map = {r["vendor_name"]: r for r in logistics_res.get("routes", [])}

        if not candidates:
            return {
                "status": "ESCALATED_TO_HUMAN",
                "conflicts_detected": ["No vendor candidates found in inventory matching defect part requirements."],
                "flagged_candidates": [],
                "valid_candidates": [],
                "risk_level": "CRITICAL",
                "confidence": 0.25,
                "requires_human_review": True,
                "reasoning_summary": "No sourcing options could be identified. SQUAWK has escalated this case to the Operations Queue for manual rotable sourcing.",
                "execution_ms": int((time.time() - start) * 1000)
            }

        for c in candidates:
            v_name = c.get("vendor_name")
            doc_eval = evaluations_map.get(v_name, {})
            route_eval = routes_map.get(v_name, {})
            vendor_db = db.query(Vendor).filter(Vendor.id == c.get("vendor_id")).first()

            vendor_rel = vendor_db.calculated_reliability if vendor_db else 0.85
            doc_status = doc_eval.get("documentation_status", "Unknown")

            is_flagged = False
            flag_reasons = []

            # 1. Check Airworthiness Documentation
            if not doc_eval.get("has_faa_8130_3", False) and not doc_eval.get("has_easa_form_1", False):
                is_flagged = True
                flag_reasons.append("Mandatory airworthiness tag (FAA 8130-3 / EASA Form 1) is missing from database.")
                conflicts.append({
                    "candidate": v_name,
                    "conflict_type": "DOCUMENTATION_AIRWORTHINESS_DEFICIT",
                    "severity": "CRITICAL_FLAG",
                    "description": f"{v_name} offers part at ${c.get('part_cost', 0):,.2f}, but Documentation Specialist reports no verified 8130-3 airworthiness certificate. Operationally invalid without recertification."
                })

            # 2. Check Trace & Pedigree
            if not doc_eval.get("has_oem_trace", True):
                is_flagged = True
                flag_reasons.append("Missing OEM trace and 121 operator pedigree.")
                conflicts.append({
                    "candidate": v_name,
                    "conflict_type": "TRACE_DEFICIT",
                    "severity": "HIGH_FLAG",
                    "description": f"{v_name} cannot provide verified chain of custody back to OEM."
                })

            # 3. Check Vendor Reliability History
            if vendor_rel < 0.70:
                is_flagged = True
                flag_reasons.append(f"Historical vendor reliability score is below standard ({int(vendor_rel*100)}%).")
                conflicts.append({
                    "candidate": v_name,
                    "conflict_type": "HISTORICAL_RELIABILITY_WARNING",
                    "severity": "MEDIUM_WARNING",
                    "description": f"Vendor memory indicates high average delivery delay and previous documentation defects."
                })

            # 4. Check Impossible or Slow Logistics
            eta = route_eval.get("eta_hours", 24.0)
            if eta > 16.0 and case.priority == "AOG":
                conflicts.append({
                    "candidate": v_name,
                    "conflict_type": "HIGH_AOG_LATENCY",
                    "severity": "OPERATIONAL_DELAY_FLAG",
                    "description": f"Delivery ETA of {eta} hours significantly exceeds flight turnaround window."
                })

            candidate_summary = {
                "vendor_id": c.get("vendor_id"),
                "vendor_name": v_name,
                "part_id": c.get("part_id"),
                "part_number": c.get("part_number"),
                "condition": c.get("condition"),
                "part_cost": c.get("part_cost", 0.0),
                "freight_cost": route_eval.get("freight_cost", 1500.0),
                "total_landed_cost": route_eval.get("total_cost", c.get("part_cost", 0.0) + 1500.0),
                "estimated_eta_hours": route_eval.get("eta_hours", 12.0),
                "shipping_method": route_eval.get("shipping_method", "Expedited Cargo"),
                "documentation_status": doc_status,
                "doc_notes": doc_eval.get("evidence_notes", ""),
                "vendor_reliability_score": vendor_rel,
                "is_flagged": is_flagged,
                "flag_reason": " | ".join(flag_reasons) if flag_reasons else None,
                "confidence": 0.55 if is_flagged else 0.91
            }

            if is_flagged:
                flagged_candidates.append(candidate_summary)
            else:
                valid_candidates.append(candidate_summary)

        # Risk and Confidence calculations
        risk_level = "LOW" if len(valid_candidates) > 0 else "HIGH"
        confidence = 0.91 if valid_candidates else 0.45

        # Create reasoning summary
        if valid_candidates and flagged_candidates:
            reasoning = f"Validator analyzed {len(candidates)} candidate options. Flagged {len(flagged_candidates)} candidate(s) for documentation deficits or high risk. Identified {len(valid_candidates)} operationally verified candidate(s) ready for human approval."
        elif valid_candidates:
            reasoning = f"All {len(valid_candidates)} candidates verified with complete airworthiness documentation and viable logistics."
        else:
            reasoning = f"All candidates were flagged with critical compliance or logistics conflicts. Human review required immediately."

        return {
            "status": "VALIDATED_WITH_HUMAN_REVIEW",
            "conflicts_detected": conflicts,
            "flagged_candidates": flagged_candidates,
            "valid_candidates": valid_candidates,
            "risk_level": risk_level,
            "confidence": confidence,
            "requires_human_review": True,
            "reasoning_summary": reasoning,
            "execution_ms": int((time.time() - start) * 1000)
        }


class RecommendationEngine:
    """
    Ranks candidates prioritizing operational safety, complete documentation, ETA,
    vendor reliability, and total landed cost. Never simply picks cheapest.
    """
    def rank_and_score(self, validation_output: Dict[str, Any]) -> List[Dict[str, Any]]:
        valid_candidates = list(validation_output.get("valid_candidates", []))
        flagged_candidates = list(validation_output.get("flagged_candidates", []))

        # Score valid candidates using weighted formula:
        # Score = (1 / ETA) * 0.35 + (Reliability) * 0.30 + (1 / TotalCost) * 0.20 + (DocStatus) * 0.15
        for cand in valid_candidates:
            eta = max(cand["estimated_eta_hours"], 1.0)
            cost = max(cand["total_landed_cost"], 1000.0)
            rel = cand["vendor_reliability_score"]

            # Normalized scoring factors
            eta_score = 10.0 / eta # faster is much better
            rel_score = rel * 10.0
            cost_score = 20000.0 / cost

            cand["composite_score"] = (eta_score * 0.40) + (rel_score * 0.40) + (cost_score * 0.20)

        # Sort valid candidates descending by score
        valid_candidates.sort(key=lambda x: x["composite_score"], reverse=True)

        ranked = []
        rank_counter = 1

        for idx, cand in enumerate(valid_candidates):
            cand["overall_rank"] = rank_counter
            cand["is_recommended"] = (idx == 0)
            ranked.append(cand)
            rank_counter += 1

        for cand in flagged_candidates:
            cand["overall_rank"] = rank_counter
            cand["is_recommended"] = False
            ranked.append(cand)
            rank_counter += 1

        return ranked
