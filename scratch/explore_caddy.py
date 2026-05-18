import os

def explore():
    target = "C:\\SmritiOS"
    print(f"=== Searching Caddyfile / configs in {target} ===")
    
    # 1. Print files in bin
    bin_dir = os.path.join(target, "bin")
    if os.path.exists(bin_dir):
        print("\n--- Files in bin ---")
        for f in os.listdir(bin_dir):
            print(f"- {f}")
            
    # 2. Recursive search
    print("\n--- Recursive search for Caddyfile or config files ---")
    found = False
    for root, dirs, files in os.walk(target):
        for file in files:
            if "caddy" in file.lower() or "nginx" in file.lower() or file.endswith(".conf"):
                print(f"Found: {os.path.join(root, file)}")
                found = True
    if not found:
        print("No matching configuration files found.")

if __name__ == "__main__":
    explore()
