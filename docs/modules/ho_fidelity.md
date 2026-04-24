/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# High-Fidelity HO Sync Specification (Shoper9 Mapping)

This document details the data synchronization requirements between Store (POS) and Head Office (HO) based on SIS (Shoper Integration Server).

## 1. Network Architecture (SIS Bridge)
- **Port Management**:
    - **POS Node**: Default port `9525`.
    - **HO Node**: Default port `9526`.
- **Connectivity Check**: Periodic heartbeat pulse to verify connectivity to the HO server.

## 2. Bi-Directional Synchronization
- **Outbound (POS to HO)**:
    - **Daily Sales**: Automated export of bill-level details.
    - **Stock Adjustments**: Syncing physical audit results (PST).
    - **Till Activity**: Cashier activity logs for centralized audit.
- **Inbound (HO to POS)**:
    - **Master Data**: New SKUs, updated prices, and revised HSN codes.
    - **Promotions**: Deployment of centralized schemes and discounts.
    - **Branch Policies**: Configuration overrides (e.g., changing prefix rules).

## 3. Operational Control
- **Service Management**: Ability to Start/Stop/Restart the synchronization service from the HO Dashboard.
- **Remote Credentials**: Secure storage of Windows/Service login details for remote machine access.
- **Failover Handling**: Queueing of sync packets during network downtime with auto-retry on reconnection.

## 4. Visibility Dashboard
- **Sync History**: Log of successful vs. failed data packets.
- **Pending Transactions**: Visibility into data "stuck" at the POS that hasn't reached HO yet.

---
*Derived from: temp_chm/Tools/SIS_Manager*
