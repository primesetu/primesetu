import re

with open('app/models/purchase.py', 'r') as f:
    content = f.read()

content = re.sub(
    r'id: Mapped\[str\] = mapped_column\(String, primary_key=True, default=lambda: str\(uuid\.uuid4\(\)\)\)',
    r'id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)',
    content
)

with open('app/models/purchase.py', 'w') as f:
    f.write(content)

print("Reverted PurchaseOrder, PurchaseOrderItem, GRN, GRNItem ids back to UUID.")
