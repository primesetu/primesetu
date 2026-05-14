/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: add-db-migration
 * ============================================================ */

# SKILL: Add a Supabase DB Migration

Read this file completely before writing any migration SQL.

---

## When to use this skill

Any time the database schema needs to change: new table, new column,
new index, new RLS policy, or data backfill.

---

## Step 1 — Create the migration file

```
supabase/migrations/<timestamp>_<description>.sql
```

Timestamp format: `YYYYMMDDHHMMSS` — use current UTC time.
Example: `20260426143000_add_inventory_audit_table.sql`

**Never modify an existing migration file.** Always create a new one.

---

## Step 2 — Migration file template

```sql
/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: add_inventory_audit_table
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.inventory_audit (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id),
    user_id     UUID NOT NULL REFERENCES auth.users(id),
    action      TEXT NOT NULL CHECK (action IN ('count', 'adjust', 'write_off')),
    qty_before  INTEGER NOT NULL,
    qty_after   INTEGER NOT NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_inventory_audit_store_id
    ON public.inventory_audit(store_id);

CREATE INDEX IF NOT EXISTS idx_inventory_audit_created_at
    ON public.inventory_audit(store_id, created_at DESC);

-- ============================================================
-- RLS (MANDATORY — no table goes live without RLS)
-- ============================================================

ALTER TABLE public.inventory_audit ENABLE ROW LEVEL SECURITY;

-- Store isolation: users can only see their own store's data
CREATE POLICY "store_isolation_select" ON public.inventory_audit
    FOR SELECT USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- Insert: only authenticated users of this store
CREATE POLICY "store_isolation_insert" ON public.inventory_audit
    FOR INSERT WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- No UPDATE or DELETE on audit tables — audit is append-only
-- (Do NOT add UPDATE or DELETE policies on audit tables)

-- ============================================================
-- COMMENTS (helps future agents understand intent)
-- ============================================================

COMMENT ON TABLE public.inventory_audit IS
    'Append-only log of all inventory count and adjustment events per store.';

COMMENT ON COLUMN public.inventory_audit.qty_before IS
    'Stock quantity before this action. Stored as integer units.';

COMMENT ON COLUMN public.inventory_audit.qty_after IS
    'Stock quantity after this action. Stored as integer units.';
```

---

## Step 3 — Verify RLS is working

Before committing, test the policy manually in Supabase SQL editor:

```sql
-- Test as a specific user (replace UUID with a real test user)
SET request.jwt.claims = '{"sub": "user-uuid-here", "role": "authenticated"}';

-- Should return only rows for that user's store
SELECT * FROM public.inventory_audit LIMIT 5;

-- Should FAIL (return 0 rows) for a different store's data
SELECT * FROM public.inventory_audit
WHERE store_id = 'some-other-store-uuid';
```

---

## Rules for all migrations

**Money / quantities:**
- Money columns: `INTEGER` (paise). Never `DECIMAL`, `FLOAT`, or `NUMERIC`.
- Quantity columns: `INTEGER`. Never float.
- GST rates: `SMALLINT` with CHECK constraint `CHECK (gst_rate IN (0,5,12,18,28))`

**Identifiers:**
- All PKs: `UUID DEFAULT gen_random_uuid()`
- All FKs to stores: `store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE`
- Never use serial/integer PKs for new tables

**Timestamps:**
- Always `TIMESTAMPTZ` (with timezone), never `TIMESTAMP`
- Default: `DEFAULT now()`

**Constraints:**
- Add `CHECK` constraints for enum-like columns rather than creating separate enum types
- Add `NOT NULL` to every column that should never be null

**Indexes:**
- Always index `store_id` on multi-tenant tables
- Index `(store_id, created_at DESC)` on any table queried by date range
- Index foreign keys that will be used in JOINs

**RLS — non-negotiable:**
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on every new table
- At minimum: a SELECT policy scoped to `store_id` from `store_users`
- Audit tables: SELECT + INSERT only. No UPDATE. No DELETE.
- Never use `service_role` to bypass RLS in application code.

---

## Step 4 — Apply the migration

```bash
# Apply to local Supabase (if running locally)
supabase db push

# Or apply via Supabase dashboard SQL editor for cloud-only setups
# Copy-paste the migration SQL and run it
```

---

## Step 5 — Update SQLAlchemy model (Phase 2)

After the migration is applied, update or create the corresponding model:

```python
# backend/app/models/inventory.py

class InventoryAudit(Base):
    __tablename__ = "inventory_audit"

    id         = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id   = Column(PGUUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    product_id = Column(PGUUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    user_id    = Column(PGUUID(as_uuid=True), nullable=False)
    action     = Column(String, nullable=False)
    qty_before = Column(Integer, nullable=False)
    qty_after  = Column(Integer, nullable=False)
    note       = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default="now()")
```

---

## Checklist before committing

- [ ] Migration file named `<timestamp>_<description>.sql`
- [ ] `ENABLE ROW LEVEL SECURITY` present
- [ ] SELECT policy scoped to `store_id` from `store_users`
- [ ] Money columns are `INTEGER` (paise) — not float
- [ ] `store_id` indexed
- [ ] `(store_id, created_at DESC)` index on date-queried tables
- [ ] Migration tested in Supabase SQL editor
- [ ] Corresponding SQLAlchemy model updated
- [ ] No existing migration files modified
- [ ] File signature present
