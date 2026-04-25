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
gst.py — GST calculation engine

Indian GST rules implemented:
  • Intra-state sale  → CGST (50%) + SGST (50%)
  • Inter-state sale  → IGST (100%)
  • B2C sale          → always intra-state split unless customer has GSTIN
  • Exempt / 0% goods → no tax computation, HSN still required for invoice

Usage:
    from app.core.gst import GSTEngine, BillLineInput

    lines = [BillLineInput(product_id=1, qty=2, unit_price=Decimal("500"), ...)]
    result = GSTEngine.compute_bill(lines, store_state="27", customer_gstin=None)
"""

from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List

# ── Valid GST slabs ───────────────────────────────────────────────────────────
VALID_GST_RATES = {Decimal("0"), Decimal("5"), Decimal("12"), Decimal("18"), Decimal("28")}

TWO_PLACES  = Decimal("0.01")
ZERO        = Decimal("0.00")


# ── Input / output types ──────────────────────────────────────────────────────
@dataclass
class BillLineInput:
    product_id: int
    qty: int
    unit_price: Decimal         # effective selling price (MRP or override)
    mrp_at_billing: Decimal     # MRP snapshot for audit
    gst_rate: Decimal           # e.g. Decimal("18")
    hsn_code: Optional[str]
    discount_amount: Decimal = ZERO


@dataclass
class BillLineResult:
    product_id: int
    qty: int
    unit_price: Decimal
    mrp_at_billing: Decimal
    discount_amount: Decimal
    hsn_code: Optional[str]
    gst_rate: Decimal
    taxable_amount: Decimal     # (unit_price * qty) - discount
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    line_total: Decimal         # taxable + tax


@dataclass
class BillTotals:
    subtotal_amount: Decimal    # sum of (unit_price * qty) across lines
    total_discount: Decimal
    taxable_amount: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    total_tax_amount: Decimal
    round_off: Decimal
    total_amount: Decimal       # payable grand total
    is_igst: bool               # True = inter-state transaction
    lines: List[BillLineResult] = field(default_factory=list)


# ── Engine ────────────────────────────────────────────────────────────────────
class GSTEngine:
    """
    Stateless GST computation engine.

    State codes (2-digit): 27=Maharashtra, 07=Delhi, 33=Tamil Nadu, etc.
    IGST applies when store_state != customer_state (derived from customer_gstin).
    """

    @staticmethod
    def _is_interstate(store_state: Optional[str], customer_gstin: Optional[str]) -> bool:
        """
        Determine IGST vs CGST+SGST.

        If the customer has a GSTIN, the first two digits are their state code.
        If they match the store's state → intra-state → CGST + SGST.
        Otherwise → inter-state → IGST.
        If no customer GSTIN (B2C retail) → always intra-state (CGST + SGST).
        """
        if not customer_gstin or not store_state:
            return False
        customer_state = customer_gstin[:2]
        return customer_state != store_state

    @staticmethod
    def _round2(value: Decimal) -> Decimal:
        return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)

    @staticmethod
    def _split_gst(taxable: Decimal, rate: Decimal, is_igst: bool):
        """Return (cgst, sgst, igst) given the taxable amount and rate."""
        total_tax = GSTEngine._round2(taxable * rate / Decimal("100"))
        if is_igst:
            return ZERO, ZERO, total_tax
        half = GSTEngine._round2(total_tax / Decimal("2"))
        # The other half absorbs any rounding penny
        other_half = total_tax - half
        return half, other_half, ZERO

    @classmethod
    def compute_line(
        cls,
        line: BillLineInput,
        is_igst: bool,
    ) -> BillLineResult:
        """Compute GST for a single bill line item."""
        if line.gst_rate not in VALID_GST_RATES:
            raise ValueError(
                f"[PrimeSetu] Invalid GST rate {line.gst_rate}. "
                f"Must be one of {sorted(VALID_GST_RATES)}."
            )

        gross        = cls._round2(line.unit_price * line.qty)
        taxable      = cls._round2(gross - line.discount_amount)
        cgst, sgst, igst = cls._split_gst(taxable, line.gst_rate, is_igst)
        line_total   = cls._round2(taxable + cgst + sgst + igst)

        return BillLineResult(
            product_id      = line.product_id,
            qty             = line.qty,
            unit_price      = cls._round2(line.unit_price),
            mrp_at_billing  = cls._round2(line.mrp_at_billing),
            discount_amount = cls._round2(line.discount_amount),
            hsn_code        = line.hsn_code,
            gst_rate        = line.gst_rate,
            taxable_amount  = taxable,
            cgst_amount     = cgst,
            sgst_amount     = sgst,
            igst_amount     = igst,
            line_total      = line_total,
        )

    @classmethod
    def compute_bill(
        cls,
        lines: List[BillLineInput],
        store_state: Optional[str] = None,
        customer_gstin: Optional[str] = None,
    ) -> BillTotals:
        """
        Compute all GST amounts and totals for a complete bill.

        Args:
            lines          — list of BillLineInput items
            store_state    — 2-char state code of the store (e.g. "27" for Maharashtra)
            customer_gstin — customer's GSTIN if B2B, None for B2C retail

        Returns:
            BillTotals with fully computed breakdown and rounded grand total.
        """
        if not lines:
            raise ValueError("[PrimeSetu] Cannot compute GST on an empty bill.")

        is_igst = cls._is_interstate(store_state, customer_gstin)
        computed_lines: List[BillLineResult] = [
            cls.compute_line(line, is_igst) for line in lines
        ]

        subtotal_amount  = cls._round2(sum(
            line.unit_price * line.qty for line in lines
        ))
        total_discount   = cls._round2(sum(l.discount_amount for l in lines))
        taxable_amount   = cls._round2(sum(l.taxable_amount  for l in computed_lines))
        cgst_amount      = cls._round2(sum(l.cgst_amount     for l in computed_lines))
        sgst_amount      = cls._round2(sum(l.sgst_amount     for l in computed_lines))
        igst_amount      = cls._round2(sum(l.igst_amount     for l in computed_lines))
        total_tax_amount = cls._round2(cgst_amount + sgst_amount + igst_amount)
        raw_total        = taxable_amount + total_tax_amount

        # Round off to nearest rupee (standard retail practice)
        rounded_total    = cls._round2(round(float(raw_total)))
        round_off        = cls._round2(Decimal(str(rounded_total)) - raw_total)
        total_amount     = cls._round2(raw_total + round_off)

        return BillTotals(
            subtotal_amount  = subtotal_amount,
            total_discount   = total_discount,
            taxable_amount   = taxable_amount,
            cgst_amount      = cgst_amount,
            sgst_amount      = sgst_amount,
            igst_amount      = igst_amount,
            total_tax_amount = total_tax_amount,
            round_off        = round_off,
            total_amount     = total_amount,
            is_igst          = is_igst,
            lines            = computed_lines,
        )


# ── HSN validator (basic) ─────────────────────────────────────────────────────
def validate_hsn(hsn_code: Optional[str]) -> bool:
    """
    HSN codes must be 4, 6, or 8 digits (numeric).
    4-digit HSN → turnover < ₹5Cr (allowed for small retailers)
    6-digit HSN → turnover ₹5Cr–₹50Cr
    8-digit HSN → turnover > ₹50Cr (mandatory for exports)
    """
    if not hsn_code:
        return False
    return hsn_code.isdigit() and len(hsn_code) in (4, 6, 8)


# ── GSTIN validator ───────────────────────────────────────────────────────────
def validate_gstin(gstin: Optional[str]) -> bool:
    """
    GSTIN format: 2-digit state + 10-char PAN + 1-digit entity + 'Z' + 1 checksum
    Total: 15 alphanumeric characters.
    """
    import re
    if not gstin:
        return False
    pattern = r"^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$"
    return bool(re.match(pattern, gstin.upper()))
