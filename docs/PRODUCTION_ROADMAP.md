# 🗺️ SMRITI-OS Production Readiness Roadmap

## 📖 Objective
While the core transactional schema and UI governance of SMRITI-OS are successfully mapped to legacy Shoper 9 standards, deploying to a live retail environment requires solving four critical operational challenges. This roadmap outlines the architectural solutions for Hardware, Operations, Accounting, and Network Resilience.

---

## 🖨️ 1. Hardware Integration (The Web Barrier)
**The Challenge:** Web browsers sandbox applications, preventing SMRITI-OS from directly communicating with COM/LPT ports to trigger thermal printers or pop open cash drawers.
**The Solution:**
1.  **Web Serial API / WebUSB:** Modern browsers (Chrome/Edge) support the Web Serial API. SMRITI-OS will implement a utility class (`HardwareBridge.ts`) that requests user permission to connect directly to the USB POS printer.
2.  **ESC/POS Command Generator:** SMRITI-OS will construct raw ESC/POS byte arrays (for cutting paper, printing bold text, and firing the cash drawer pin) and push them over the Web Serial API.
3.  **Local Print Daemon (Fallback):** If Web Serial fails due to older hardware, we will deploy a lightweight background service (Python/Node) on the Windows terminal. SMRITI-OS will send a `POST localhost:9090/print` request, and the local daemon will route it to the Windows spooler.

---

## 🕒 2. Shift & End-Of-Day (EOD) Operations
**The Challenge:** Retail stores require strict cash control. A cashier must open a till, and managers must blindly reconcile cash at the end of the night.
**The Solution:**
1.  **Shift Schema Creation:** We must add `ShiftHdr` and `ShiftDtls` tables to PostgreSQL.
2.  **Opening Float:** Upon initial login, cashiers are blocked from the Billing UI until they declare the starting cash in the till (e.g., ₹2000 in change).
3.  **Blind Declaration:** At the end of the shift, the cashier is forced to input physical cash/card slips *before* the system reveals the expected system totals. The variance is logged to `CashVarianceLog` for HO auditing.
4.  **EOD Execution:** A nightly job locks transactions for the date and updates the `DayOpBal` (Day Opening Balance) in the `StockMasterExtdOpBal` table.

---

## 🏦 3. Tally Prime Integration Pipeline
**The Challenge:** SMRITI-OS must feed accounting data directly into Tally Prime without manual data entry.
**The Solution:**
1.  **Posting Settings Engine:** The backend will read `tallypostingsettings` to determine which ledger gets hit for which transaction type (e.g., `Sales A/C`, `CGST Payable A/C`).
2.  **XML Payload Generation:** A background queue (e.g., Supabase Edge Functions or FastAPI Background Tasks) will continuously read completed bills from `stktrnhdr`, format them into Tally-compliant XML strings.
3.  **Tally API Push:** The XML is POSTed directly to the local Tally Prime HTTP Server (usually running on port 9000). The returned `TallyGUID` is saved into `tallyvchinfo` to prevent duplicate postings.

---

## 📶 4. The Offline-First Paradigm (PWA)
**The Challenge:** Retail billing must never halt, even if the ISP fails. SMRITI-OS must operate completely offline if the Supabase connection drops.
**The Solution:**
1.  **IndexedDB Synchronization:** The frontend will use an offline database (like RxDB or Dexie.js). Upon login, it downloads today's `ItemMaster`, `SalesFactors`, `SalesTaxCat`, and `GenLookup` to IndexedDB.
2.  **Service Worker Caching:** The React app will be configured as a Progressive Web App (PWA). All static assets and UI components are cached so the app loads without internet.
3.  **Queue-Based Sync:** When offline, completed bills (`stktrnhdr`) are saved to IndexedDB in an "Outbox". A background sync job continuously pings Supabase. Once the internet returns, the Outbox is flushed to the cloud backend.
