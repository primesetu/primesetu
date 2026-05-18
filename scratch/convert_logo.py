from PIL import Image

bmp_path = r"C:\Users\netma\.gemini\antigravity\brain\9b9ac949-ed9e-4b9f-a8df-3849d1721189\wizard_banner.bmp"
png_path = r"C:\Users\netma\.gemini\antigravity\brain\9b9ac949-ed9e-4b9f-a8df-3849d1721189\wizard_banner.png"

try:
    print(f"Opening {bmp_path} ...")
    img = Image.open(bmp_path)
    img.save(png_path, "PNG")
    print(f"Successfully saved as PNG to {png_path}")
except Exception as e:
    print(f"Conversion failed: {e}")
