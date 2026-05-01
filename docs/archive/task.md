# PrimeSetu Sovereign Institutional Stabilisation

## Current Focus: Sovereign Money Standard (Paise-Integers)

### 1. Database & Schema Migration
- [x] Create migration `20260426004500_convert_money_to_paise.sql`
- [x] Convert all `Numeric` monetary columns to `BIGINT` in `base.py`
- [x] Update RLS policies for money-based filtering (if any)

### 2. Backend Engine Refactor
- [x] Refactor `GSTEngine` in `gst.py` to use strict integer math
- [x] Update `BillingRouter` logic for totals/discounts/rounding
- [x] Update Pydantic schemas in `billing.py` and `common.py`
- [x] Fix `DashboardStats` and report summaries in `main.py`
- [x] Refactor `TallyBridge` for Paise-to-Rupee XML export

### 3. Frontend UI/UX Alignment
- [x] Create `currency.ts` utilities (toPaise, toRupees, formatCurrency)
- [x] Refactor `BillingModule.tsx` (Core POS)
- [x] Refactor `DayEndModule.tsx` (Reconciliation)
- [x] Refactor `TransactionsModule.tsx` (Returns/Credits)
- [x] Refactor `PriceManagement.tsx` (Master Pricing)
- [x] Refactor `TillManagement.tsx` (Cash tracking)

### 4. Verification & Build
- [x] Verify API responses return integer paise
- [x] Verify Frontend formats paise to Rupee-string correctly
- [ ] Run `npm run build` (Pending final check)

---

## Technical Notes: "Memory, Not Code."

1. **Precision Rule**: Paise integers = Absolute Precision. Float = Forbidden.
2. **Rounding Rule**: Tally-compatible rounding to nearest Rupee at bill level.
3. **Display Rule**: Always use `formatCurrency()` from `@/utils/currency`.
4. **Input Rule**: Users type Rupees; code converts to Paise immediately.
