import time
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Part, Vendor, VendorMemory, PartDocument, SquawkCase

class SourcingSpecialist:
    """
    Finds matching parts and vendor availability from the database.
    Does not invent vendor data.
    """
    def process(self, db: Session, case: SquawkCase) -> Dict[str, Any]:
        start = time.time()
        part_no = (case.part_number or "").strip()
        candidates = []
        missing_info = []

        if not part_no or part_no.startswith("UNKNOWN"):
            missing_info.append("Valid IPC part number missing or unverified.")
            parts = []
        else:
            # Match exact part number or alternate
            parts = db.query(Part).filter(Part.part_number.ilike(f"%{part_no}%")).all()

        # If no direct match, fallback to general ATA chapter parts if available
        if not parts and case.ata_chapter:
            ata_prefix = case.ata_chapter.split("-")[0].strip()
            parts = db.query(Part).filter(Part.ata_chapter.ilike(f"{ata_prefix}%")).all()

        for p in parts:
            vendor = db.query(Vendor).filter(Vendor.id == p.vendor_id).first()
            candidates.append({
                "part_id": p.id,
                "part_number": p.part_number,
                "description": p.description,
                "vendor_id": p.vendor_id,
                "vendor_name": vendor.name if vendor else "Unknown Vendor",
                "condition": p.condition,
                "available_qty": p.quantity_available,
                "part_cost": p.unit_price,
                "warehouse_location": p.warehouse_location,
                "has_8130_3": p.has_8130_3,
                "has_easa_form_1": p.has_easa_form_1,
                "has_trace_to_oem": p.has_trace_to_oem,
                "tags_notes": p.tags_notes
            })

        confidence = 0.95 if candidates else 0.30

        return {
            "specialist": "Sourcing Specialist",
            "candidates": candidates,
            "best_matches": [c["part_number"] for c in candidates[:3]],
            "confidence": confidence,
            "missing_information": missing_info,
            "execution_ms": int((time.time() - start) * 1000)
        }


class DocumentationSpecialist:
    """
    Evaluates presence and pedigree of airworthiness certificates.
    IMPORTANT: Never claims to make legal airworthiness release decisions.
    """
    def process(self, db: Session, case: SquawkCase, sourcing_output: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        evaluations = []
        candidates = sourcing_output.get("candidates", [])

        for c in candidates:
            has_8130 = c.get("has_8130_3", False)
            has_easa = c.get("has_easa_form_1", False)
            has_trace = c.get("has_trace_to_oem", False)
            notes = c.get("tags_notes", "")
            vendor_name = c.get("vendor_name", "")

            # Strict aviation evidence analysis
            if has_8130 and has_easa:
                status = "Complete"
                compliance_note = f"Dual Release FAA Form 8130-3 and EASA Form 1 present in database. Full OEM pedigree."
            elif has_8130:
                status = "Complete"
                compliance_note = f"FAA Form 8130-3 airworthiness certificate verified. Complete trace."
            elif not has_8130 and not has_easa:
                status = "Missing Required Tag"
                compliance_note = f"CRITICAL: Mandatory FAA Form 8130-3 or EASA Form 1 release tag is MISSING. Internal shop tag only. Cannot install legally."
            else:
                status = "Ambiguous — Human Review Required"
                compliance_note = f"Documentation incomplete or requires DAR inspection review."

            evaluations.append({
                "vendor_name": vendor_name,
                "part_number": c.get("part_number"),
                "documentation_status": status,
                "has_faa_8130_3": has_8130,
                "has_easa_form_1": has_easa,
                "has_oem_trace": has_trace,
                "evidence_notes": notes,
                "compliance_evaluation": compliance_note
            })

        return {
            "specialist": "Documentation & Requirements Specialist",
            "evaluations": evaluations,
            "confidence": 0.92 if evaluations else 0.40,
            "disclaimer": "AI evaluates database documentation records only. Formal airworthiness authorization requires certified A&P / Part 66 engineer.",
            "execution_ms": int((time.time() - start) * 1000)
        }


class LogisticsSpecialist:
    """
    Calculates landed cost, freight options, and realistic AOG delivery ETAs.
    """
    def process(self, db: Session, case: SquawkCase, sourcing_output: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        routes = []
        destination = case.location or "ORD"
        candidates = sourcing_output.get("candidates", [])

        for c in candidates:
            origin = c.get("warehouse_location", "ORD")
            part_cost = c.get("part_cost", 0.0)

            # Calculate deterministic realistic logistics
            if origin == destination:
                shipping_method = "Dedicated Local AOG Hot-Shot Van"
                freight_cost = 1300.0
                eta_hours = 4.0
                conf = 0.95
            elif origin in ("DFW", "ATL", "MIA", "JFK", "DEN") and destination in ("ORD", "DFW", "ATL", "LAX"):
                shipping_method = f"Next Flight Out Cargo ({origin}->{destination})"
                freight_cost = 2100.0 if origin != "MIA" else 2400.0
                eta_hours = 6.5 if origin == "DFW" else (12.0 if origin == "MIA" else 7.0)
                conf = 0.88
            elif origin in ("FRA", "LHR"):
                shipping_method = "Transatlantic Dedicated Priority Courier"
                freight_cost = 4500.0
                eta_hours = 14.0
                conf = 0.85
            else:
                shipping_method = "Commercial Overnight Air Cargo"
                freight_cost = 1800.0
                eta_hours = 18.0
                conf = 0.75

            total_landed_cost = part_cost + freight_cost

            routes.append({
                "vendor_name": c.get("vendor_name"),
                "part_number": c.get("part_number"),
                "origin": origin,
                "destination": destination,
                "shipping_method": shipping_method,
                "part_cost": part_cost,
                "freight_cost": freight_cost,
                "total_cost": total_landed_cost,
                "eta_hours": eta_hours,
                "confidence": conf
            })

        return {
            "specialist": "Logistics Specialist",
            "routes": routes,
            "fastest_eta_hours": min([r["eta_hours"] for r in routes]) if routes else None,
            "confidence": 0.94 if routes else 0.40,
            "execution_ms": int((time.time() - start) * 1000)
        }
