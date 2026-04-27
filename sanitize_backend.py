import os

def clean_text(text):
    # Map common decorative characters to ASCII
    mapping = {
        '\u2014': '-', # em-dash
        '\u2013': '-', # en-dash
        '\u00a9': '(c)', # copyright
        '\u00b7': '.', # middle dot
        '\u2022': '*', # bullet
        '\u2122': '(tm)', # trademark
    }
    for char, replacement in mapping.items():
        text = text.replace(char, replacement)
    
    # Force everything else to ASCII
    return "".join([c if ord(c) < 128 else '.' for c in text])

def main():
    print("Starting Global PrimeSetu ASCII Sanitization...")
    backend_dir = os.path.join(os.getcwd(), 'backend', 'app')
    count = 0
    
    for root, _, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='replace') as f:
                        original_content = f.read()
                    
                    cleaned_content = clean_text(original_content)
                    
                    with open(path, 'w', encoding='ascii', newline='\n') as f:
                        f.write(cleaned_content)
                    
                    count += 1
                except Exception as e:
                    print(f"Error cleaning {path}: {e}")
                    
    print(f"Successfully sanitized {count} files. Phase 2 stability restored.")

if __name__ == "__main__":
    main()
