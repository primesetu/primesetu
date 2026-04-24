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

# High-Fidelity Catalogue Specification (Shoper9 Mapping)

This document maps the legacy Shoper9 Catalogue structures to the modern PrimeSetu Sovereign Registry.

## 1. Item Master (The SKU Engine)
Shoper9's Item Master is highly flexible. PrimeSetu adopts and enhances this with AI-driven matrix insights.

### Core Data Structure
| Field Category | Shoper9 Equivalent | PrimeSetu Strategy |
|----------------|-------------------|-------------------|
| **Identity** | Item Code / Barcode | Multi-barcode support (EAN, UPC, Internal) |
| **Hierarchy** | Brand, Collection, Style | Nested Tagging + Dynamic Attribute Matrix |
| **Variations** | Color, Size, Fit | 3D Matrix Visualization (Style-Color-Size) |
| **Pricing** | MRP, CP, SP, WP | Dynamic Price Tiers (B2B, Retail, Member) |
| **Taxes** | HSN, Tax Class | Automated GST Compliance via HSN Lookup |

### Advanced Features to Implement
- **Grid View Data Entry**: Allow batch entry with Excel-like copy-paste (from `IM_Adding_Item_Master.htm`).
- **Common Field Presets**: Set "Brand: Nike" once for a session of 100 SKUs.
- **Dynamic Field Visibility**: Users toggle visibility of attributes like "Wash Care" or "Fabric Composition".

## 2. Customer Catalogue (The CRM Core)
Shoper9 supports 5 Classifications and 5 Profiles. PrimeSetu expands this into a full "Customer 360" view.

### Extension Points
- **Classification 1-5**: (e.g., Religion, Age Group, Profession, Income, Tier).
- **Profile 1-5**: (e.g., Anniversary, Birthday, Preferred Store, Last Visit Context).
- **Mailing Multi-Address**: Support for "Home", "Work", and "Shipping" addresses via General Lookup definitions.

## 3. General Lookup (The Registry Backbone)
Almost every dropdown in the OS is powered by the General Lookup catalogue.

### Priority Categories
- **Payment Modes**: Cash, Credit Card, Gift Coupons (linked to specific clearing banks).
- **Size Groups**: Footwear (UK/US), Apparel (S/M/L/XL), etc.
- **Sales Factors**: Dynamic multipliers for price calculations.
- **Personnel Roles**: Salesmen, Cashiers, Managers (linked to RBAC).

## 4. Vendor Catalogue
Focuses on supply chain logistics and terms.
- **Terms**: Net-30, Net-60, Consignment.
- **Exchange Parameters**: For vendors also running Shoper9 (Comp Code, Flat File Delimiter).

## 5. Integration Implementation (Phase 4)
PrimeSetu must maintain a "Shadow Registry" that syncs back to Shoper9 for legacy compatibility while allowing the Sovereign OS to handle advanced metadata (Images, Videos, AI Descriptions).

---
*Derived from: temp_chm/catalogue/*
