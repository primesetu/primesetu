# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R. M.
# Organisation     : AITDL Network
# Project          : PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

"""
gst.py — GST calculation engine (Sovereign Money Standard)

All monetary inputs and outputs are INTEGERS (PAISE).
Internal math uses Decimal for precision, then rounds to nearest Paise.
"""

from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List

# ── Valid GST slabs ───────────────────────────────────────────────────────────
VALID_GST_RATES = {Decimal("0"), Decimal("5"), Decimal("12"), Decimal("18"), Decimal("28")}

# ── Input / output types (All money in PAISE) ─────────────────────────────────
@dataclass
class BillLineInput:
    product_id: int
    qty: float                  # Quantity remains float for partial units
    unit_price: int             # In Paise
    mrp_at_billing: int         # In Paise
    gst_rate: Decimal           # e.g. Decimal("18")
    hsn_code: Optional[str]
    discount_amount: int = 0    # In Paise


@dataclass
class BillLineResult:
    product_id: int
    qty: float
    unit_price: int
    mrp_at_billing: int
    discount_amount: int
    hsn_code: Optional[str]
    gst_rate: Decimal
    taxable_amount: int         # In Paise
    cgst_amount: int
    sgst_amount: int
    igst_amount: int
    line_total: int             # In Paise


@dataclass
class BillTotals:
    subtotal_amount: int        # In Paise
    total_discount: int
    taxable_amount: int
    cgst_amount: int
    sgst_amount: int
    igst_amount: int
    total_tax_amount: int
    round_off: int              # Difference due to rounding to nearest Rupee (100 Paise)
    total_amount: int           # Payable grand total (rounded to 100-paise boundary)
    is_igst: bool
    lines: List[BillLineResult] = field(default_factory=list)


# ── Engine ────────────────────────────────────────────────────────────────────
class GSTEngine:
    """
    Stateless GST computation engine for the Sovereign Node.
    """

    @staticmethod
    def _is_interstate(store_state: Optional[str], customer_gstin: Optional[str]) -> bool:
        if not customer_gstin or not store_state:
            return False
        customer_state = customer_gstin[:2]
        return customer_state != store_state

    @staticmethod
    def _round_paise(value: Decimal) -> int:
        """Rounds a decimal value to the nearest integer Paisa."""
        return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    @staticmethod
    def _split_gst(taxable_paise: int, rate: Decimal, is_igst: bool):
        """Return (cgst, sgst, igst) in PAISE."""
        total_tax_decimal = Decimal(taxable_paise) * rate / Decimal("100")
        total_tax_paise = GSTEngine._round_paise(total_tax_decimal)
        
        if is_igst:
            return 0, 0, total_tax_paise
            
        half_paise = total_tax_paise // 2
        # The other half absorbs any rounding oddity
        other_half_paise = total_tax_paise - half_paise
        return half_paise, other_half_paise, 0

    @classmethod
    def compute_line(
        cls,
        line: BillLineInput,
        is_igst: bool,
    ) -> BillLineResult:
        if line.gst_rate not in VALID_GST_RATES:
            raise ValueError(f"[GST] Invalid rate {line.gst_rate}")

        # Gross = Unit Price * Qty
        gross_paise = cls._round_paise(Decimal(line.unit_price) * Decimal(str(line.qty)))
        taxable_paise = gross_paise - line.discount_amount
        
        cgst, sgst, igst = cls._split_gst(taxable_paise, line.gst_rate, is_igst)
        line_total_paise = taxable_paise + cgst + sgst + igst

        return BillLineResult(
            product_id      = line.product_id,
            qty             = line.qty,
            unit_price      = line.unit_price,
            mrp_at_billing  = line.mrp_at_billing,
            discount_amount = line.discount_amount,
            hsn_code        = line.hsn_code,
            gst_rate        = line.gst_rate,
            taxable_amount  = taxable_paise,
            cgst_amount     = cgst,
            sgst_amount     = sgst,
            igst_amount     = igst,
            line_total      = line_total_paise,
        )

    @classmethod
    def compute_bill(
        cls,
        lines: List[BillLineInput],
        store_state: Optional[str] = None,
        customer_gstin: Optional[str] = None,
    ) -> BillTotals:
        if not lines:
            raise ValueError("Empty bill")

        is_igst = cls._is_interstate(store_state, customer_gstin)
        computed_lines = [cls.compute_line(line, is_igst) for line in lines]

        subtotal_paise = sum(cls._round_paise(Decimal(l.unit_price) * Decimal(str(l.qty))) for l in lines)
        total_discount_paise = sum(l.discount_amount for l in computed_lines)
        taxable_paise = sum(l.taxable_amount for l in computed_lines)
        cgst_paise = sum(l.cgst_amount for l in computed_lines)
        sgst_paise = sum(l.sgst_amount for l in computed_lines)
        igst_paise = sum(l.igst_amount for l in computed_lines)
        total_tax_paise = cgst_paise + sgst_paise + igst_paise
        raw_total_paise = taxable_paise + total_tax_paise

        # Round off to nearest Rupee (100 Paise)
        # Formula: round(raw_total / 100) * 100
        rounded_total_paise = int(round(raw_total_paise / 100.0) * 100)
        round_off_paise = rounded_total_paise - raw_total_paise

        return BillTotals(
            subtotal_amount  = subtotal_paise,
            total_discount   = total_discount_paise,
            taxable_amount   = taxable_paise,
            cgst_amount      = cgst_paise,
            sgst_amount      = sgst_paise,
            igst_amount      = igst_paise,
            total_tax_amount = total_tax_paise,
            round_off        = round_off_paise,
            total_amount     = rounded_total_paise,
            is_igst          = is_igst,
            lines            = computed_lines,
        )


def validate_hsn(hsn_code: Optional[str]) -> bool:
    if not hsn_code: return False
    return hsn_code.isdigit() and len(hsn_code) in (4, 6, 8)


def validate_gstin(gstin: Optional[str]) -> bool:
    import re
    if not gstin: return False
    pattern = r"^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$"
    return bool(re.match(pattern, gstin.upper()))
