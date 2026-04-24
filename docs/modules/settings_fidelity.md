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

# High-Fidelity Settings & Configuration Specification (Shoper9 Mapping)

This document details the system-level configuration requirements based on Shoper9 Setup.

## 1. Document Control (Prefix Engine)
- **Prefix Management**: Unique prefixes for Cash Bills, Credit Bills, Purchase Orders, and Goods Inwards/Outwards.
- **Auto-Increment**: Intelligent document numbering that resets during Year-End or based on prefix changes.

## 2. Tally.ERP 9 / TallyPrime Interface
- **HSN Mapping**: Direct mapping of Item Masters to Tally HSN codes.
- **Cost Centres**: Support for tracking costs by department or store node.
- **Voucher Comparison**: Utility to ensure PrimeSetu data matches exported Tally data (Zero-error accounting).

## 3. Operational Pulse (Day/Year Management)
- **Day Begin / Day End**: Mandatory processes to synchronize local state and finalize daily accounts.
- **Year-End Process**: Closing of fiscal years and automated prefix/document counter resets.
- **Manage Missing Vouchers**: Recovery utility for interrupted transactions.

## 4. Node & Chain Management
- **Node Management**: Configuration of store counters, registers, and branch IDs.
- **Secondary Database**: Support for attaching historical or archival databases for reporting without bloating active tables.

## 5. Security & RBAC (Mapped from Security_Management)
- **Menu Access**: Granular control over which roles can access specific screens (e.g., Billing vs. Inventory Reclassification).
- **Activity Log**: Supervisory tracking of sensitive actions (Price Revision, Voiding, Re-opening days).

---
*Derived from: temp_chm/Setup/*
