"""
whatsapp.py — SMRITI-OS WhatsApp Notifications API Router

Endpoints:
  POST /whatsapp/send/receipt        — Manual bill receipt (test/retry)
  POST /whatsapp/send/day-end        — Day-End summary to manager
  POST /whatsapp/send/low-stock      — Low stock alert to store manager
  GET  /whatsapp/config              — Fetch current WA gateway config
  POST /whatsapp/config              — Update WA gateway config (BSP/keys)
  GET  /whatsapp/status              — Connectivity test with current provider
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import CurrentUser, require_auth
from app.services.whatsapp_gateway import WhatsAppGateway, WAProvider, get_gateway

router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp Notifications"])


def _build_gateway(store_id: str, db_cfg: dict) -> WhatsAppGateway:
    """Instantiate gateway from SmritiParam config."""
    return get_gateway(
        provider=db_cfg.get("provider", "mock"),
        api_key=db_cfg.get("api_key", ""),
        from_number=db_cfg.get("from_number", ""),
    )


async def _fetch_wa_config(store_id: str, db: AsyncSession) -> dict:
    """Fetch WA config from SmritiParam table."""
    from app.models.sovereign import SmritiParam
    result = await db.execute(
        select(SmritiParam).where(
            SmritiParam.param_code == f"WA_CONFIG_{store_id}",
        )
    )
    row = result.scalar_one_or_none()
    if row and row.value_txt:
        import json
        try:
            return json.loads(row.value_txt)
        except Exception:
            pass
    return {"provider": "mock"}


@router.get("/config")
async def get_wa_config(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Fetch current WhatsApp gateway configuration (keys masked)."""
    cfg = await _fetch_wa_config(current_user.store_id, db)
    return {
        "provider": cfg.get("provider", "mock"),
        "from_number": cfg.get("from_number", ""),
        "api_key_set": bool(cfg.get("api_key")),
        "template_lang": cfg.get("template_lang", "en"),
    }


@router.post("/config")
async def update_wa_config(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Save WhatsApp gateway configuration.
    Payload: { provider, api_key, from_number, template_lang }
    """
    import json
    from app.models.sovereign import SmritiParam

    allowed_providers = [p.value for p in WAProvider]
    provider = payload.get("provider", "mock")
    if provider not in allowed_providers:
        raise HTTPException(status_code=400, detail=f"Provider must be one of: {allowed_providers}")

    cfg = {
        "provider": provider,
        "api_key": payload.get("api_key", ""),
        "from_number": payload.get("from_number", ""),
        "template_lang": payload.get("template_lang", "en"),
    }
    param_code = f"WA_CONFIG_{current_user.store_id}"

    result = await db.execute(
        select(SmritiParam).where(SmritiParam.param_code == param_code)
    )
    row = result.scalar_one_or_none()
    if row:
        row.value_txt = json.dumps(cfg)
    else:
        db.add(SmritiParam(
            param_code=param_code,
            descr=f"WhatsApp Gateway Config for {current_user.store_id}",
            value_txt=json.dumps(cfg),
            category="INTEGRATION",
        ))
    await db.commit()
    return {"status": "saved", "provider": provider}


@router.get("/status")
async def gateway_status(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Quick connectivity check — sends a mock probe."""
    cfg = await _fetch_wa_config(current_user.store_id, db)
    gw = _build_gateway(current_user.store_id, cfg)
    result = await gw._mock_send(
        "919999999999",
        "connectivity_test",
        ["SMRITI-OS", "system-probe"],
    )
    return {
        "provider": cfg.get("provider", "mock"),
        "reachable": True,
        "from_number": cfg.get("from_number"),
        "probe": result,
    }


@router.post("/send/receipt")
async def send_bill_receipt(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Manually send/retry a bill receipt.
    Payload: { mobile, bill_no, store_name, total_rs, points_earned, points_balance }
    """
    cfg = await _fetch_wa_config(current_user.store_id, db)
    gw = _build_gateway(current_user.store_id, cfg)

    result = await gw.send_bill_receipt(
        mobile=payload.get("mobile", ""),
        bill_no=payload.get("bill_no", ""),
        store_name=payload.get("store_name", "Store"),
        total_rs=float(payload.get("total_rs", 0)),
        points_earned=int(payload.get("points_earned", 0)),
        points_balance=int(payload.get("points_balance", 0)),
    )
    return result


@router.post("/send/day-end")
async def send_day_end_summary(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Send Day-End summary to manager/HO mobile.
    Payload: { mobile, store_name, z_number, bill_count, total_revenue, cash_variance }
    """
    cfg = await _fetch_wa_config(current_user.store_id, db)
    gw = _build_gateway(current_user.store_id, cfg)

    result = await gw.send_day_end_summary(
        mobile=payload.get("mobile", ""),
        store_name=payload.get("store_name", "Store"),
        z_number=payload.get("z_number", "Z-000"),
        bill_count=int(payload.get("bill_count", 0)),
        total_revenue=float(payload.get("total_revenue", 0)),
        cash_variance=float(payload.get("cash_variance", 0)),
    )
    return result


@router.post("/send/low-stock")
async def send_low_stock_alert(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Send low-stock alert.
    Payload: { mobile, store_name, item_name, current_qty, reorder_level }
    """
    cfg = await _fetch_wa_config(current_user.store_id, db)
    gw = _build_gateway(current_user.store_id, cfg)

    result = await gw.send_low_stock_alert(
        mobile=payload.get("mobile", ""),
        store_name=payload.get("store_name", "Store"),
        item_name=payload.get("item_name", "Item"),
        current_qty=int(payload.get("current_qty", 0)),
        reorder_level=int(payload.get("reorder_level", 0)),
    )
    return result
