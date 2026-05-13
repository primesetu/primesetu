import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Fix Store.id
    content = re.sub(
        r'id: Mapped\[uuid\.UUID\] = mapped_column\(UUID\(as_uuid=True\), primary_key=True, default=uuid\.uuid4\)',
        r'id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))',
        content
    )

    # 2. Fix store_id mappings
    # store_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("stores.id")...)
    content = re.sub(
        r'store_id: Mapped\[uuid\.UUID\] = mapped_column\(UUID\(as_uuid=True\), ForeignKey\("stores\.id"\)([^)]*)\)',
        r'store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id")\1)',
        content
    )
    
    # store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id")...)
    content = re.sub(
        r'store_id: Mapped\[uuid\.UUID\] = mapped_column\(ForeignKey\("stores\.id"\)([^)]*)\)',
        r'store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id")\1)',
        content
    )

    # store_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("stores.id")...)
    content = re.sub(
        r'store_id: Mapped\[Optional\[uuid\.UUID\]\] = mapped_column\(ForeignKey\("stores\.id"\)([^)]*)\)',
        r'store_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("stores.id")\1)',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Fixed {filepath}")

fix_file('app/models/base.py')
fix_file('app/models/purchase.py')
