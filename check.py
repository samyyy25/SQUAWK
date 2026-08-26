import os
import sys
import json
import glob

def check_env():
    print("[1/4] Checking Environment Variables...")
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_file):
        print("  WARNING: .env file missing!")
        return False
    
    with open(env_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    env_vars = {}
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env_vars[k.strip()] = v.strip()
            
    rr_uri = env_vars.get("ROCKETRIDE_URI")
    rr_key = env_vars.get("ROCKETRIDE_APIKEY")
    print(f"  ROCKETRIDE_URI: {rr_uri}")
    print(f"  ROCKETRIDE_APIKEY: {'Set (' + rr_key[:8] + '...)' if rr_key else 'Missing'}")
    return True

def check_pipelines():
    print("\n[2/4] Checking RocketRide Pipeline Files (.pipe)...")
    pipe_files = glob.glob(os.path.join(os.path.dirname(__file__), "pipelines", "*.pipe"))
    if not pipe_files:
        print("  ERROR: No .pipe files found in pipelines/")
        return False
        
    all_valid = True
    for pf in pipe_files:
        rel_path = os.path.relpath(pf)
        try:
            with open(pf, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Check rules: components must be present, project_id present
            components = data.get("components")
            project_id = data.get("project_id")
            
            if not components or not isinstance(components, list):
                print(f"  FAILED: {rel_path} - missing 'components' array")
                all_valid = False
            elif not project_id:
                print(f"  FAILED: {rel_path} - missing 'project_id' GUID")
                all_valid = False
            else:
                print(f"  PASSED: {rel_path} ({len(components)} components, project_id: {project_id})")
        except Exception as e:
            print(f"  FAILED: {rel_path} - JSON parse error: {e}")
            all_valid = False
            
    return all_valid

def check_sdk():
    print("\n[3/4] Checking RocketRide SDK Installation...")
    try:
        import rocketride
        print(f"  RocketRide SDK imported successfully (module: {rocketride.__file__ if hasattr(rocketride, '__file__') else 'built-in'})")
        return True
    except ImportError:
        print("  NOTICE: 'rocketride' PyPI package not installed in current environment. Local fallback engine active.")
        return True

def test_runner():
    print("\n[4/4] Testing Pipeline Runner Execution...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
    try:
        from app.pipeline_runner import pipeline_runner
        res = pipeline_runner.run_pipeline("ingest_squawk", {"test": "payload"})
        telemetry = res.get("telemetry", {})
        print(f"  Execution ID: {telemetry.get('execution_id')}")
        print(f"  Status: {telemetry.get('status')}")
        print(f"  Engine: {telemetry.get('engine')}")
        print(f"  Duration: {telemetry.get('duration_ms')}ms")
        print(f"  Total Tokens: {telemetry.get('total_tokens')}")
        print(f"  Cost: ${telemetry.get('cost_usd')}")
        return True
    except Exception as e:
        print(f"  ERROR testing pipeline runner: {e}")
        return False

if __name__ == "__main__":
    print("==============================================")
    print("    SQUAWK RocketRide Environment Checker     ")
    print("==============================================")
    e_ok = check_env()
    p_ok = check_pipelines()
    s_ok = check_sdk()
    r_ok = test_runner()
    
    print("\n==============================================")
    if e_ok and p_ok and s_ok and r_ok:
        print(" SUCCESS: All RocketRide checks passed!")
    else:
        print(" WARNING: Some checks failed or require attention.")
    print("==============================================")
