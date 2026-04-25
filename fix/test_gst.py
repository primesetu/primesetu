# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================

"""
tests/test_gst.py — GST engine unit tests

Run with:  pytest tests/test_gst.py -v

Covers:
  • Intra-state: CGST + SGST split
  • Inter-state (B2B with GSTIN): IGST
  • Zero-rated goods (0% GST)
  • Multiple items in a bill
  • Round-off behaviour
  • GSTIN and HSN validators
  • Invalid GST slab rejection
"""

import pytest
from decimal import Decimal
from app.core.gst import (
    GSTEngine, BillLineInput, BillTotals,
    validate_gstin, validate_hsn, VALID_GST_RATES
)

ZERO = Decimal("0.00")


# ── Helpers ───────────────────────────────────────────────────────────────────
def make_line(
    product_id=1,
    qty=1,
    unit_price="100.00",
    mrp="100.00",
    gst_rate="18.00",
    hsn="61091000",
    discount="0.00",
) -> BillLineInput:
    return BillLineInput(
        product_id=product_id,
        qty=qty,
        unit_price=Decimal(unit_price),
        mrp_at_billing=Decimal(mrp),
        gst_rate=Decimal(gst_rate),
        hsn_code=hsn,
        discount_amount=Decimal(discount),
    )


# ── Intra-state: CGST + SGST ──────────────────────────────────────────────────
class TestIntraState:
    def test_single_item_18pct(self):
        """₹100 item at 18% GST → CGST 9 + SGST 9 = ₹18 tax, total ₹118"""
        line = make_line(unit_price="100.00", gst_rate="18.00")
        result = GSTEngine.compute_bill([line], store_state="27", customer_gstin=None)

        assert result.is_igst is False
        assert result.taxable_amount == Decimal("100.00")
        assert result.cgst_amount    == Decimal("9.00")
        assert result.sgst_amount    == Decimal("9.00")
        assert result.igst_amount    == ZERO
        assert result.total_tax_amount == Decimal("18.00")
        assert result.total_amount   == Decimal("118.00")

    def test_single_item_12pct(self):
        line = make_line(unit_price="500.00", gst_rate="12.00")
        result = GSTEngine.compute_bill([line], store_state="27")

        assert result.cgst_amount == Decimal("30.00")
        assert result.sgst_amount == Decimal("30.00")
        assert result.total_amount == Decimal("560.00")

    def test_single_item_5pct(self):
        line = make_line(unit_price="200.00", gst_rate="5.00")
        result = GSTEngine.compute_bill([line], store_state="27")

        assert result.cgst_amount == Decimal("5.00")
        assert result.sgst_amount == Decimal("5.00")
        assert result.total_amount == Decimal("210.00")

    def test_zero_rated_item(self):
        line = make_line(unit_price="150.00", gst_rate="0.00")
        result = GSTEngine.compute_bill([line], store_state="27")

        assert result.cgst_amount == ZERO
        assert result.sgst_amount == ZERO
        assert result.total_tax_amount == ZERO
        assert result.total_amount == Decimal("150.00")

    def test_28pct_luxury(self):
        line = make_line(unit_price="1000.00", gst_rate="28.00")
        result = GSTEngine.compute_bill([line], store_state="27")

        assert result.cgst_amount == Decimal("140.00")
        assert result.sgst_amount == Decimal("140.00")
        assert result.total_amount == Decimal("1280.00")

    def test_quantity_multiplied(self):
        line = make_line(qty=3, unit_price="100.00", gst_rate="18.00")
        result = GSTEngine.compute_bill([line], store_state="27")

        assert result.taxable_amount == Decimal("300.00")
        assert result.cgst_amount    == Decimal("27.00")
        assert result.sgst_amount    == Decimal("27.00")
        assert result.total_amount   == Decimal("354.00")


# ── Inter-state: IGST ─────────────────────────────────────────────────────────
class TestInterState:
    def test_igst_applied_when_gstin_differs(self):
        """Store in MH (27), customer GSTIN starts with 07 (Delhi) → IGST"""
        line = make_line(unit_price="100.00", gst_rate="18.00")
        # Customer GSTIN: 07AAAAA0000A1Z5 → Delhi
        result = GSTEngine.compute_bill(
            [line], store_state="27", customer_gstin="07AAAAA0000A1Z5"
        )

        assert result.is_igst is True
        assert result.cgst_amount == ZERO
        assert result.sgst_amount == ZERO
        assert result.igst_amount == Decimal("18.00")
        assert result.total_amount == Decimal("118.00")

    def test_intrastate_when_gstin_same_state(self):
        """Store in MH (27), customer GSTIN also 27 → CGST + SGST"""
        line = make_line(unit_price="100.00", gst_rate="18.00")
        result = GSTEngine.compute_bill(
            [line], store_state="27", customer_gstin="27BBBBB1111B1Z3"
        )

        assert result.is_igst is False
        assert result.cgst_amount == Decimal("9.00")
        assert result.sgst_amount == Decimal("9.00")

    def test_no_customer_gstin_always_intrastate(self):
        """B2C retail — no GSTIN → always CGST + SGST"""
        line = make_line(unit_price="100.00", gst_rate="18.00")
        result = GSTEngine.compute_bill([line], store_state="27", customer_gstin=None)
        assert result.is_igst is False


# ── Discount handling ─────────────────────────────────────────────────────────
class TestDiscounts:
    def test_discount_reduces_taxable(self):
        """₹1000 item, ₹100 discount → taxable ₹900 → GST on 900"""
        line = make_line(unit_price="1000.00", gst_rate="18.00", discount="100.00")
        result = GSTEngine.compute_bill([line], store_state="27")

        assert result.taxable_amount == Decimal("900.00")
        assert result.cgst_amount    == Decimal("81.00")
        assert result.sgst_amount    == Decimal("81.00")
        assert result.total_amount   == Decimal("1062.00")

    def test_full_discount_zero_tax(self):
        line = make_line(unit_price="200.00", gst_rate="18.00", discount="200.00")
        result = GSTEngine.compute_bill([line], store_state="27")

        assert result.taxable_amount == ZERO
        assert result.total_tax_amount == ZERO
        assert result.total_amount == ZERO


# ── Multi-item bill ───────────────────────────────────────────────────────────
class TestMultiItem:
    def test_two_items_different_rates(self):
        lines = [
            make_line(product_id=1, unit_price="1000.00", gst_rate="18.00"),
            make_line(product_id=2, unit_price="500.00",  gst_rate="5.00"),
        ]
        result = GSTEngine.compute_bill(lines, store_state="27")

        # Item 1: ₹180 tax. Item 2: ₹25 tax. Total tax ₹205
        assert result.total_tax_amount == Decimal("205.00")
        # Subtotal ₹1500, tax ₹205 = ₹1705
        assert result.total_amount == Decimal("1705.00")

    def test_line_totals_sum_to_bill_total(self):
        lines = [
            make_line(product_id=1, qty=2, unit_price="199.00", gst_rate="18.00"),
            make_line(product_id=2, qty=1, unit_price="850.00", gst_rate="12.00"),
        ]
        result = GSTEngine.compute_bill(lines, store_state="27")
        sum_of_lines = sum(l.line_total for l in result.lines)
        # line totals sum == taxable + tax (before round_off)
        assert sum_of_lines == result.taxable_amount + result.total_tax_amount


# ── Round-off ─────────────────────────────────────────────────────────────────
class TestRoundOff:
    def test_round_off_applied(self):
        """Round-off should bring total to nearest whole rupee."""
        line = make_line(unit_price="101.00", gst_rate="18.00")
        result = GSTEngine.compute_bill([line], store_state="27")
        # total_amount must be a whole rupee
        assert result.total_amount == result.total_amount.quantize(Decimal("1"))


# ── Validators ────────────────────────────────────────────────────────────────
class TestValidators:
    # GSTIN
    def test_valid_gstin(self):
        assert validate_gstin("27AABCU9603R1ZX") is True

    def test_gstin_wrong_length(self):
        assert validate_gstin("27AABCU9603R1Z") is False

    def test_gstin_none(self):
        assert validate_gstin(None) is False

    def test_gstin_lowercase_rejected(self):
        # Must be uppercase
        assert validate_gstin("27aabcu9603r1zx") is False

    # HSN
    def test_hsn_4digit_valid(self):
        assert validate_hsn("6109") is True

    def test_hsn_6digit_valid(self):
        assert validate_hsn("610910") is True

    def test_hsn_8digit_valid(self):
        assert validate_hsn("61091000") is True

    def test_hsn_5digit_invalid(self):
        assert validate_hsn("61091") is False

    def test_hsn_alpha_invalid(self):
        assert validate_hsn("6109AB") is False

    def test_hsn_none_invalid(self):
        assert validate_hsn(None) is False

    # Invalid GST slab
    def test_invalid_gst_slab(self):
        line = make_line(gst_rate="15.00")
        with pytest.raises(ValueError, match="Invalid GST rate"):
            GSTEngine.compute_bill([line], store_state="27")

    def test_empty_bill_raises(self):
        with pytest.raises(ValueError, match="empty bill"):
            GSTEngine.compute_bill([], store_state="27")
