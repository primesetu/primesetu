/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
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
    expected = calculate_ean13_check_digit(barcode[:12])
    return barcode[12] == expected
