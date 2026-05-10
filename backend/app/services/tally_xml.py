"""
tally_xml.py — SMRITI-OS Tally XML Serializer

Pure function module. Zero DB calls, zero network calls.
Takes SmritiSaleHdr + List[SmritiSaleDtl] and emits a valid
TallyPrime / Tally.ERP9 <ENVELOPE> XML string.

Architecture note:
  - The serializer is stateless and independently testable.
  - All amount math is done in Python Decimal; converted to
    Tally's required 2-decimal string only at emit time.
  - ALLLEDGERENTRIES.LIST order MUST be:
      1. Party/Debtor ledger (IsDeeemedPositive=Yes, negative sign)
      2. Sales ledger (credit)
      3. CGST/SGST or IGST ledger(s) (credit)
  - INVENTORYENTRIES.LIST one node per SmritiSaleDtl line.
  - Both sides must balance; Tally rejects if they don't.
"""

import xml.etree.ElementTree as ET
from decimal import Decimal
from datetime import datetime
from typing import List, Any


# ── Amount helpers ──────────────────────────────────────────────────────────

def _amt(value) -> str:
    """Convert any numeric to Tally 2-decimal rupee string."""
    return f"{Decimal(str(value)):.2f}"

def _neg(value) -> str:
    """Tally treats debit entries as negative amounts."""
    return f"-{_amt(value)}"


# ── GST Split ───────────────────────────────────────────────────────────────

def _gst_split(taxable: Decimal, rate: Decimal, is_inter_state: bool) -> dict:
    """
    Compute CGST/SGST or IGST from a taxable value and rate.
    Returns dict with keys: igst, cgst, sgst (all Decimal).
    """
    total_tax = (taxable * rate / 100).quantize(Decimal("0.01"))
    if is_inter_state:
        return {"igst": total_tax, "cgst": Decimal("0.00"), "sgst": Decimal("0.00")}
    half = (total_tax / 2).quantize(Decimal("0.01"))
    return {"igst": Decimal("0.00"), "cgst": half, "sgst": total_tax - half}


# ── Core Serializer ─────────────────────────────────────────────────────────

def serialize_sales_voucher(
    header: Any,            # SmritiSaleHdr ORM instance (or dict for testing)
    details: List[Any],     # List[SmritiSaleDtl] ORM instances (or dicts)
    company_name: str = "My Company",
    customer_name: str = "Cash Sales",
    customer_gstin: str = "",
    store_state_code: str = "27",
    customer_state_code: str = "27",
    gst_rate: Decimal = Decimal("18"),
    sales_ledger: str = "Sales Account",
    cgst_ledger: str = "Output CGST",
    sgst_ledger: str = "Output SGST",
    igst_ledger: str = "Output IGST",
    godown_name: str = "Main Location",
) -> str:
    """
    Serialize a single SmritiSaleHdr + its SmritiSaleDtl rows into
    a complete Tally XML ENVELOPE string.

    Returns: XML string ready to POST to the Tally Gateway.
    """

    # Attribute accessors — works with both ORM objects and plain dicts
    def g(obj, key, default=None):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    bill_no  = g(header, "bill_no", "UNKNOWN")
    bill_dt  = g(header, "bill_date", datetime.utcnow())
    net_amt  = Decimal(str(g(header, "net_amount", "0")))

    date_str = bill_dt.strftime("%Y%m%d") if isinstance(bill_dt, datetime) else str(bill_dt)

    is_inter = (store_state_code != customer_state_code) and bool(customer_gstin)

    # ── Calculate tax from net (Shoper9 stores tax-inclusive prices) ─────────
    # taxable = net / (1 + rate/100);  tax = net - taxable
    divisor  = Decimal("1") + gst_rate / Decimal("100")
    taxable_total = (net_amt / divisor).quantize(Decimal("0.01"))
    tax_total     = (net_amt - taxable_total).quantize(Decimal("0.01"))
    gst           = _gst_split(taxable_total, gst_rate, is_inter)

    # ── Build XML tree ────────────────────────────────────────────────────────
    envelope = ET.Element("ENVELOPE")

    # HEADER
    hdr = ET.SubElement(envelope, "HEADER")
    ET.SubElement(hdr, "TALLYREQUEST").text = "Import Data"

    # BODY → IMPORTDATA
    body        = ET.SubElement(envelope, "BODY")
    import_data = ET.SubElement(body, "IMPORTDATA")

    # REQUESTDESC
    req_desc = ET.SubElement(import_data, "REQUESTDESC")
    ET.SubElement(req_desc, "REPORTNAME").text = "Vouchers"
    static_vars = ET.SubElement(req_desc, "STATICVARIABLES")
    ET.SubElement(static_vars, "SVCURRENTCOMPANY").text = company_name

    # REQUESTDATA
    req_data = ET.SubElement(import_data, "REQUESTDATA")
    tally_msg = ET.SubElement(req_data, "TALLYMESSAGE", {"xmlns:UDF": "TallyUDF"})

    voucher = ET.SubElement(tally_msg, "VOUCHER", {
        "VCHTYPE": "Sales",
        "ACTION": "Create",
        "OBJVIEW": "Invoice Voucher View",
    })

    # ── Voucher Header Fields ─────────────────────────────────────────────────
    ET.SubElement(voucher, "DATE").text             = date_str
    ET.SubElement(voucher, "EFFECTIVEDATE").text    = date_str
    ET.SubElement(voucher, "VOUCHERTYPENAME").text  = "Sales"
    ET.SubElement(voucher, "VOUCHERNUMBER").text    = bill_no
    ET.SubElement(voucher, "PARTYLEDGERNAME").text  = customer_name
    ET.SubElement(voucher, "PERSISTEDVIEW").text    = "Invoice Voucher View"
    ET.SubElement(voucher, "ISINVOICE").text        = "Yes"
    ET.SubElement(voucher, "NARRATION").text        = f"SMRITI-OS Sale — Bill {bill_no}"

    if customer_gstin:
        ET.SubElement(voucher, "PARTYGSTIN").text   = customer_gstin
        ET.SubElement(voucher, "PLACEOFSUPPLY").text = customer_state_code

    # ── ALLLEDGERENTRIES.LIST ─────────────────────────────────────────────────
    # 1. Party/Debtor — Debit (negative in Tally convention)
    _add_ledger_entry(voucher, customer_name, _neg(net_amt), is_deemed_positive="Yes")

    # 2. Sales — Credit (taxable value only)
    _add_ledger_entry(voucher, sales_ledger, _amt(taxable_total), is_deemed_positive="No")

    # 3. GST Ledger(s) — Credit
    if is_inter:
        _add_ledger_entry(voucher, igst_ledger, _amt(gst["igst"]), is_deemed_positive="No")
    else:
        _add_ledger_entry(voucher, cgst_ledger, _amt(gst["cgst"]), is_deemed_positive="No")
        _add_ledger_entry(voucher, sgst_ledger, _amt(gst["sgst"]), is_deemed_positive="No")

    # ── INVENTORYENTRIES.LIST — one node per sale line ────────────────────────
    for dtl in details:
        sku   = g(dtl, "sku",   "UNKNOWN-SKU")
        qty   = Decimal(str(g(dtl, "qty",  "1")))
        rate  = Decimal(str(g(dtl, "rate", "0")))
        disc  = Decimal(str(g(dtl, "disc_amount", "0")))
        line_amount = (qty * rate - disc).quantize(Decimal("0.01"))

        inv = ET.SubElement(voucher, "INVENTORYENTRIES.LIST")
        ET.SubElement(inv, "STOCKITEMNAME").text    = sku
        ET.SubElement(inv, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(inv, "RATE").text             = f"{_amt(rate)}/NOS"
        ET.SubElement(inv, "AMOUNT").text           = _amt(line_amount)
        ET.SubElement(inv, "ACTUALQTY").text        = f"{qty} NOS"
        ET.SubElement(inv, "BILLEDQTY").text        = f"{qty} NOS"
        ET.SubElement(inv, "DISCOUNT").text         = _amt(disc)

        # Batch / Godown allocation
        batchalloc = ET.SubElement(inv, "BATCHALLOCATIONS.LIST")
        ET.SubElement(batchalloc, "GODOWNNAME").text    = godown_name
        ET.SubElement(batchalloc, "BATCHNAME").text     = "Primary Batch"
        ET.SubElement(batchalloc, "DESTINATIONGODOWNNAME").text = godown_name
        ET.SubElement(batchalloc, "AMOUNT").text        = _amt(line_amount)
        ET.SubElement(batchalloc, "ACTUALQTY").text     = f"{qty} NOS"
        ET.SubElement(batchalloc, "BILLEDQTY").text     = f"{qty} NOS"

        # Accounting allocation per line (links stock entry to sales ledger)
        acct = ET.SubElement(inv, "ACCOUNTINGALLOCATIONS.LIST")
        ET.SubElement(acct, "LEDGERNAME").text         = sales_ledger
        ET.SubElement(acct, "ISDEEMEDPOSITIVE").text   = "No"
        ET.SubElement(acct, "AMOUNT").text             = _amt(line_amount)

    return ET.tostring(envelope, encoding="unicode", xml_declaration=False)


def _add_ledger_entry(parent, ledger_name: str, amount_str: str, is_deemed_positive: str = "No"):
    """Helper — appends a single ALLLEDGERENTRIES.LIST node."""
    entry = ET.SubElement(parent, "ALLLEDGERENTRIES.LIST")
    ET.SubElement(entry, "LEDGERNAME").text         = ledger_name
    ET.SubElement(entry, "ISDEEMEDPOSITIVE").text   = is_deemed_positive
    ET.SubElement(entry, "AMOUNT").text             = amount_str


# ── Purchase Voucher (sprint-2, stubbed here) ────────────────────────────────

def serialize_purchase_voucher(header: Any, details: List[Any], **kwargs) -> str:
    """
    Stub — builds a Tally Purchase Voucher ENVELOPE.
    Follows identical structure to Sales; ACTION="Create", VCHTYPE="Purchase".
    Wired in Sprint 2 (Module 3 — GRN).
    """
    raise NotImplementedError("Purchase voucher serializer — Sprint 2")
