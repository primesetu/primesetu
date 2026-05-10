"""
tally_relay.py — SMRITI-OS Store-Side Tally Relay

A minimal FastAPI app that runs at the store node.
Accepts authenticated POST requests from the cloud Celery worker
and forwards them to the local Tally Gateway (localhost:9000).

Architecture:
  Cloud Celery → HTTPS → Store Relay (this app) → localhost:9000 → TallyPrime

Why this exists:
  Tally Gateway only accepts connections from localhost by default.
  In multi-store mode the cloud cannot reach a store's Tally directly.
  This relay bridges the gap without modifying Tally's security settings.

Deployment:
  Run as a Windows service or Task Scheduler job at the store PC:
    uvicorn app.services.tally_relay:relay_app --host 0.0.0.0 --port 8765

Security:
  - RELAY_SECRET env var must match on cloud and store side.
  - Use HTTPS (e.g., via Tailscale or ngrok) in production.
"""

import os
import httpx
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import PlainTextResponse

TALLY_LOCAL_URL = os.environ.get("TALLY_LOCAL_URL", "http://localhost:9000")
RELAY_SECRET    = os.environ.get("RELAY_SECRET", "smriti-tally-relay-secret")

relay_app = FastAPI(title="SMRITI-OS Tally Store Relay", docs_url=None, redoc_url=None)


@relay_app.get("/health")
async def relay_health():
    """Cloud worker pings this to confirm relay is alive before pushing."""
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            resp = await client.get(TALLY_LOCAL_URL)
            tally_alive = resp.status_code < 500
    except Exception:
        tally_alive = False

    return {
        "relay": "online",
        "tally_gateway": "reachable" if tally_alive else "unreachable",
        "tally_url": TALLY_LOCAL_URL,
    }


@relay_app.post("/push", response_class=PlainTextResponse)
async def relay_push(
    request: Request,
    x_relay_secret: str = Header(None, alias="X-Relay-Secret"),
):
    """
    Receive XML from cloud Celery worker and forward to local Tally Gateway.
    Returns Tally's raw XML response directly (no transformation).
    """
    if x_relay_secret != RELAY_SECRET:
        raise HTTPException(status_code=401, detail="Invalid relay secret.")

    xml_body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            tally_resp = await client.post(
                TALLY_LOCAL_URL,
                content=xml_body,
                headers={"Content-Type": "text/xml;charset=UTF-16"},
            )
            return PlainTextResponse(content=tally_resp.text, status_code=tally_resp.status_code)

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Tally Gateway unreachable at store. Ensure TallyPrime is running."
        )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Tally Gateway timeout at store.")
