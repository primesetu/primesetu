# ============================================================
# PrimeSetu — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# System Architect   :  Jawahar R. M. | © 2026
# "Memory, Not Code."
# ============================================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PrimeSetu API",
    description="Shoper9-Based Retail OS — Phase 2 FastAPI Backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://primesetu.pages.dev", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "PrimeSetu API", "phase": 2}

# Phase 2: routers will be added here
# from app.routers import billing, inventory, schemes, accounting, ai
# app.include_router(billing.router,    prefix="/api/v1/billing",    tags=["Billing"])
# app.include_router(inventory.router,  prefix="/api/v1/inventory",  tags=["Inventory"])
