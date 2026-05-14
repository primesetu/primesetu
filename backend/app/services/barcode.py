# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/services/barcode.py
# Sovereign Print Engine v2.0
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================
#
# Architecture: Three-Layer Print Stack
#   Layer 1: EAN-13 / Code128 math utilities
#   Layer 2: ZPL II generator from JSON layout nodes
#   Layer 3: Raw TCP socket dispatcher (port 9100)
#            Bypasses browser print dialog entirely.
# ============================================================

import re
import socket
import struct
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger("smriti.barcode")


# ─────────────────────────────────────────────────────────────
# LAYER 1: Barcode Math Utilities
# ─────────────────────────────────────────────────────────────

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
    except Exception:
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


# ─────────────────────────────────────────────────────────────
# LAYER 2: ZPL II Generator (JSON Layout → ZPL String)
# ─────────────────────────────────────────────────────────────

# ZPL Conversion constants
# 1 mm = ~5 ZPL dots at 203 DPI (standard thermal)
# 1 mm = ~8 ZPL dots at 300 DPI (high-res thermal)
MM_TO_DOTS_203DPI = 5
MM_TO_DOTS_300DPI = 8

def _mm_to_dots(mm: float, dpi: int = 203) -> int:
    """Convert millimeters to ZPL dot units."""
    factor = MM_TO_DOTS_300DPI if dpi == 300 else MM_TO_DOTS_203DPI
    return int(mm * factor)

def _zpl_barcode_type(symbology: str) -> str:
    """Map symbology name to ZPL barcode type command."""
    mapping = {
        "code128": "^BCN",   # Code 128 Normal orientation
        "code39":  "^B3N",   # Code 39 Normal
        "ean13":   "^BEN",   # EAN-13
        "upca":    "^BUN",   # UPC-A
        "qr":      "^BQN",   # QR Code (needs different syntax)
    }
    return mapping.get(symbology.lower(), "^BCN")


def build_zpl_from_layout(
    layout_json: List[Dict[str, Any]],
    item_data: Dict[str, Any],
    width_mm: float = 38.0,
    height_mm: float = 25.0,
    copies: int = 1,
    dpi: int = 203
) -> str:
    """
    Translate a Barcode Designer JSON layout into a complete ZPL II string.

    Args:
        layout_json: List of node dicts from BarcodeTemplate.layout_json
        item_data:   Dict of item fields to bind (sku, name, mrp, etc.)
        width_mm:    Label width in mm
        height_mm:   Label height in mm
        copies:      Number of copies to print
        dpi:         Printer DPI (203 or 300)

    Returns:
        ZPL II string ready to send to printer via raw TCP.
    """
    width_dots = _mm_to_dots(width_mm, dpi)
    height_dots = _mm_to_dots(height_mm, dpi)

    lines = []

    # ZPL Header
    lines.append("^XA")                           # Start of label
    lines.append(f"^LL{height_dots}")             # Label length
    lines.append(f"^PW{width_dots}")              # Print width
    lines.append("^LH0,0")                        # Label home (origin)

    for node in layout_json:
        node_type = node.get("type", "")
        x_dots = _mm_to_dots(node.get("x", 0), dpi)
        y_dots = _mm_to_dots(node.get("y", 0), dpi)

        if node_type == "text":
            # Resolve value: dataField binding or static content
            if node.get("dataField"):
                value = str(item_data.get(node["dataField"], ""))
            else:
                value = node.get("content", "")

            font_size = int(node.get("fontSize", 10))
            # ZPL font height/width mapping (approximate for 203dpi)
            font_h = max(10, font_size * 2)
            font_w = max(8, font_size * 2)

            lines.append(f"^FO{x_dots},{y_dots}")         # Field origin
            lines.append(f"^A0N,{font_h},{font_w}")        # Font A, normal, height, width
            lines.append(f"^FD{value}^FS")                 # Field data

        elif node_type == "barcode":
            # Resolve barcode value
            if node.get("dataField"):
                barcode_val = str(item_data.get(node["dataField"], ""))
            else:
                barcode_val = node.get("content", "")

            if not barcode_val:
                continue  # Skip empty barcodes

            symbology = node.get("symbology", "code128")
            zpl_bc = _zpl_barcode_type(symbology)

            bar_height = _mm_to_dots(8.0, dpi)  # Default 8mm bar height
            bar_width = 2  # Module width multiplier

            lines.append(f"^FO{x_dots},{y_dots}")
            lines.append(f"^BY{bar_width}")               # Bar width
            lines.append(f"{zpl_bc},{bar_height},Y,N")    # Barcode type, height, print-text=Y, check=N
            lines.append(f"^FD{barcode_val}^FS")

    lines.append(f"^PQ{copies},0,1,Y")             # Print quantity
    lines.append("^XZ")  # End of label

    return "\n".join(lines)


def build_zpl_simple(
    barcode: str,
    barcode_type: str,
    item_name: str,
    mrp_rupees: float,
    size: str,
    colour: str,
    hsn_code: str,
    store_name: str,
    width_mm: float = 38.0,
    height_mm: float = 25.0,
    copies: int = 1,
    dpi: int = 203,
) -> str:
    """
    Fast-path ZPL builder for standard 38x25mm retail labels.
    Used by the BarcodeStudio print button when no custom template is defined.

    Label layout:
    ┌──────────────────────┐
    │  STORE NAME          │ ← 8pt
    │  Item Name Truncated │ ← 10pt Bold
    │  MRP ₹1,299          │ ← 14pt
    │  S:L  C:Navy  H:6109 │ ← 7pt
    │  ||||||||||||||||    │ ← CODE128 barcode
    │  1001452             │ ← HRI text
    └──────────────────────┘
    """
    dw = _mm_to_dots(width_mm, dpi)
    dh = _mm_to_dots(height_mm, dpi)

    mrp_text = f"MRP Rs.{mrp_rupees:.0f}"
    attr_text = f"S:{size or '-'}  C:{colour or '-'}  H:{hsn_code or '-'}"
    name_trunc = (item_name or "")[:30]
    store_trunc = (store_name or "")[:28]

    zpl = f"""^XA
^LL{dh}
^PW{dw}
^LH0,0

^FO5,3^A0N,10,8^FD{store_trunc}^FS
^FO5,14^A0N,12,10^FD{name_trunc}^FS
^FO5,28^A0N,16,13^FD{mrp_text}^FS
^FO5,47^A0N,9,7^FD{attr_text}^FS

^FO5,58
^BY1,2.0
^BCN,35,Y,N
^FD{barcode}^FS

^PQ{copies}
^XZ"""

    return zpl


# ─────────────────────────────────────────────────────────────
# LAYER 3: Raw TCP Socket Dispatcher
# ─────────────────────────────────────────────────────────────

def send_zpl_to_printer(
    zpl: str,
    printer_ip: str,
    printer_port: int = 9100,
    timeout_sec: float = 5.0,
) -> bool:
    """
    Send a raw ZPL string directly to a thermal printer.
    
    If printer_ip is an IP address (e.g. "192.168.1.100"), uses raw TCP Port 9100.
    If printer_ip is a Windows USB Printer Name (e.g. "Zebra_USB" or "\\\\localhost\\SharedZebra"), 
    uses Windows Print Spooler via win32print.

    This BYPASSES the browser print dialog entirely.
    Tested with: Zebra GK420d, ZD220, TSC TDP-225, TVS LP45 Neo.

    Args:
        zpl:          Complete ZPL II label string
        printer_ip:   LAN IP or Windows Printer Name
        printer_port: Raw print port, default 9100 (for TCP)
        timeout_sec:  Socket timeout in seconds (for TCP)

    Returns:
        True if sent successfully, False on any error.
    """
    payload = zpl.encode("utf-8")

    # Check if it's an IP address or localhost
    is_ip_or_localhost = bool(re.match(r'^(\d{1,3}\.){3}\d{1,3}$', printer_ip)) or printer_ip == "localhost"

    if is_ip_or_localhost:
        # --- TCP Network Print Dispatcher ---
        try:
            with socket.create_connection((printer_ip, printer_port), timeout=timeout_sec) as sock:
                sock.sendall(payload)
                logger.info(f"[SMRITI-PRINT] Sent {len(payload)} bytes to TCP {printer_ip}:{printer_port}")
                return True
        except socket.timeout:
            logger.error(f"[SMRITI-PRINT] Timeout connecting to {printer_ip}:{printer_port}")
            return False
        except ConnectionRefusedError:
            logger.error(f"[SMRITI-PRINT] Connection refused at {printer_ip}:{printer_port} — is printer online?")
            return False
        except Exception as e:
            logger.error(f"[SMRITI-PRINT] TCP Print Error: {e}")
            return False
    else:
        # --- Windows USB Local Print Dispatcher ---
        try:
            import win32print
        except ImportError:
            logger.error("[SMRITI-PRINT] pywin32 library not installed. Cannot print to USB on Windows.")
            return False

        try:
            hPrinter = win32print.OpenPrinter(printer_ip)
            try:
                # Start raw spooler job
                job = win32print.StartDocPrinter(hPrinter, 1, ("Smriti Barcode Job", None, "RAW"))
                win32print.StartPagePrinter(hPrinter)
                win32print.WritePrinter(hPrinter, payload)
                win32print.EndPagePrinter(hPrinter)
                win32print.EndDocPrinter(hPrinter)
                logger.info(f"[SMRITI-PRINT] Successfully spooled {len(payload)} bytes to USB Printer '{printer_ip}'")
                return True
            finally:
                win32print.ClosePrinter(hPrinter)
        except Exception as e:
            logger.error(f"[SMRITI-PRINT] USB Print Error to '{printer_ip}': {e}")
            return False


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
    copies: int = 1,
    width_mm: float = 38.0,
    height_mm: float = 25.0,
) -> bool:
    """
    High-level print function called by barcode router.
    Converts item data → ZPL → sends over TCP to printer.

    mrp_paise is stored in paise (1/100 of rupee).
    """
    mrp_rupees = mrp_paise / 100.0

    zpl = build_zpl_simple(
        barcode=barcode,
        barcode_type=barcode_type,
        item_name=item_name,
        mrp_rupees=mrp_rupees,
        size=size or "",
        colour=colour or "",
        hsn_code=hsn_code or "",
        store_name=store_name,
        width_mm=width_mm,
        height_mm=height_mm,
        copies=copies,
    )

    return send_zpl_to_printer(zpl, printer_ip, printer_port)


def print_from_template(
    layout_json: List[Dict[str, Any]],
    item_data: Dict[str, Any],
    printer_ip: str,
    width_mm: float = 38.0,
    height_mm: float = 25.0,
    copies: int = 1,
    printer_port: int = 9100,
    dpi: int = 203,
) -> bool:
    """
    Print using a Barcode Designer custom template.
    Called when user has saved a drag-and-drop layout.
    """
    zpl = build_zpl_from_layout(
        layout_json=layout_json,
        item_data=item_data,
        width_mm=width_mm,
        height_mm=height_mm,
        copies=copies,
        dpi=dpi,
    )
    return send_zpl_to_printer(zpl, printer_ip, printer_port)


def process_raw_template(template: str, data: dict) -> bytes:
    """
    Replaces placeholders in a .prn or .zpl template string.
    Supported placeholders: {{ITEM_NAME}}, {{MRP}}, {{BARCODE}}, {{SIZE}}, {{COLOUR}}, {{HSN}}, {{STORE}}
    Case-insensitive matching (e.g. {{item_name}} works).
    """
    logger.info(f"[SMRITI-PRN] Processing raw template (Length: {len(template)})")
    processed = template
    
    # Case-insensitive replacement using regex with optional whitespace support
    for key, value in data.items():
        # Match {{KEY}}, {{ KEY }}, {{  key  }}, etc.
        pattern = re.compile(r"\{\{\s*" + re.escape(key) + r"\s*\}\}", re.IGNORECASE)
        
        # Count occurrences for debugging
        matches = len(pattern.findall(processed))
        if matches > 0:
            logger.debug(f"  - Replaced {matches} occurrences of {key} (including variations) with '{value}'")
            processed = pattern.sub(str(value), processed)
    
    logger.info(f"[SMRITI-PRN] Template processed successfully. Final size: {len(processed)} bytes.")
    return processed.encode("utf-8")
