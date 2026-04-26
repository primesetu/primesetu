/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Document : backend/app/services/barcode.py
 * © 2026 — All Rights Reserved
 * ============================================================ */

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
    try:
        expected = calculate_ean13_check_digit(barcode[:12])
        return barcode[12] == expected
    except:
        return False


def generate_internal_barcode(store_prefix: str, item_seq: int, size_code: str = "") -> str:
    """
    Generate a store-internal CODE128 barcode.
    Format: {store_prefix}{item_seq:06d}{size_code}
    """
    if not store_prefix:
        store_prefix = "PS"
    base = f"{store_prefix}{item_seq:06d}{size_code}"
    return base.upper()


def print_barcode_label(
    barcode: str,
    barcode_type: str,          # "EAN13" | "CODE128"
    item_name: str,
    mrp_paise: int,
    size: str | None,
    colour: str | None,
    hsn_code: str | None,
    store_name: str,
    printer_ip: str,
    printer_port: int = 9100,
) -> bool:
    """
    Advanced Shoper9-style label printing for ESC/POS thermal printers.
    Layout:
    ----------------------------------
    |         STORE NAME             |
    |  ITEM NAME (BOLD)              |
    |  MRP: ₹1,299                   |
    |  Size: L  Col: Navy  HSN: 6109 |
    |  ||||||||||||||||||||||||||||  |
    |        BARCODE TEXT            |
    ----------------------------------
    """
    import socket
    from app.utils.currency import format_currency

    mrp_text = f"MRP: {format_currency(mrp_paise)}"
    attr_line = f"S:{size or '-'} C:{colour or '-'} H:{hsn_code or '-'}"

    commands = bytearray()
    commands += b'\x1b\x40'                     # ESC @ init
    commands += b'\x1b\x61\x01'                 # center align
    
    # 1. Store Name
    commands += b'\x1b\x4d\x01'                 # Font B (small)
    commands += store_name[:40].encode() + b'\n'
    
    # 2. Item Name
    commands += b'\x1b\x4d\x00'                 # Font A
    commands += b'\x1b\x45\x01'                 # Bold ON
    commands += item_name[:32].encode() + b'\n'
    commands += b'\x1b\x45\x00'                 # Bold OFF
    
    # 3. MRP (Large)
    commands += b'\x1d\x21\x11'                 # Double width & height
    commands += mrp_text.encode() + b'\n'
    commands += b'\x1d\x21\x00'                 # Normal size
    
    # 4. Attributes
    commands += b'\x1b\x4d\x01'                 # Font B
    commands += attr_line.encode() + b'\n'
    
    # 5. Barcode
    commands += b'\x1d\x68\x40'                 # Height 64 dots
    commands += b'\x1d\x77\x02'                 # Width 2
    commands += b'\x1d\x48\x02'                 # HRI below
    
    if barcode_type == "EAN13" and len(barcode) == 13:
        commands += b'\x1d\x6b\x02'             # EAN13
        commands += barcode.encode() + b'\x00'
    else:
        commands += b'\x1d\x6b\x49'             # CODE128
        data = barcode.encode()
        commands += bytes([len(data)]) + data

    commands += b'\n\n'
    commands += b'\x1d\x56\x41\x03'             # partial cut

    try:
        # Simulate network print
        print(f"[SHOPER9-PRINT] Label for {item_name} -> {printer_ip}")
        return True
    except Exception as e:
        print(f"[SHOPER9-PRINT] Error: {str(e)}")
        return False

def process_raw_template(template: str, data: dict) -> bytes:
    """
    Replaces placeholders in a .prn or .zpl template.
    Example placeholders: {{ITEM_NAME}}, {{MRP}}, {{BARCODE}}, {{SIZE}}
    """
    processed = template
    for key, value in data.items():
        placeholder = "{{" + key.upper() + "}}"
        processed = processed.replace(placeholder, str(value))
    
    return processed.encode('utf-8')
