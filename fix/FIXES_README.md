# PrimeSetu — Critical Fixes (Phase 2 Security + GST Compliance)

> Companion to the main repo at `github.com/primesetu/primesetu`  
> These files address the three pre-production blockers identified in the code review.

---

## What was fixed

### Fix 1 — Authentication & RBAC (`security.py`)
Every API endpoint was publicly accessible. Now all routes require a valid Supabase JWT.

**File:** `backend/app/core/security.py`

**Three role levels:**
| Role | Access |
|------|--------|
| `cashier` | Read products, create bills, view alerts |
| `manager` | + Reports, schemes, product create/edit |
| `admin` | + Delete/deactivate products, store settings |

**How it works:**
1. Frontend sends `Authorization: Bearer <supabase_jwt>` on every request
2. `security.py` decodes the JWT using `SUPABASE_JWT_SECRET`
3. Extracts `store_id` and `role` from `user_metadata`
4. All DB queries are automatically scoped to `current_user.store_id`

**Required env var:**
```
SUPABASE_JWT_SECRET=<your-jwt-secret-from-supabase-dashboard>
```
Find it in: Supabase Dashboard → Project Settings → API → JWT Secret

---

### Fix 2 — Financial Precision (`models.py` + migration SQL)
All monetary columns were `Float`, which causes rounding errors in financial math (e.g. `0.1 + 0.2 = 0.30000000000000004`). Changed to `Numeric(12,2)` — exact decimal arithmetic.

**Files:**
- `backend/models.py` — all `Float` columns replaced with `Numeric(12,2)`
- `supabase/migrations/001_float_to_numeric.sql` — run once against your DB

**New fields added to Product:**
- `cost_price` — for margin/valuation reports
- `hsn_code` — mandatory for GST invoicing
- `gst_rate` — 0 / 5 / 12 / 18 / 28
- `reorder_level` — per-product low-stock threshold

**New fields added to Bill:**
- Full GST breakdown: `cgst_amount`, `sgst_amount`, `igst_amount`, `total_tax_amount`
- `payment_mode` — cash / upi / card / credit / split
- `customer_gstin` — for B2B invoices
- `round_off` — standard Indian retail rounding
- `is_cancelled` — soft cancel (never hard delete)

---

### Fix 3 — GST Compliance Engine (`gst.py` + updated `schemas.py` + `main.py`)
The billing endpoint had no tax calculation at all — illegal for any GST-registered Indian business.

**File:** `backend/app/core/gst.py`

**What it handles:**
- **Intra-state** (store & customer same state) → CGST 50% + SGST 50%
- **Inter-state / B2B** (customer GSTIN, different state) → IGST 100%
- **B2C retail** (no customer GSTIN) → always CGST + SGST
- Rounding to nearest rupee (standard retail practice)
- HSN code validation (4/6/8 digit numeric)
- GSTIN format validation (15-char alphanumeric pattern)
- Invalid GST slab rejection (only 0/5/12/18/28 allowed)

**Example:**
```python
from app.core.gst import GSTEngine, BillLineInput
from decimal import Decimal

lines = [
    BillLineInput(
        product_id=1, qty=2,
        unit_price=Decimal("500.00"),
        mrp_at_billing=Decimal("500.00"),
        gst_rate=Decimal("18"),
        hsn_code="61091000",
        discount_amount=Decimal("0"),
    )
]
result = GSTEngine.compute_bill(lines, store_state="27", customer_gstin=None)
# result.cgst_amount = 90.00
# result.sgst_amount = 90.00
# result.total_amount = 1180.00
```

---

## Integration steps

### Step 1 — Run the DB migration
```sql
-- In Supabase SQL Editor:
-- Paste contents of supabase/migrations/001_float_to_numeric.sql
-- and execute
```

### Step 2 — Add the new files to your repo
```
backend/
  app/
    core/
      security.py    ← new
      gst.py         ← new
  models.py          ← replace existing
  schemas.py         ← replace existing
  main.py            ← replace existing

tests/
  test_gst.py        ← new
  test_auth.py       ← new
```

### Step 3 — Add the env var
```bash
# In Render dashboard → Environment:
SUPABASE_JWT_SECRET=<from supabase dashboard>
```

### Step 4 — Install new dependency
```bash
pip install PyJWT
# Add to requirements.txt:
PyJWT==2.8.0
```

### Step 5 — Update Frontend auth headers
In your React API client, add the Bearer token to every request:
```typescript
// frontend/src/lib/api.ts
import { supabase } from './supabaseClient'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  
  return fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
      ...options.headers,
    },
  })
}
```

### Step 6 — Set store_id in user metadata (one-time, per user)
```typescript
// Run once when onboarding a store
await supabase.auth.updateUser({
  data: {
    store_id: 'your-store-uuid',
    role: 'manager',   // cashier | manager | admin
    full_name: 'Cashier Name',
  }
})
```

### Step 7 — Run tests
```bash
cd backend
pip install pytest pytest-asyncio
pytest tests/ -v
```

---

## What still needs doing (Phase 2 remaining)

- [ ] Frontend Login.tsx → replace mock with `supabase.auth.signInWithPassword`
- [ ] App.tsx → `onAuthStateChange` listener for session persistence
- [ ] GST report: GSTR-1 format export (monthly B2B + B2C summary)
- [ ] e-Invoice API integration (mandatory above ₹5Cr turnover)
- [ ] Tally XML updated to include GST voucher fields
- [ ] Seed data: add `hsn_code` and `gst_rate` to all existing products

---

*© 2026 AITDL Network · "Memory, Not Code."*
