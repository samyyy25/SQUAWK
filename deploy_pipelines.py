#!/usr/bin/env python3
"""
SQUAWK — RocketRide Pipeline Deployment Script
Deploys and registers all SQUAWK .pipe pipelines to the configured RocketRide deployment target.
"""

import os
import sys
import json
import glob
import asyncio
from dotenv import load_dotenv

# Load environment configuration
load_dotenv()

deploy_uri = os.getenv("ROCKETRIDE_DEPLOY_URI")
deploy_key = os.getenv("ROCKETRIDE_DEPLOY_APIKEY")

if not deploy_uri or not deploy_key:
    print("❌ ERROR: ROCKETRIDE_DEPLOY_URI or ROCKETRIDE_DEPLOY_APIKEY is missing in .env")
    sys.exit(1)

try:
    from rocketride import RocketRideClient
except ImportError:
    print("❌ ERROR: 'rocketride' Python package is not installed. Run: pip install rocketride")
    sys.exit(1)

PIPELINE_FILES = [
    ("ingest_squawk", "pipelines/ingest_squawk.pipe"),
    ("source_recovery", "pipelines/source_recovery.pipe"),
    ("source_and_certify", "pipelines/source_and_certify.pipe"),
    ("outcome_tracker", "pipelines/outcome_tracker.pipe"),
]

async def deploy():
    print("=" * 60)
    print("SQUAWK - Deploying Pipelines to RocketRide Platform")
    print(f"Target URI: {deploy_uri}")
    print("=" * 60)

    async with RocketRideClient(deploy_uri, deploy_key) as client:
        # Check server connection info
        try:
            srv = await client.get_server_info()
            print(f"[CONNECTED] RocketRide Server: {srv.get('version', 'v1.x') if isinstance(srv, dict) else srv}")
        except Exception as e:
            print(f"[CONNECTED] (info response: {e})")

        deployed_count = 0
        for pipe_id, file_path in PIPELINE_FILES:
            full_path = os.path.join(os.path.dirname(__file__), file_path)
            if not os.path.exists(full_path):
                print(f"[ERROR] File not found: {file_path}")
                continue

            with open(full_path, "r", encoding="utf-8") as f:
                pipe_def = json.load(f)

            template_name = f"squawk_{pipe_id}"
            print(f"\n[DEPLOYING] '{pipe_id}' ({template_name})...")
            
            # 1. Structural validation
            try:
                val = await client.validate(pipeline=pipe_def)
                print(f"  [VALIDATED] Server verified (components: {len(pipe_def.get('components', []))})")
            except Exception as e:
                print(f"  [ERROR] Validation warning/error: {e}")

            # 2. Template persistence on server
            try:
                await client.save_template(template_id=template_name, pipeline=pipe_def)
                print(f"  [SAVED] Active in platform template registry: '{template_name}'")
                deployed_count += 1
            except Exception as e:
                print(f"  [ERROR] Failed to save template: {e}")

        # List all templates to verify
        print("\n" + "=" * 60)
        try:
            templates = await client.get_all_templates()
            registered = [t.get('id') if isinstance(t, dict) else str(t) for t in templates.get('templates', [])]
            squawk_active = [r for r in registered if 'squawk' in str(r).lower()]
            print(f"[REGISTRY] Active SQUAWK Platform Pipelines: {len(squawk_active)} of {len(PIPELINE_FILES)}")
            for name in squawk_active:
                print(f"   * {name}")
        except Exception as e:
            print(f"[WARNING] Could not list templates: {e}")

        print("=" * 60)
        if deployed_count == len(PIPELINE_FILES):
            print("SUCCESS: ALL SQUAWK PIPELINES SUCCESSFULLY DEPLOYED TO ROCKETRIDE!")
        else:
            print(f"PARTIAL: {deployed_count}/{len(PIPELINE_FILES)} pipelines deployed.")


if __name__ == "__main__":
    asyncio.run(deploy())
