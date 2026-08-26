#!/usr/bin/env python3
"""
SQUAWK Demo State Reset Utility.
Resets the SQLite database and reseeds all initial cases, parts, aircraft, and vendors.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base
from sqlalchemy.orm import Session
from app.models import (
    Aircraft, SquawkCase, Vendor, Part, PartDocument,
    RecoveryCandidate, AgentResult, ValidationResult,
    Approval, RecoveryAction, Outcome, VendorMemory, ActivityLog
)
from app.seed import seed_database

def reset():
    print("[RESET] Rebuilding database tables...")
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        db.query(ActivityLog).delete()
        db.query(RecoveryAction).delete()
        db.query(Approval).delete()
        db.query(Outcome).delete()
        db.query(RecoveryCandidate).delete()
        db.query(ValidationResult).delete()
        db.query(AgentResult).delete()
        db.query(SquawkCase).delete()
        db.query(PartDocument).delete()
        db.query(Part).delete()
        db.query(VendorMemory).delete()
        db.query(Vendor).delete()
        db.query(Aircraft).delete()
        db.commit()

        print("[RESET] Seeding initial demo state...")
        seed_database(db)
        print("[RESET] SQUAWK Demo database successfully reset!")

if __name__ == "__main__":
    reset()
