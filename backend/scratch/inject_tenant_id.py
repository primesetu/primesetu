import re
import os

def inject_tenant_id(filepath):
    print(f"Injecting tenant_id into {filepath}...")
    with open(filepath, 'r') as f:
        content = f.read()

    if 'tenant_id: Mapped[str]' in content:
        print(f"  [SKIP] tenant_id already present in {filepath}")
        return

    # Pattern to find the start of the class body after __table_args__
    pattern = r"(__table_args__ = \{'schema': S9_SCHEMA, 'extend_existing': True\})"
    replacement = r"\1\n    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)"
    
    new_content = re.sub(pattern, replacement, content)
    
    # Also check sovereign.py which might have different pattern
    if 'sovereign.py' in filepath:
        # Pattern for sovereign models (no schema arg usually)
        pattern = r"(class Smriti[a-zA-Z]+\(Base\):[\s\n]+(?:\"\"\"[^\"]+\"\"\"[\s\n]+)?)"
        new_content = re.sub(pattern, r"\1    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)\n", new_content)

    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"  [OK] Injected tenant_id into {filepath}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    inject_tenant_id(os.path.join(base_dir, 'app', 'models', 'legacy_s9.py'))
    inject_tenant_id(os.path.join(base_dir, 'app', 'models', 'sovereign.py'))
