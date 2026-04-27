# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

"""
gst.py - GST calculation engine (Sovereign Money Standard)

All monetary inputs/outputs are Decimal.
Internal math uses Decimal for precision.
Round-off to nearest whole rupee is applied at bill total level.
"""

from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List

# .. Valid GST slabs ...........................................................
VALID_GST_RATES = {Decimal("0"), Decimal("5"), Decimal("12"), Decimal("18"), Decimal("28")}

# .. Input types ...............................................................
@dataclass
class BillLineInput:
    product_id: int
    qty: float                          # Quantity - float allows partial units
    unit_price: Decimal                 # Monetary value (Decimal)
    mrp_at_billing: Decimal             # Monetary value (Decimal)
    gst_rate: Decimal                   # e.g. Decimal("18")
    hsn_code: Optional[str]
    discount_amount: Decimal = Decimal("0")


# .. Output types ..............................................................
@dataclass
class BillLineResult:
    product_id: int
    qty: float
    unit_price: Decimal
    mrp_at_billing: Decimal
    discount_amount: Decimal
    hsn_code: Optional[str]
    gst_rate: Decimal
    taxable_amount: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    line_total: Decimal


@dataclass
class BillTotals:
    subtotal_amount: Decimal
    total_discount: Decimal
    taxable_amount: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    total_tax_amount: Decimal
    round_off: Decimal           # Difference due to rounding to nearest Rupee
    total_amount: Decimal        # Payable grand total (rounded to nearest rupee)
    is_igst: bool
    lines: List[BillLineResult] = field(default_factory=list)


# .. Engine ....................................................................
class GSTEngine:
    """
    Stateless GST computation engine for the Sovereign Node.
    All money is Decimal; round-off applied only at bill-total level.
    """

    @staticmethod
    def _is_interstate(store_state: Optional[str], customer_gstin: Optional[str]) -> bool:
        if not customer_gstin or not store_state:
            return False
        return customer_gstin[:2] != store_state

    @staticmethod
    def _round2(value: Decimal) -> Decimal:
        """Rounds to 2 decimal places (nearest paisa)."""
        return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @classmethod
    def _split_gst(cls, taxable: Decimal, rate: Decimal, is_igst: bool):
        """Return (cgst, sgst, igst) as Decimal."""
        total_tax = cls._round2(taxable * rate / Decimal("100"))
        if is_igst:
            return Decimal("0"), Decimal("0"), total_tax
        half = cls._round2(total_tax / Decimal("2"))
        return half, total_tax - half, Decimal("0")

    @classmethod
    def compute_line(cls, line: BillLineInput, is_igst: bool) -> BillLineResult:
        # Normalise for set lookup (strips trailing zeros)
        if line.gst_rate.normalize() not in {r.normalize() for r in VALID_GST_RATES}:
            raise ValueError("Invalid GST rate")

        gross    = cls._round2(Decimal(str(line.unit_price)) * Decimal(str(line.qty)))
        discount = Decimal(str(line.discount_amount))
        taxable  = gross - discount
        cgst, sgst, igst = cls._split_gst(taxable, line.gst_rate, is_igst)

        return BillLineResult(
            product_id      = line.product_id,
            qty             = line.qty,
            unit_price      = Decimal(str(line.unit_price)),
            mrp_at_billing  = Decimal(str(line.mrp_at_billing)),
            discount_amount = discount,
            hsn_code        = line.hsn_code,
            gst_rate        = line.gst_rate,
            taxable_amount  = taxable,
            cgst_amount     = cgst,
            sgst_amount     = sgst,
            igst_amount     = igst,
            line_total      = taxable + cgst + sgst + igst,
        )

    @classmethod
    def compute_bill(
        cls,
        lines: List[BillLineInput],
        store_state: Optional[str] = None,
        customer_gstin: Optional[str] = None,
    ) -> BillTotals:
        if not lines:
            raise ValueError("empty bill")

        is_igst        = cls._is_interstate(store_state, customer_gstin)
        computed_lines = [cls.compute_line(line, is_igst) for line in lines]

        subtotal       = sum(cls._round2(Decimal(str(l.unit_price)) * Decimal(str(l.qty))) for l in lines)
        total_discount = sum(l.discount_amount for l in computed_lines)
        taxable        = sum(l.taxable_amount  for l in computed_lines)
        cgst           = sum(l.cgst_amount     for l in computed_lines)
        sgst           = sum(l.sgst_amount     for l in computed_lines)
        igst           = sum(l.igst_amount     for l in computed_lines)
        total_tax      = cgst + sgst + igst
        raw_total      = taxable + total_tax

        # Round off to nearest whole rupee
        rounded_total  = Decimal(str(round(float(raw_total))))
        round_off      = rounded_total - raw_total

        return BillTotals(
            subtotal_amount  = subtotal,
            total_discount   = total_discount,
            taxable_amount   = taxable,
            cgst_amount      = cgst,
            sgst_amount      = sgst,
            igst_amount      = igst,
            total_tax_amount = total_tax,
            round_off        = round_off,
            total_amount     = rounded_total,
            is_igst          = is_igst,
            lines            = computed_lines,
        )


# .. Validators ................................................................
def validate_hsn(hsn_code: Optional[str]) -> bool:
    if not hsn_code:
        return False
    return hsn_code.isdigit() and len(hsn_code) in (4, 6, 8)


def validate_gstin(gstin: Optional[str]) -> bool:
    import re
    if not gstin:
        return False
    # Must be uppercase to pass; we do NOT auto-uppercase
    pattern = r"^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$"
    return bool(re.match(pattern, gstin))
