/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: tally-voucher
 * ============================================================ */

# SKILL: Tally XML Voucher Generation

Read this file completely before writing any Tally integration code.

---

## When to use this skill

Any time you need to generate or modify the Tally ERP 9 / TallyPrime XML export.
This covers: sales vouchers, return (CN) vouchers, GST ledger mapping.

---

## Tally XML structure — Sales Voucher (GST compliant)

This is the canonical structure for a PrimeSetu → Tally sync.
Every field marked MANDATORY must be present or Tally will silently reject the voucher.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>{{ company_name }}</SVCURRENTCOMPANY>  <!-- MANDATORY -->
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">

            <!-- MANDATORY: Date in YYYYMMDD format -->
            <DATE>{{ sale_date | format_tally_date }}</DATE>

            <!-- MANDATORY: Unique voucher number — use PrimeSetu invoice_no -->
            <VOUCHERNUMBER>{{ invoice_no }}</VOUCHERNUMBER>

            <VCHTYPE>Sales</VCHTYPE>
            <NARRATION>PrimeSetu Sale — Store: {{ store_name }}</NARRATION>

            <!-- Party ledger (customer) -->
            <PARTYLEDGERNAME>Cash</PARTYLEDGERNAME>  <!-- or customer GSTIN if B2B -->

            <!-- MANDATORY: Ledger entries — must balance to zero -->
            <ALLLEDGERENTRIES.LIST>

              <!-- Debit: cash/bank received -->
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-{{ total_paise | paise_to_rupees }}</AMOUNT>  <!-- negative = debit in Tally -->

            </ALLLEDGERENTRIES.LIST>

            <!-- Sales ledger credit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{{ subtotal_paise | paise_to_rupees }}</AMOUNT>

              <!-- INVENTORY ENTRIES — one per line item -->
              <INVENTORYENTRIES.LIST>
                <STOCKITEMNAME>{{ item.product_name }}</STOCKITEMNAME>
                <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                <RATE>{{ item.unit_price_paise | paise_to_rupees }}/Nos</RATE>
                <AMOUNT>{{ item.line_total_paise | paise_to_rupees }}</AMOUNT>
                <ACTUALQTY>{{ item.qty }} Nos</ACTUALQTY>
                <BILLEDQTY>{{ item.qty }} Nos</BILLEDQTY>

                <!-- GST details per line item -->
                <ACCOUNTINGALLOCATIONS.LIST>
                  <LEDGERNAME>Sales</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                  <AMOUNT>{{ item.line_total_paise | paise_to_rupees }}</AMOUNT>
                </ACCOUNTINGALLOCATIONS.LIST>
              </INVENTORYENTRIES.LIST>

            </ALLLEDGERENTRIES.LIST>

            <!-- CGST ledger (intrastate) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>CGST @{{ item.gst_rate // 2 }}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{{ cgst_paise | paise_to_rupees }}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- SGST ledger (intrastate) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>SGST @{{ item.gst_rate // 2 }}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{{ sgst_paise | paise_to_rupees }}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>
```

---

## Python helper — generate_tally_voucher()

```python
# backend/app/tally/voucher.py

from datetime import date
from decimal import Decimal

def paise_to_rupees(paise: int) -> str:
    """Convert paise integer to Tally-format rupee string. Never use float."""
    rupees = paise // 100
    paisa = paise % 100
    return f"{rupees}.{paisa:02d}"

def format_tally_date(d: date) -> str:
    """Tally requires YYYYMMDD format."""
    return d.strftime("%Y%m%d")

def generate_sales_voucher(sale: dict) -> str:
    """
    Generate a Tally-importable XML string for a PrimeSetu sale.

    Args:
        sale: dict with keys:
            invoice_no, sale_date, store_name, company_name,
            items: list of {product_name, qty, unit_price_paise, gst_rate, line_total_paise}
            total_paise, subtotal_paise, cgst_paise, sgst_paise
            payment_mode: 'cash' | 'upi' | 'card'
    """
    # Validate totals balance (must be zero-sum in Tally)
    computed_total = sale['subtotal_paise'] + sale['cgst_paise'] + sale['sgst_paise']
    if computed_total != sale['total_paise']:
        raise ValueError(
            f"[PrimeSetu Tally] Voucher imbalance: "
            f"subtotal+gst={computed_total} != total={sale['total_paise']}"
        )

    # Validate GST rates
    valid_rates = {0, 5, 12, 18, 28}
    for item in sale['items']:
        if item['gst_rate'] not in valid_rates:
            raise ValueError(f"Invalid GST rate: {item['gst_rate']}")

    # Map payment mode to Tally ledger name
    payment_ledger_map = {
        'cash': 'Cash',
        'upi': 'UPI Receipts',
        'card': 'Card Receipts',
    }
    payment_ledger = payment_ledger_map.get(sale['payment_mode'], 'Cash')

    # Build XML (use a template engine in production — this is illustrative)
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  ...
  <DATE>{format_tally_date(sale['sale_date'])}</DATE>
  <VOUCHERNUMBER>{sale['invoice_no']}</VOUCHERNUMBER>
  ...
</ENVELOPE>"""

    return xml
```

---

## GST ledger naming convention in Tally

PrimeSetu uses these exact ledger names. If the customer's Tally company uses different names, they must be configurable per store — never hardcoded.

| GST Rate | CGST Ledger | SGST Ledger | IGST Ledger |
|----------|------------|------------|------------|
| 5% | `CGST @2.5%` | `SGST @2.5%` | `IGST @5%` |
| 12% | `CGST @6%` | `SGST @6%` | `IGST @12%` |
| 18% | `CGST @9%` | `SGST @9%` | `IGST @18%` |
| 28% | `CGST @14%` | `SGST @14%` | `IGST @28%` |

These names must be stored in the `store_tally_config` table and fetched at sync time.

---

## Credit Note (Return) voucher

For returns, use `VCHTYPE="Credit Note"` and reverse the signs:
- Inventory quantities become negative
- The cash/UPI ledger becomes a credit (positive in Tally convention)
- Attach original invoice number in `<NARRATION>`

---

## Sync endpoint pattern

```python
@router.post("/tally/sync/{sale_id}")
async def sync_to_tally(
    sale_id: UUID,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate Tally XML for a sale and either:
    - Return it as a downloadable .xml file (manual import mode)
    - POST it to Tally's local HTTP server if configured (auto-sync mode)
    """
    sale = await get_sale_with_items(db, sale_id, store_ctx["store_id"])
    xml = generate_sales_voucher(sale)

    tally_config = await get_tally_config(db, store_ctx["store_id"])

    if tally_config and tally_config.auto_sync_url:
        # Auto-sync to Tally's local HTTP server (port 9000 by default)
        response = await http_post(tally_config.auto_sync_url, xml)
        return {"status": "synced", "tally_response": response}
    else:
        # Return as downloadable XML
        return Response(
            content=xml,
            media_type="application/xml",
            headers={"Content-Disposition": f"attachment; filename={sale.invoice_no}.xml"}
        )
```

---

## Checklist before committing

- [ ] All money values converted via `paise_to_rupees()` — never raw floats
- [ ] Voucher total validated to be zero-sum before generating XML
- [ ] GST rates validated against `{0, 5, 12, 18, 28}`
- [ ] Tally ledger names are configurable per store — not hardcoded
- [ ] `VOUCHERNUMBER` uses PrimeSetu `invoice_no` — no duplicates
- [ ] Credit Note returns use `VCHTYPE="Credit Note"` with negative quantities
- [ ] Test case: generate voucher → import to local Tally → verify no errors
