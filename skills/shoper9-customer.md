/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-customer
 * ============================================================ */

# SKILL: Shoper9 Customer Master — Full Parity

Read this file completely before writing any Customer module code.

---

## What Shoper9 Customer Master does (parity target)

| Shoper9 Feature | PrimeSetu | Notes |
|----------------|-----------|-------|
| Customer Code (unique) | ✅ Required | Auto-generate: C + 4-digit seq, e.g. C0042 |
| Name, Phone, Address | ✅ Required | Phone is primary lookup key at POS |
| GSTIN (B2B customers) | ✅ Required | Validate 15-char format |
| Credit limit + credit days | ✅ Required | Stored as paise |
| Price group assignment | ✅ Required | FK to customer_price_groups |
| Loyalty points balance | ✅ Required | Earned on purchase, redeemed at billing |
| Account statement | ✅ Required | Outstanding / payment history |
| Walk-in customer (no record) | ✅ Required | Special partner_id = NULL in sales |
| Customer search at POS by phone | ✅ Required | Must work in < 100ms |
| State code for interstate GST | ✅ Required | 2-digit state code for IGST routing |

---

## DB Schema

The `partners` table (from `shoper9-catalog.md`) covers core customer fields.
These additional tables complete the customer module:

```sql
/* ============================================================
 * PrimeSetu — Customer Module Additional Tables
 * ============================================================ */

-- Customer account ledger (credit/payment tracking)
CREATE TABLE IF NOT EXISTS public.customer_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_id      UUID NOT NULL REFERENCES public.partners(id),
    txn_type        TEXT NOT NULL CHECK (txn_type IN ('invoice','payment','credit_note','adjustment')),
    txn_ref         TEXT NOT NULL,          -- invoice_no or payment ref
    amount_paise    INTEGER NOT NULL,       -- positive = charge, negative = payment/CN
    balance_paise   INTEGER NOT NULL,       -- running balance after this entry
    txn_date        DATE NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loyalty points ledger
CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_id      UUID NOT NULL REFERENCES public.partners(id),
    txn_type        TEXT NOT NULL CHECK (txn_type IN ('earn','redeem','expire','adjust')),
    points          INTEGER NOT NULL,       -- positive = earn, negative = redeem/expire
    balance         INTEGER NOT NULL,       -- running balance
    sale_id         UUID REFERENCES public.sales(id),
    txn_date        DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_ledger  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.customer_ledger
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.loyalty_ledger
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

CREATE INDEX idx_customer_ledger_partner ON public.customer_ledger(store_id, partner_id, txn_date DESC);
CREATE INDEX idx_loyalty_ledger_partner  ON public.loyalty_ledger(store_id, partner_id, txn_date DESC);
```

---

## Customer code auto-generation

Shoper9 uses sequential codes like C0001, C0042. PrimeSetu must do the same:

```python
# backend/app/routers/customer.py

async def generate_customer_code(db: AsyncSession, store_id: UUID) -> str:
    """
    Generate next sequential customer code for the store.
    Format: C + zero-padded 4-digit number. E.g. C0001, C0042, C1337.
    Thread-safe via DB-level locking.
    """
    result = await db.execute(
        text("""
            SELECT code FROM public.partners
            WHERE store_id = :store_id
              AND partner_type IN ('customer', 'both')
              AND code ~ '^C[0-9]{4}$'
            ORDER BY code DESC
            LIMIT 1
        """),
        {"store_id": store_id}
    )
    last = result.scalar_one_or_none()
    if last:
        next_num = int(last[1:]) + 1
    else:
        next_num = 1
    return f"C{next_num:04d}"
```

---

## POS customer lookup — the critical path

At billing terminal, cashier searches customer by phone number.
This must resolve in < 100ms. Pattern:

```python
@router.get("/customers/lookup")
async def lookup_customer_at_pos(
    phone: str = Query(min_length=6),
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Fast phone lookup for POS billing terminal.
    Returns: customer name, code, loyalty_points, price_group_id, outstanding_balance.
    Used when cashier types/scans a phone number during billing.
    """
    result = await db.execute(
        text("""
            SELECT
                p.id, p.code, p.name, p.phone,
                p.loyalty_points, p.price_group_id, p.credit_limit_paise,
                COALESCE(SUM(cl.amount_paise), 0) AS outstanding_paise
            FROM public.partners p
            LEFT JOIN public.customer_ledger cl
                ON cl.partner_id = p.id AND cl.store_id = :store_id
            WHERE p.store_id = :store_id
              AND p.phone = :phone
              AND p.partner_type IN ('customer','both')
              AND p.is_active = true
            GROUP BY p.id
            LIMIT 1
        """),
        {"store_id": store_ctx["store_id"], "phone": phone}
    )
    customer = result.mappings().first()
    if not customer:
        return {"found": False}
    return {"found": True, **dict(customer)}
```

**Frontend billing integration:**
```typescript
// In billing terminal: when phone input loses focus or Enter pressed
const { data } = useQuery({
  queryKey: ['customer-lookup', phone],
  queryFn: () => apiClient.get(`/customers/lookup?phone=${phone}`),
  enabled: phone.length >= 6,
  staleTime: 30_000,
})

// If found → populate customer panel, apply price group
// If not found → offer "Add New Customer" quick-form inline
```

---

## Loyalty points — earn and redeem rules

Rules must be configurable per store via `store_config` table:

```python
# Earning: default = 1 point per ₹100 spent (configurable)
def calculate_points_earned(total_paise: int, rate: float = 0.01) -> int:
    """rate = points per paise. Default 0.01 = 1pt per ₹100."""
    return int(total_paise * rate)

# Redemption: default = 1 point = ₹1 discount (configurable)
def calculate_redemption_value(points: int, value_per_point_paise: int = 100) -> int:
    """Returns discount in paise."""
    return points * value_per_point_paise

# Validation: cannot redeem more than available balance
# Validation: cannot redeem more than X% of invoice value (configurable, default 50%)
```

**Loyalty ledger write — always atomic with sale:**
```python
# In create_sale(), after committing the sale record:
if payload.loyalty_points_redeemed > 0:
    await write_loyalty_entry(db, partner_id, 'redeem', -payload.loyalty_points_redeemed, sale.id)

points_earned = calculate_points_earned(sale.total_paise, store_config.loyalty_rate)
await write_loyalty_entry(db, partner_id, 'earn', points_earned, sale.id)

# Also update partners.loyalty_points (denormalized for fast POS lookup)
await db.execute(
    text("UPDATE public.partners SET loyalty_points = loyalty_points + :delta WHERE id = :pid"),
    {"delta": points_earned - payload.loyalty_points_redeemed, "pid": partner_id}
)
```

---

## GSTIN validation (B2B customers)

```python
import re

GSTIN_PATTERN = re.compile(
    r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
)

def validate_gstin(gstin: str) -> bool:
    """Validate 15-character Indian GSTIN format."""
    return bool(GSTIN_PATTERN.match(gstin.upper()))

def extract_state_code(gstin: str) -> str:
    """First 2 digits of GSTIN = state code for GST routing."""
    return gstin[:2]
```

---

## Frontend — Customer page structure

```
frontend/src/pages/Customer/
├── index.tsx              ← customer list with search by name/phone/code
├── CustomerForm.tsx       ← create/edit (phone, GSTIN, price group, credit)
├── CustomerProfile.tsx    ← full profile: ledger + loyalty + purchase history
├── LoyaltyPanel.tsx       ← points balance, earn/redeem history
└── hooks/
    ├── useCustomers.ts
    ├── useCustomerLookup.ts   ← fast POS phone lookup
    └── useCustomerLedger.ts   ← account statement
```

**Hotkeys:**

| Key | Action |
|-----|--------|
| F4 | New customer |
| F3 | Search customers |
| Enter (phone field in billing) | Trigger customer lookup |

---

## Shoper9 parity checklist

- [ ] Auto-generate customer code in format C0001
- [ ] Phone number is primary POS lookup key (< 100ms)
- [ ] GSTIN validated with 15-char regex
- [ ] State code extracted from GSTIN for interstate GST routing
- [ ] Credit limit and credit days stored and enforced at billing
- [ ] Price group assignment (FK to customer_price_groups)
- [ ] Loyalty points: earn on purchase, redeem at billing, running ledger
- [ ] Loyalty rules (rate, max redemption %) configurable per store
- [ ] Customer account ledger: invoices + payments + credit notes
- [ ] Walk-in customer (no partner_id) handled gracefully in sales
- [ ] Customer outstanding balance shown at POS lookup
- [ ] RLS active on customer_ledger and loyalty_ledger
