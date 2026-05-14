import sys
import os
import logging

# Setup basic logging to see the debug output
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s')

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.services.barcode import process_raw_template

def test_prn_debug():
    sample_template = """
^XA
^FO50,50^A0N,30,30^FDStore: {{ store }}^FS
^FO50,100^A0N,40,40^FDItem: {{   item_name   }}^FS
^FO50,160^A0N,50,50^FDMRP: Rs.{{mrp}}^FS
^FO50,230^BY3^BCN,100,Y,N,N^FD{{  barcode }}^FS
^XZ
"""
    sample_data = {
        "ITEM_NAME": "Premium Cotton Shirt",
        "MRP": 1299.00,
        "BARCODE": "8901234567890",
        "SIZE": "XL",
        "COLOUR": "Royal Blue",
        "HSN": "6109",
        "STORE": "Smriti Flagship Store"
    }

    print("\n--- STARTING DEEP DEBUG OF PRN ENGINE ---")
    print(f"Original Template Length: {len(sample_template)}")
    
    result_bytes = process_raw_template(sample_template, sample_data)
    result_str = result_bytes.decode('utf-8')
    
    print("\n--- PROCESSED OUTPUT ---")
    print(result_str)
    print("--- END OUTPUT ---\n")
    
    # Verification
    if "Smriti Flagship Store" in result_str and "1299.0" in result_str:
        print("SUCCESS: Placeholders replaced correctly.")
    else:
        print("FAILURE: Missing replacements.")

if __name__ == "__main__":
    test_prn_debug()
