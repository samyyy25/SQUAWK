# SQUAWK — Production Deployment Guide

This guide covers deployment for the **SQUAWK Autonomous AOG Supply Chain Recovery Platform**, encompassing both the **RocketRide AI Pipelines** and the **Full-Stack Web Console (FastAPI + React/Vite)**.

---

## Architecture Overview

```
                      +------------------------------------------+
                      |       RocketRide Cloud Platform          |
                      |  (URI: https://staging.rocketride.ai)   |
                      |  - squawk_ingest_squawk (6 nodes)        |
                      |  - squawk_source_recovery (5 nodes)      |
                      |  - squawk_source_and_certify (5 nodes)   |
                      |  - squawk_outcome_tracker (6 nodes)      |
                      +--------------------+---------------------+
                                           ^
                                           | DAP / WebSockets
                                           v
+-----------------------------------------------------------------------------------+
|                        SQUAWK Operations Platform                                 |
|                                                                                   |
|   +-------------------------------------+   +---------------------------------+   |
|   |         FastAPI Backend             |   |        React / Vite UI          |   |
|   |  - Multi-Agent Orchestrator         |   |  - AOG Incident Queue           |   |
|   |  - ATA Defect Intelligence Engine   |   |  - AI Decision Support          |   |
|   |  - Certified Human Approvals        |   |  - Interactive Recovery Map     |   |
|   |  - Serves static assets on /        |   |  - Audit Trace & Safety Model   |   |
|   +-------------------------------------+   +---------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 1. RocketRide AI Pipelines Deployment (Completed)

All 4 mission-critical AI pipelines are validated and registered directly on the RocketRide Platform:

| Pipeline | Platform ID | Components | Trigger / Mode |
|---|---|---|---|
| Ingest & Classify Squawk | `squawk_ingest_squawk` | 6 nodes | Webhook / Automated ACARS & TechLog intake |
| Parallel Sourcing Agent | `squawk_source_recovery` | 5 nodes | Multi-agent wave: Inventory, Docs, Logistics |
| Source & Certify Agent | `squawk_source_and_certify` | 5 nodes | Dual airworthiness regulatory certification audit |
| Closed-Loop Outcome Tracker | `squawk_outcome_tracker` | 6 nodes | Webhook / Variance calculation & vendor memory update |

### Re-deploying Pipelines
To re-validate and update all pipelines on the deployment server at any time:
```powershell
python deploy_pipelines.py
```

---

## 2. One-Click Cloud Deployment: Render

A `render.yaml` Blueprint is included in the root directory.

### Steps:
1. Push your repository to GitHub (`https://github.com/samyyy25/SQUAWK`).
2. Log into [Render.com](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Connect the `samyyy25/SQUAWK` repository.
5. Render will automatically detect `render.yaml`, build the frontend bundle, install the backend dependencies, and launch the web service.
6. Under **Environment Variables**, optionally set:
   - `ROCKETRIDE_DEPLOY_URI`
   - `ROCKETRIDE_DEPLOY_APIKEY`
   - `LLM_API_KEY` (if using external OpenAI/Anthropic models)
7. Click **Apply**. Your app will be live at `https://squawk-aog-recovery.onrender.com`.

---

## 3. One-Click Cloud Deployment: Railway

A `railway.json` and `Dockerfile` are configured in the repository.

### Steps:
1. Log into [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `samyyy25/SQUAWK`.
4. Railway will automatically build the multi-stage `Dockerfile`.
5. Under **Variables**, add:
   ```env
   PORT=8000
   ENVIRONMENT=production
   DEMO_MODE=true
   ```
6. Under **Settings** -> **Networking**, click **Generate Domain**.
7. Your app is live!

---

## 4. Container Deployment: Docker & Docker Compose

A production-ready multi-stage `Dockerfile` and `docker-compose.yml` are provided.

### Run with Docker Compose:
```bash
docker compose up -d --build
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Build and Run with Docker directly:
```bash
docker build -t squawk-platform:latest .
docker run -d -p 8000:8000 --name squawk squawk-platform:latest
```

---

## 5. Local Single-Port Production Mode

You can also run the unified production build locally without Docker:

```powershell
# 1. Build the React frontend
cd frontend
npm install
npm run build
cd ..

# 2. Run the FastAPI backend (serves both API on /api and React UI on /)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```
Open [http://localhost:8000](http://localhost:8000).
