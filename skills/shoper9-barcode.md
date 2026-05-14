/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-barcode
 * ============================================================ */

# SKILL: Shoper9 Barcode / GTIN Studio — Full Parity

Read this file completely before writing any barcode code.

---

## What Shoper9 Barcode module does (parity target)

| Shoper9 Feature | PrimeSetu | Phase |
|----------------|-----------|-------|
| EAN-13 barcode per SKU | ✅ Required | GS1-compliant check digit |
| Internal barcode (non-GS1) | ✅ Required | Store-defined prefix |
| Multiple barcodes per item | ✅ Required | E.g. brand barcode + internal |
| Barcode → item lookup at POS | ✅ Required | < 50ms, called on every scan |
| Barcode printing (ESC/POS) | ✅ Required | 80mm thermal, CODE128 or EAN-13 |
| GTIN generation (GS1 EAN-13) | ✅ Required | Phase 7 GTINStudio module |
| Barcode audit via PDT / CSV | ✅ Required | Bulk import/export |
| Size-colour-specific barcodes | ✅ Required | One barcode per size+colour variant |

---

## DB Schema

```sql
/* ============================================================
 * PrimeSetu — Barcode Schema
 * ============================================================ */

CREATE TABLE IF NOT EXISTS public.item_barcodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    barcode         TEXT NOT NULL,
    barcode_type    TEXT NOT NULL CHECK (barcode_type IN ('EAN13','CODE128','QR','INTERNAL')),
    size            TEXT,           -- NULL = applies to all sizes of this item
    colour          TEXT,           -- NULL = applies to all colours of this item
    is_primary      BOOLEAN NOT NULL DEFAULT false,  -- one primary per item
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, barcode)      -- barcode must be globally unique per store
);

ALTER TABLE public.item_barcodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.item_barcodes
    FOR ALL USING (
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );

-- CRITICAL: this index is the hot path for every POS scan
CREATE UNIQUE INDEX idx_barcodes_store_barcode
    ON public.item_barcodes(store_id, barcode);

CREATE INDEX idx_barcodes_item
    ON public.item_barcodes(item_id, store_id);
```

---

## EAN-13 check digit calculation

GS1 EAN-13 is 12 digits + 1 check digit. The check digit is mandatory.
Every generated barcode MUST be validated before saving.

```python
# backend/app/services/barcode.py

def calculate_ean13_check_digit(digits_12: str) -> str:
    """
    Calculate EAN-13 check digit from first 12 digits.
    GS1 standard: alternating weights 1 and 3, modulo 10.
    """
    if len(digits_12) != 12 or not digits_12.isdigit():
        raise ValueError(f"EAN-13 base must be exactly 12 digits, got: {digits_12!r}")

    total = sum(
        int(d) * (3 if i % 2 else 1)
        for i, d in enumerate(digits_12)
    )
    check = (10 - (total % 10)) % 10
    return str(check)


def generate_ean13(digits_12: str) -> str:
    """Return full 13-digit EAN-13 barcode string."""
    return digits_12 + calculate_ean13_check_digit(digits_12)


def validate_ean13(barcode: str) -> bool:
    """Validate a complete 13-digit EAN-13 barcode."""
    if len(barcode) != 13 or not barcode.isdigit():
        return False
    expected = calculate_ean13_check_digit(barcode[:12])
    return barcode[12] == expected


def generate_internal_barcode(store_prefix: str, item_seq: int, size_code: str = "") -> str:
    """
    Generate a store-internal CODE128 barcode.
    Format: {store_prefix}{item_seq:06d}{size_code}
    Example: PS000042L (PS = PrimeSetu prefix, 000042 = item seq, L = size)
    """
    if not store_prefix:
        store_prefix = "PS"
    base = f"{store_prefix}{item_seq:06d}{size_code}"
    return base.upper()
```

---

## GTIN Studio — bulk generation (Phase 7)

The implementation plan specifies: "Implement GTIN generation and validation logic" and "GTINStudio module for barcode management."

```python
# backend/app/routers/barcodes.py

@router.post("/barcodes/generate-ean13")
async def generate_ean13_for_item(
    item_id: UUID,
    gs1_company_prefix: str,        # 7-9 digit GS1 company prefix
    size: str | None = None,
    colour: str | None = None,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a GS1-compliant EAN-13 for an item/variant.

    GS1 EAN-13 structure:
    [Company prefix: 7-9 digits] + [Item ref: 3-5 digits] + [Check digit: 1 digit]
    Total must be exactly 13 digits.

    Uniqueness: check against item_barcodes before saving.
    If barcode already exists for this item+size+colour, return existing.
    """
    # Get next item reference number for this company prefix
    next_ref = await get_next_item_ref(db, store_ctx["store_id"], gs1_company_prefix)

    # Pad to 12 digits total
    digits_12 = (gs1_company_prefix + str(next_ref).zfill(13 - len(gs1_company_prefix) - 1))[:12]
    barcode = generate_ean13(digits_12)

    # Verify uniqueness across the store
    existing = await check_barcode_exists(db, store_ctx["store_id"], barcode)
    if existing:
        raise HTTPException(409, f"Barcode {barcode} already assigned to another item")

    new_barcode = ItemBarcode(
        store_id=store_ctx["store_id"],
        item_id=item_id,
        barcode=barcode,
        barcode_type="EAN13",
        size=size,
        colour=colour,
        is_primary=True,
    )
    db.add(new_barcode)
    await db.commit()
    return {"barcode": barcode, "valid": True}


@router.get("/barcodes/scan/{barcode}")
async def scan_barcode(
    barcode: str,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    HOT PATH — called on every barcode scan at POS terminal.
    Must return in < 50ms.

    Returns: item details + resolved size + colour + current stock qty.
    """
    result = await db.execute(
        text("""
            SELECT
                ib.barcode, ib.size, ib.colour,
                i.id AS item_id, i.item_code, i.item_name,
                i.mrp_paise, i.gst_rate, i.hsn_code,
                COALESCE(s.qty_on_hand, 0) AS qty_on_hand
            FROM public.item_barcodes ib
            JOIN public.items i ON i.id = ib.item_id
            LEFT JOIN public.item_stock s
                ON s.item_id = ib.item_id
                AND s.store_id = ib.store_id
                AND (ib.size IS NULL OR s.size = ib.size)
                AND (ib.colour IS NULL OR s.colour = ib.colour)
            WHERE ib.store_id = :store_id
              AND ib.barcode = :barcode
              AND ib.is_active = true
            LIMIT 1
        """),
        {"store_id": store_ctx["store_id"], "barcode": barcode}
    )
    item = result.mappings().first()
    if not item:
        raise HTTPException(404, f"Barcode not found: {barcode}")
    return dict(item)


@router.post("/barcodes/bulk-import")
async def bulk_import_barcodes(
    file: UploadFile,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    PDT / CSV bulk import.
    Expected CSV columns: item_code, barcode, barcode_type, size, colour
    Validates EAN-13 check digits before inserting.
    Skips duplicates (logs warning, does not fail).
    Returns: {imported: N, skipped: N, errors: [...]}
    """
```

---

## Barcode printing — ESC/POS (80mm thermal)

```python
# backend/app/services/escpos_print.py

def print_barcode_label(
    barcode: str,
    barcode_type: str,          # "EAN13" | "CODE128"
    item_name: str,
    mrp_paise: int,
    size: str | None,
    printer_ip: str,
    printer_port: int = 9100,
) -> None:
    """
    Print a barcode label to an ESC/POS thermal printer via TCP.
    Label format (80mm):
        ┌──────────────────────────────────┐
        │  ITEM NAME (max 40 chars)        │
        │  Size: L  Colour: Navy           │
        │  ||||||||||||||||||||||||||||    │
        │  4 7 1 2 3 4 5 6 7 8 9 0 1     │
        │  MRP: ₹1,299                    │
        └──────────────────────────────────┘

    ESC/POS commands used:
    - ESC @ : Initialize printer
    - GS k  : Print barcode (EAN-13 = m=2, CODE128 = m=73)
    - ESC a : Alignment (center = 1)
    - ESC E : Bold on/off
    - GS V  : Paper cut
    """
    import socket

    mrp_rupees = f"₹{mrp_paise // 100:,}"
    size_line = f"Size: {size}" if size else ""

    commands = bytearray()
    commands += b'\x1b\x40'                     # ESC @ init
    commands += b'\x1b\x61\x01'                 # center align
    commands += b'\x1b\x45\x01'                 # bold on
    commands += item_name[:40].encode() + b'\n'
    commands += b'\x1b\x45\x00'                 # bold off
    if size_line:
        commands += size_line.encode() + b'\n'

    if barcode_type == "EAN13" and len(barcode) == 13:
        commands += b'\x1d\x48\x02'             # HRI below barcode
        commands += b'\x1d\x68\x50'             # barcode height 80 dots
        commands += b'\x1d\x6b\x02'             # EAN-13 barcode
        commands += barcode.encode() + b'\x00'
    elif barcode_type == "CODE128":
        commands += b'\x1d\x6b\x49'             # CODE128
        data = barcode.encode()
        commands += bytes([len(data)]) + data

    commands += b'\n'
    commands += mrp_rupees.encode() + b'\n'
    commands += b'\x1d\x56\x41\x03'             # partial cut

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(3)
        s.connect((printer_ip, printer_port))
        s.sendall(commands)


@router.post("/barcodes/print")
async def print_barcode(
    barcode: str,
    copies: int = Query(default=1, ge=1, le=100),
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """Print barcode label to store's configured ESC/POS printer."""
    item = await get_item_by_barcode(db, store_ctx["store_id"], barcode)
    printer = await get_store_printer_config(db, store_ctx["store_id"])

    for _ in range(copies):
        print_barcode_label(
            barcode=barcode,
            barcode_type=item.barcode_type,
            item_name=item.item_name,
            mrp_paise=item.mrp_paise,
            size=item.size,
            printer_ip=printer.ip_address,
        )
    return {"printed": copies, "barcode": barcode}
```

---

## Frontend — GTINStudio page structure

```
frontend/src/pages/GTINStudio/
├── index.tsx                  ← barcode browser: search by barcode or item
├── BarcodeGenerator.tsx       ← generate EAN-13 / internal barcodes per item
├── BarcodePrintQueue.tsx      ← select items → print batch labels
├── BarcodeAudit.tsx           ← CSV upload for PDT bulk import
├── BarcodeValidator.tsx       ← paste/scan barcode → validate check digit
└── hooks/
    ├── useBarcodes.ts
    ├── useBarcodeGenerate.ts
    └── useBarcodePrint.ts
```

**Hotkeys on GTINStudio page:**

| Key | Action |
|-----|--------|
| F3 | Focus barcode scan/search input |
| F4 | Generate new barcode for selected item |
| F6 | Open print queue |
| Ctrl+P | Print selected barcodes |

---

## POS scanner integration

The billing terminal must handle barcode scanner input seamlessly:

```typescript
// frontend/src/pages/Billing/components/BarcodeScanner.tsx

/**
 * Barcode scanners send keystrokes ending in Enter.
 * Typical scan speed: 40-100 chars in < 100ms.
 * We detect scans by measuring keystroke velocity.
 */

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const SCAN_THRESHOLD_MS = 50  // keystrokes faster than this = scanner, not keyboard

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      const timeSinceLast = now - lastKeyTimeRef.current
      lastKeyTimeRef.current = now

      if (e.key === 'Enter' && bufferRef.current.length >= 6) {
        onScan(bufferRef.current)
        bufferRef.current = ''
        e.preventDefault()
        return
      }

      // If keystrokes are very fast → scanner input, accumulate
      if (timeSinceLast < SCAN_THRESHOLD_MS || bufferRef.current.length > 0) {
        if (e.key.length === 1) {
          bufferRef.current += e.key
        }
      } else {
        // Slow keystrokes → normal keyboard, clear buffer
        bufferRef.current = ''
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onScan])
}

// Usage in billing terminal:
useBarcodeScanner(async (barcode) => {
  const item = await apiClient.get(`/barcodes/scan/${barcode}`)
  addToCart(item)   // resolves size+colour automatically from barcode
})
```

---

## CSV format for PDT bulk import

```
item_code,barcode,barcode_type,size,colour
IT0042,4711234567890,EAN13,L,Navy Blue
IT0042,4711234567906,EAN13,XL,Navy Blue
IT0042,PS000042S,CODE128,S,Black
IT0043,4719876543210,EAN13,,
```

Rules:
- `barcode_type`: EAN13 | CODE128 | QR | INTERNAL
- `size` and `colour`: optional (blank = applies to all variants)
- EAN-13 barcodes: validate check digit on import, reject invalid
- Duplicate barcodes: skip with warning, do not fail the whole import

---

## Shoper9 parity checklist

- [ ] EAN-13 check digit calculated correctly (GS1 standard)
- [ ] Barcode uniqueness enforced per store (UNIQUE index)
- [ ] Multiple barcodes per item supported (brand + internal)
- [ ] Size+colour-specific barcodes resolve correct stock entry
- [ ] POS scan lookup < 50ms (UNIQUE index on barcode column)
- [ ] Scanner input detection (velocity-based keystroke detection)
- [ ] Internal barcode generation (store prefix + item seq + size code)
- [ ] ESC/POS label printing: EAN-13 and CODE128 on 80mm thermal
- [ ] Batch label printing (print queue with copy count)
- [ ] PDT CSV import: validates EAN-13 check digits, skips duplicates
- [ ] GTINStudio page with F3/F4/F6/Ctrl+P hotkeys
- [ ] `validate_ean13()` unit tested with known-good and known-bad barcodes
- [ ] RLS active on item_barcodes
