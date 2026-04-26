/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# Implementation Plan — Phase 2 Authentication & Security

## 1. Authentication Bridge (Frontend)
- **File**: `frontend/src/modules/auth/Login.tsx`
- **Action**: Replace mock login with `supabase.auth.signInWithPassword`.
- **Logic**: 
  - Validate credentials against Supabase.
  - On success, pass the session to `App.tsx`.
  - Handle errors (invalid credentials, network issues).

- **File**: `frontend/src/App.tsx`
- **Action**: Use `useEffect` to listen for `onAuthStateChange`.
- **Logic**:
  - Fetch user metadata (`role`, `store_id`) on login.
  - Maintain session persistence.

## 2. Backend Security Layer (FastAPI)
- **File**: `backend/app/core/security.py` (New)
- **Action**: Implement Supabase JWT verification.
- **Logic**:
  - Decode JWT using `SUPABASE_JWT_SECRET`.
  - Extract `sub` (user_id) and `metadata` (`store_id`, `role`).
  - Create a dependency `get_current_active_user`.

## 3. Data Integrity & RBAC (Backend)
- **File**: `backend/app/routers/billing.py`
- **Action**: Remove hardcoded `store_id="X01"`.
- **Logic**: Use `current_user.store_id` from the auth dependency.

- **File**: `backend/app/routers/inventory.py`
- **Action**: Filter inventory queries by `current_user.store_id`.

## 4. Operational Awareness (Frontend)
- **File**: `frontend/src/modules/dashboard/ManagementDashboard.tsx`
- **Action**: Replace static stats with API calls to `/api/v1/dashboard/stats`.

## 5. Verification Plan
- **Test Case 1**: Login with valid Supabase credentials → Redirect to Dashboard.
- **Test Case 2**: API call without Bearer token → 401 Unauthorized.
- **Test Case 3**: Finalize Bill → Verify `store_id` in DB matches the logged-in user's store.
## 6. Phase 3 — Operational Parity & Multi-dimensional Inventory
- **Objective**: Match core Shoper 9 functional capabilities identified in documentation.
- **Inventory Matrix**: 
  - Enhance `Product` search to filter by `size` and `color`.
  - Implement size-wise stock matrix in the frontend.
- **Billing Workflow**:
  - **Slips**: Implement "Sales Slips" for pre-billing staging.
  - **Suspended Bills**: Allow saving active transactions to a "Suspended" state for later retrieval.
- **Advanced Reporting**:
  - Implement Sales by Attribute (Size/Color) reports.
  - Implement Aging reports with custom time units (Days/Weeks).
- **Tally Bridge**:
  - Implement a basic Tally.ERP 9 XML export for voucher posting.

## 7. Verification Plan (Phase 3)
- [x] Test Case 5: Create a Sales Slip → Retrieve it in the Billing module → Finalize as Bill.
- [x] Test Case 6: Suspend a Bill → Resume it from the "Suspended Bills" browser.
- [x] Test Case 7: Search for a product by specific size (e.g., "Citywalk - 8") → Verify correct stock returned.

## 8. Phase 4 — Sovereign Master Registry (Catalogue)
- **Objective**: Implement a smart, unified catalogue system for master data (Shoper 9 Parity).
- **Unified Registry Architecture**:
  - Consolidate **Items, Customers, Vendors, and Personnel** into a single "Command Center" UI.
  - Implement a **Universal Search** that spans all master data types.
- **Smart Data Models**:
  - Implement `Partner` model to handle Vendors, Customers, and Salespersons with role-specific attributes.
  - Implement `GeneralLookup` for dynamic system constants (Payment modes, Size groups, Categories).
- **Intelligence Layer**:
  - **Contextual Awareness**: Show stock velocity in Item Catalogue and loyalty insights in Customer Catalogue.
  - **Inline Bulk Edits**: Allow spreadsheet-like updates for price revisions and tax mapping.
- **Zero Cloud Protocol**:
  - All master data served locally via Supabase PostgreSQL.
  - Support for PDT (Portable Data Terminal) file imports for bulk item updates.

## 10. Phase 5 — Predictive Intelligence & Operational Polish
- **Objective**: Elevate the UI/UX to a premium level and introduce AI-governed predictive logic.
- **AI-Governed Inventory**:
  - **Stockout Forecasting**: Calculate "Days of Cover" based on historical velocity.
  - **Smart Reordering**: Generate suggested Purchase Orders based on lead times.
- **Operational UX**:
  - **Micro-Animations**: Add spring-physics transitions to all modals and grid updates.
  - **Glassmorphic Polish**: Refine gradients and blur effects for a state-of-the-art feel.
- **Sovereign Multi-lingual**:
  - Implement a dynamic translation bridge for 14 regional languages (Hindi, Tamil, etc.).
- **Global Awareness**:
  - Real-time weather/event overlay to explain sales spikes (Phase 5+).

## 11. Verification Plan (Phase 5)
- [x] **Test Case 11**: View a product in Registry → Verify "Days of Cover" prediction is displayed.
- [x] **Test Case 12**: Change system language to "Hindi" → Verify all labels (Billing/Catalogue) update.
- [x] **Test Case 13**: Perform a high-speed scan → Verify micro-animations are smooth (60fps).

## 12. Phase 6 — Infrastructure Stability & Production Deployment (COMPLETED)
- **Objective**: Stabilize the production environment and resolve runtime hydration/constructor errors.
- **Backend Migration**: Moved from local tunnels to **Render.com** (Stable FastAPI hosting).
- **PWA Elimination**: Removed `VitePWA` to prevent Service Worker hydration conflicts causing "Illegal constructor" errors.
- **Security Hardening**:
  - Implemented `MessageChannel` polyfill in `index.html` for restricted browser contexts.
  - Configured strict CSP via Cloudflare `_headers`.
- **CI/CD Stabilization**:
  - Pinned `Python 3.12.3` on Render to avoid `pydantic-core` build failures.
- Standardized dependency versions (`framer-motion`, `lucide-react`) for production minification safety.

## 13. Phase 7 — Comprehensive Operational Parity (IN PROGRESS)
- **Objective**: Implement missing high-efficiency retail modules identified in the Shoper 9 prototype.
- **Module 1: Till Management**
  - **Backend**: Add `Till` model and `/api/v1/tills` router.
  - **Frontend**: Implement `TillManagement` screen with status board and cash lift logic.
- **Module 2: Price Management**
  - **Backend**: Support multiple price levels (MRP, Wholesale, Staff).
  - **Frontend**: Implement `PriceManagement` screen for bulk list views.
- **Module 3: GTIN / GS1 Service**
  - **Backend**: Implement GTIN generation and validation logic.
  - **Frontend**: Implement `GTINStudio` module for barcode management.
- **Module 4: Institutional MIS & Alerts**
  - **Backend**: Detailed sales/inventory/tax reports logic in `reports.py`.
  - **Frontend**: Implement `MISReports` and `AlertsCentre` modules.

## 14. Verification Plan (Phase 7)
- [ ] **Test Case 14**: Open a Till → Perform sales → Verify cash collected updates in Till Board.
- [ ] **Test Case 15**: Change product price in Price Management → Verify update reflects in Billing cart.
- [ ] **Test Case 16**: Generate GTIN for a new SKU → Verify compliance with GS1 EAN-13 pattern.
