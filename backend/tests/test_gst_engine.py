# ============================================================
# PrimeSetu — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

import pytest
from decimal import Decimal
from app.core.gst import GSTEngine, BillLineInput

def test_gst_calc_intra_state():
    """
    Test 1: Standard 18% GST (Intra-state)
    Price: 1000.00 (100000 paise)
    Taxable: 100000
    Expected Tax: 18000 paise (9000 CGST, 9000 SGST)
    Total: 118000 paise
    """
    line = BillLineInput(
        product_id=1,
        qty=1.0,
        unit_price=100000,
        mrp_at_billing=100000,
        gst_rate=Decimal("18"),
        hsn_code="6105"
    )
    
    # Store in MH (27), Customer no GSTIN (Intra)
    totals = GSTEngine.compute_bill([line], store_state="27", customer_gstin=None)
    
    assert totals.taxable_amount == 100000
    assert totals.cgst_amount == 9000
    assert totals.sgst_amount == 9000
    assert totals.igst_amount == 0
    assert totals.total_amount == 118000
    assert totals.round_off == 0

def test_gst_calc_inter_state():
    """
    Test 2: Standard 12% GST (Inter-state)
    Price: 500.00 (50000 paise)
    Expected Tax: 6000 paise (6000 IGST)
    """
    line = BillLineInput(
        product_id=2,
        qty=1.0,
        unit_price=50000,
        mrp_at_billing=50000,
        gst_rate=Decimal("12"),
        hsn_code="6203"
    )
    
    # Store in MH (27), Customer in KA (29)
    totals = GSTEngine.compute_bill([line], store_state="27", customer_gstin="29AAAAA0000A1Z5")
    
    assert totals.is_igst is True
    assert totals.taxable_amount == 50000
    assert totals.igst_amount == 6000
    assert totals.cgst_amount == 0
    assert totals.total_amount == 56000

def test_tally_rounding_logic():
    """
    Test 3: Rounding to nearest Rupee (100-paise boundary)
    Price: 99.90 (9990 paise)
    Tax (18%): 1798.2 -> 1798 paise
    Raw Total: 11788 paise (₹117.88)
    Expected Rounded: 11800 paise (₹118.00)
    Expected Round-off: +12 paise
    """
    line = BillLineInput(
        product_id=3,
        qty=1.0,
        unit_price=9990,
        mrp_at_billing=9990,
        gst_rate=Decimal("18"),
        hsn_code="1234"
    )
    
    totals = GSTEngine.compute_bill([line], store_state="27", customer_gstin=None)
    
    # Raw Total: 9990 + 1798.20 = 11788.20
    # Rounded to nearest whole rupee: 11788 (round(11788.20) = 11788)
    # Round-off: 11788 - 11788.20 = -0.20
    assert totals.taxable_amount == Decimal("9990")
    assert totals.total_tax_amount == Decimal("1798.20")
    assert totals.total_amount == Decimal("11788")
    assert totals.round_off == Decimal("-0.20")

def test_discount_first_calculation():
    """
    Test 4: Discount applied before GST (Shoper9/Tally parity)
    MRP: 1000.00 (100000)
    Discount: 100.00 (10000)
    Taxable: 900.00 (90000)
    Tax (18%): 16200
    Total: 106200
    """
    line = BillLineInput(
        product_id=4,
        qty=1.0,
        unit_price=100000,
        mrp_at_billing=100000,
        gst_rate=Decimal("18"),
        hsn_code="1111",
        discount_amount=10000
    )
    
    totals = GSTEngine.compute_bill([line], store_state="27", customer_gstin=None)
    
    assert totals.taxable_amount == 90000
    assert totals.total_tax_amount == 16200
    assert totals.total_amount == 106200
