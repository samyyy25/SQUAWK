#!/usr/bin/env python3
"""
SQUAWK Demo State Reset Utility.
Resets the SQLite database tables and reseeds the VT-SQK Delhi hero scenario.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base
from sqlalchemy.orm import Session
from app.seed import seed_database

def reset():
    print("[RESET] Rebuilding database tables from scratch...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        print("[RESET] Seeding initial demo state...")
        seed_database(db)
        print("[RESET] SQUAWK Demo database successfully reset!")

if __name__ == "__main__":
    reset()
