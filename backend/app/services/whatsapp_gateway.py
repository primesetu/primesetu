"""
whatsapp_gateway.py — SMRITI-OS WhatsApp Business API Gateway

Supports multiple BSP providers via a unified interface:
  - Gupshup (Indian BSP — dominant in Tier 2 retail)
  - Interakt (Shopify-style Indian mid-market)
  - Meta Cloud API (direct, for future HO deployments)

Configuration is fetched from SmritiParam:
  WA_PROVIDER        → "gupshup" | "interakt" | "meta"
  WA_API_KEY         → BSP API key
  WA_FROM_NUMBER     → registered sender number (E.164)
  WA_TEMPLATE_LANG   → "en" | "hi" (default: "en")

All sends are fire-and-forget async — billing never blocks on WA failures.
"""

from __future__ import annotations
import httpx
import logging
import os
from typing import Any, Optional
from enum import Enum

logger = logging.getLogger("SMRITI-OS.whatsapp")


class WAProvider(str, Enum):
    GUPSHUP = "gupshup"
    INTERAKT = "interakt"
    META = "meta"
    MOCK = "mock"          # Development / CI mode


# ── Template IDs — must be pre-approved at BSP ────────────────────────────
TEMPLATES = {
    "bill_receipt": {
        "gupshup":   "smriti_bill_receipt_v1",
        "interakt":  "smriti_bill_receipt",
        "meta":      "smriti_bill_receipt",
    },
    "loyalty_earn": {
        "gupshup":   "smriti_loyalty_earn_v1",
        "interakt":  "smriti_loyalty_earn",
        "meta":      "smriti_loyalty_earn",
    },
    "loyalty_tier_upgrade": {
        "gupshup":   "smriti_tier_upgrade_v1",
        "interakt":  "smriti_tier_upgrade",
        "meta":      "smriti_tier_upgrade",
    },
    "day_end_summary": {
        "gupshup":   "smriti_dayend_ho_v1",
        "interakt":  "smriti_dayend_ho",
        "meta":      "smriti_dayend_ho",
    },
    "low_stock_alert": {
        "gupshup":   "smriti_low_stock_v1",
        "interakt":  "smriti_low_stock",
        "meta":      "smriti_low_stock",
    },
}


class WhatsAppGateway:
    """
    Unified WhatsApp Business API client.
    Instantiated once per request — stateless delivery.
    """

    def __init__(
        self,
        provider: str = None,
        api_key: str = None,
        from_number: str = None,
    ):
        self.provider = WAProvider(
            provider or os.getenv("WA_PROVIDER", "mock")
        )
        self.api_key = api_key or os.getenv("WA_API_KEY", "")
        self.from_number = from_number or os.getenv("WA_FROM_NUMBER", "")

    # ── Public send methods ──────────────────────────────────────────────────

    async def send_bill_receipt(
        self,
        mobile: str,
        bill_no: str,
        store_name: str,
        total_rs: float,
        points_earned: int = 0,
        points_balance: int = 0,
    ) -> dict:
        """Send post-billing receipt via WhatsApp template."""
        params = [
            store_name,
            bill_no,
            f"Rs.{total_rs:,.2f}",
            str(points_earned),
            str(points_balance),
        ]
        return await self._send_template(mobile, "bill_receipt", params)

    async def send_loyalty_earn(
        self,
        mobile: str,
        customer_name: str,
        earned: int,
        balance: int,
        tier: str,
    ) -> dict:
        """Notify customer of points earned."""
        params = [customer_name, str(earned), str(balance), tier]
        return await self._send_template(mobile, "loyalty_earn", params)

    async def send_tier_upgrade(
        self,
        mobile: str,
        customer_name: str,
        old_tier: str,
        new_tier: str,
        store_name: str,
    ) -> dict:
        """Congratulate customer on tier upgrade."""
        params = [customer_name, old_tier, new_tier, store_name]
        return await self._send_template(mobile, "loyalty_tier_upgrade", params)

    async def send_day_end_summary(
        self,
        mobile: str,
        store_name: str,
        z_number: str,
        bill_count: int,
        total_revenue: float,
        cash_variance: float,
    ) -> dict:
        """Send Day-End summary to HO/Manager mobile."""
        params = [
            store_name,
            z_number,
            str(bill_count),
            f"Rs.{total_revenue:,.2f}",
            f"Rs.{abs(cash_variance):,.2f} {'(Short)' if cash_variance < 0 else '(Excess)' if cash_variance > 0 else '(OK)'}",
        ]
        return await self._send_template(mobile, "day_end_summary", params)

    async def send_low_stock_alert(
        self,
        mobile: str,
        store_name: str,
        item_name: str,
        current_qty: int,
        reorder_level: int,
    ) -> dict:
        """Alert store manager when stock hits reorder level."""
        params = [store_name, item_name, str(current_qty), str(reorder_level)]
        return await self._send_template(mobile, "low_stock_alert", params)

    # ── Provider dispatch ────────────────────────────────────────────────────

    async def _send_template(
        self,
        mobile: str,
        template_key: str,
        params: list[str],
    ) -> dict:
        if self.provider == WAProvider.MOCK:
            return self._mock_send(mobile, template_key, params)

        template_name = TEMPLATES.get(template_key, {}).get(self.provider.value)
        if not template_name:
            logger.warning(f"[WA] No template mapped for {template_key}/{self.provider}")
            return {"status": "skipped", "reason": "no_template_mapping"}

        try:
            if self.provider == WAProvider.GUPSHUP:
                return await self._send_gupshup(mobile, template_name, params)
            elif self.provider == WAProvider.INTERAKT:
                return await self._send_interakt(mobile, template_name, params)
            elif self.provider == WAProvider.META:
                return await self._send_meta(mobile, template_name, params)
        except Exception as e:
            logger.error(f"[WA] Send failed for {mobile}: {e}")
            return {"status": "error", "error": str(e)}

        return {"status": "unknown_provider"}

    # ── Gupshup ──────────────────────────────────────────────────────────────
    async def _send_gupshup(self, mobile: str, template: str, params: list[str]) -> dict:
        url = "https://api.gupshup.io/wa/api/v1/template/msg"
        payload = {
            "channel": "whatsapp",
            "source": self.from_number,
            "destination": self._normalize(mobile),
            "src.name": "SMRITI-OS",
            "template": {
                "id": template,
                "params": params,
            },
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                url,
                data=payload,
                headers={"apikey": self.api_key},
            )
            resp.raise_for_status()
            return {"status": "sent", "provider": "gupshup", "response": resp.json()}

    # ── Interakt ─────────────────────────────────────────────────────────────
    async def _send_interakt(self, mobile: str, template: str, params: list[str]) -> dict:
        url = "https://api.interakt.ai/v1/public/message/"
        body_comps = [{"type": "body", "parameters": [{"type": "text", "text": p} for p in params]}]
        payload = {
            "countryCode": "+91",
            "phoneNumber": self._normalize(mobile, strip_country=True),
            "callbackData": "smriti-os",
            "type": "Template",
            "template": {
                "name": template,
                "languageCode": "en",
                "bodyValues": params,
            },
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Basic {self.api_key}",
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            return {"status": "sent", "provider": "interakt", "response": resp.json()}

    # ── Meta Cloud API ────────────────────────────────────────────────────────
    async def _send_meta(self, mobile: str, template: str, params: list[str]) -> dict:
        phone_id = os.getenv("WA_META_PHONE_ID", "")
        url = f"https://graph.facebook.com/v19.0/{phone_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "to": self._normalize(mobile),
            "type": "template",
            "template": {
                "name": template,
                "language": {"code": os.getenv("WA_TEMPLATE_LANG", "en")},
                "components": [
                    {
                        "type": "body",
                        "parameters": [{"type": "text", "text": p} for p in params],
                    }
                ],
            },
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            return {"status": "sent", "provider": "meta", "response": resp.json()}

    # ── Utilities ─────────────────────────────────────────────────────────────
    @staticmethod
    def _normalize(mobile: str, strip_country: bool = False) -> str:
        digits = "".join(c for c in mobile if c.isdigit())
        if strip_country:
            return digits[-10:] if len(digits) >= 10 else digits
        if len(digits) == 10:
            return f"91{digits}"
        return digits

    @staticmethod
    def _mock_send(mobile: str, template: str, params: list) -> dict:
        logger.info(f"[WA MOCK] → {mobile} | tpl={template} | params={params}")
        return {
            "status": "mock_sent",
            "provider": "mock",
            "mobile": mobile,
            "template": template,
            "params": params,
        }


# ── Module-level singleton factory ────────────────────────────────────────────
def get_gateway(provider: str = None, api_key: str = None, from_number: str = None) -> WhatsAppGateway:
    return WhatsAppGateway(provider=provider, api_key=api_key, from_number=from_number)
