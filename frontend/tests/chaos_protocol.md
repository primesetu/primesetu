# Phase R9: Frontend Chaos Testing Protocol

This document outlines the **Hybrid Manual Validation Protocol** for the Frontend/PWA layer of Smriti-OS. Because the POS relies on exact focus states (barcode scanners) and native device hardware (thermal printers), these chaos scenarios must be executed physically or orchestrated via Playwright in the exact retail environment.

## 1. The Stale Chunk Strike (PWA Recovery)
**Objective:** Verify the application cleanly recovers if a user requests a lazy-loaded chunk that has been invalidated by a new deployment while they were active.

**Execution:**
1. Open the Smriti-OS POS route (`/billing`).
2. Do not navigate to the Analytics (`/dashboard`) route.
3. In the terminal, run `npm run build` to generate a new set of minified chunks with new hashes.
4. Manually delete the old chunk from the `dist/assets` or `node_modules/.vite` cache.
5. In the UI, click the `Dashboard` link.
**Expected Outcome:** 
React Router will throw a `ChunkLoadError`. The Error Boundary must intercept this and trigger a silent or prompted `window.location.reload()`, gracefully fetching the new PWA manifest without a white screen of death.

## 2. The Offline POS Strike (PWA Integrity)
**Objective:** Verify the main synchronous POS bundle successfully serves and operates entirely offline via Workbox Service Workers.

**Execution:**
1. Open Smriti-OS and login. Wait for Workbox installation to complete.
2. Open Chrome DevTools -> Network -> Select **Offline**.
3. Reload the page completely (`F5`).
**Expected Outcome:**
The `/billing` route must load instantly. State management (Zustand) must initialize. The Barcode Scanner input must remain immediately active. Submitting a bill will queue locally (or fail gracefully with a "Network Disconnected" toast, but the app itself must not crash).

## 3. Printer Disconnect Resiliency
**Objective:** Prevent catastrophic UI blocking when the local thermal printer queue jams or disconnects.

**Execution:**
1. Set the default system printer to a disconnected device, or intercept the `react-to-print` `onBeforeGetContent` hook to throw a timeout exception.
2. Complete a transaction and click "Print Receipt".
**Expected Outcome:**
The print dialogue fails or times out. A non-blocking toast appears ("Printer Unavailable"). The cashier is immediately returned to a clean POS state to bill the next customer. Focus is restored to the barcode input.

## 4. Concurrent Tills Strike (WebSocket/State Contention)
**Objective:** Verify that multiple tills operating on the same `node_id` do not bleed local cart state.

**Execution:**
1. Open two entirely separate incognito windows (simulating two till tablets).
2. Scan `SKU_001` in Till A.
3. Scan `SKU_002` in Till B.
**Expected Outcome:**
Cart state remains strictly isolated to the browser's `localStorage` or session scope. No cross-pollination of cart items occurs.
