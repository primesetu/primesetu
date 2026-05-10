"""
tally_gateway.py — SMRITI-OS Tally HTTP Delivery Client

Thin async httpx client.  POSTs XML to the Tally Gateway service
running on the retailer's local Windows machine (default: localhost:9000).

Responsibilities:
  - POST the XML envelope.
  - Parse Tally's XML response (not JSON).
  - Return a structured TallyGatewayResult the Celery task can act on.
  - Never raise — always return a result so the task can decide on retry logic.
"""

import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import httpx


# ── Response model ───────────────────────────────────────────────────────────

@dataclass
class TallyGatewayResult:
    success: bool
    tally_response: Optional[str] = None   # raw XML from Tally
    lineid: Optional[str] = None           # Tally's internal line ID on success
    error_message: Optional[str] = None
    http_status: Optional[int] = None
    attempted_at: datetime = None

    def __post_init__(self):
        if self.attempted_at is None:
            self.attempted_at = datetime.utcnow()


# ── Parser ───────────────────────────────────────────────────────────────────

def _parse_tally_response(xml_text: str) -> TallyGatewayResult:
    """
    Tally Gateway returns XML like:
      <RESPONSE>
        <CREATED>1</CREATED>
        <LINEERROR></LINEERROR>
      </RESPONSE>
    or on failure:
      <RESPONSE>
        <CREATED>0</CREATED>
        <LINEERROR>Error description from Tally</LINEERROR>
      </RESPONSE>
    """
    try:
        root = ET.fromstring(xml_text)

        # Tally wraps result in IMPORTRESULT or RESPONSE depending on version
        created_node = (
            root.find(".//CREATED") or
            root.find(".//IMPORTRESULT/CREATED")
        )
        error_node = (
            root.find(".//LINEERROR") or
            root.find(".//IMPORTRESULT/LINEERROR")
        )
        lineid_node = root.find(".//LINEID")

        created = int(created_node.text.strip()) if created_node is not None and created_node.text else 0
        error   = error_node.text.strip() if error_node is not None and error_node.text else None
        lineid  = lineid_node.text.strip() if lineid_node is not None and lineid_node.text else None

        if created >= 1:
            return TallyGatewayResult(success=True, tally_response=xml_text, lineid=lineid)
        else:
            return TallyGatewayResult(success=False, tally_response=xml_text, error_message=error or "Tally rejected the voucher")

    except ET.ParseError as e:
        return TallyGatewayResult(success=False, tally_response=xml_text, error_message=f"Tally response parse error: {e}")


# ── Gateway Client ───────────────────────────────────────────────────────────

class TallyGatewayClient:
    """
    Async HTTP client for the Tally Gateway Service.

    In single-store mode:  gateway_url = "http://localhost:9000"
    In multi-store mode:   gateway_url = store's relay endpoint URL
                           (the FastAPI relay running at the store node).
    """

    DEFAULT_PORT = 9000
    TIMEOUT_SECONDS = 15

    def __init__(self, gateway_url: str = "http://localhost:9000"):
        self.gateway_url = gateway_url.rstrip("/")

    async def push(self, xml_payload: str) -> TallyGatewayResult:
        """
        POST xml_payload to the Tally Gateway and return a structured result.
        Never raises — connection errors are captured in the result.
        """
        headers = {
            "Content-Type": "text/xml;charset=UTF-16",   # Tally expects UTF-16 or UTF-8 depending on version
        }

        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT_SECONDS) as client:
                response = await client.post(
                    self.gateway_url,
                    content=xml_payload.encode("utf-16"),
                    headers=headers,
                )
                result = _parse_tally_response(response.text)
                result.http_status = response.status_code
                return result

        except httpx.ConnectError:
            return TallyGatewayResult(
                success=False,
                error_message="Tally Gateway unreachable — ensure the Tally service is running and port 9000 is open.",
                http_status=None,
            )
        except httpx.TimeoutException:
            return TallyGatewayResult(
                success=False,
                error_message=f"Tally Gateway timeout after {self.TIMEOUT_SECONDS}s.",
                http_status=None,
            )
        except Exception as e:
            return TallyGatewayResult(
                success=False,
                error_message=f"Unexpected error communicating with Tally: {e}",
                http_status=None,
            )

    async def health_check(self) -> bool:
        """
        Quick connectivity test — sends a minimal Tally XML to check if the
        gateway is alive without creating any vouchers.
        """
        test_xml = (
            "<ENVELOPE>"
            "<HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>"
            "<BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME></REQUESTDESC></EXPORTDATA></BODY>"
            "</ENVELOPE>"
        )
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.post(self.gateway_url, content=test_xml.encode("utf-16"))
                return resp.status_code < 500
        except Exception:
            return False
