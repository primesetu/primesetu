# 🔄 SMRITI-OS Sales Return & Exchange Workflow

## 📖 Objective
This document outlines the mandatory operational workflows for Sales Returns and Exchanges in SMRITI-OS, derived directly from the Shoper 9 POS documentation. Developers building the `SalesReturnModule.tsx` must strictly adhere to these business rules.

## 1. Return Types
The system must support two primary modes of Sales Returns, which can be mixed within a single transaction if required.

### 📄 Return WITH Bill Reference
Used when the customer presents the original invoice.
*   **Header Input**: The cashier enters the original `Document Prefix` and `Document Number`.
*   **Grid Population**: The system fetches the original bill from the PostgreSQL database and populates the `DataTable` grid.
*   **Partial vs. Full Return**: The cashier can modify the `Qty` column to reflect a partial return (e.g., returning 1 shirt out of 3).
*   **Promo Rule Enforcement**: If the item was purchased under a promotional offer (e.g., "Buy 2 Get 1 Free"), returning the primary item **requires** the mandatory return of the free item. The frontend must validate and block the transaction if the promo integrity is violated.
*   **Multiple Invoices**: The system must allow items from multiple different original bills to be returned within a single return transaction.

### 🔍 Return WITHOUT Bill Reference
Used when the customer has lost the invoice, assuming store policy permits it.
*   **Direct Entry**: The cashier scans the items into the Direct Entry grid via the Sovereign Search bar, exactly like a standard billing transaction.
*   **Pricing Fallback**: Since the original sold price is unknown, the system must fetch the current Retail Price from the `ItemMaster`.
*   **Customer Tagging**: The frontend must heavily prompt for the `Customer Code` (phone number) to track abuse of the non-referenced return policy and ensure accurate Customer Off-take reports.

## 2. Settlement: Credit Notes & Cash Refunds
When the net total of the transaction is negative (meaning the store owes the customer money), the standard Payment Settlement (`F10`) modal shifts into **Refund Mode**.

### Issuing a Credit Note
*   The primary mode of refund should default to issuing a **Credit Note**.
*   The system generates a unique `Credit Note Number` and assigns it the negative balance.
*   This Credit Note is tied to the customer's profile and can be used as a `Mode of Payment` in future billing transactions. It can also be partially consumed across multiple future bills.

### Cash Refund
*   If store policy allows, the cashier can select **Cash** from the refund modal to return physical currency from the till. 
*   This requires explicit permissions (`user.hasPermission('sales_return.cash_refund')`).

## 3. Exchanges (Zero or Positive Net Balance)
A Sales Return document can simultaneously act as a new Sales Bill.
1. The customer returns an item (Negative Value).
2. The cashier scans a new item the customer wants to buy (Positive Value).
3. **The Net Variance**:
   * If the Net is **Positive**, the customer owes money. The `F10` settlement modal asks for Cash/Card for the difference.
   * If the Net is **Negative**, the store issues a Credit Note for the difference.
   * If the Net is **Zero**, the transaction closes instantly as an even exchange.

---
*Note: The Grid Governance rules (`GRID_GOVERNANCE.md`) apply equally to the Sales Return module. Columns must be hydrated dynamically via `useGridMask`.*
