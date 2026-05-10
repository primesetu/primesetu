/* ============================================================
 * SMRITI-OS — Catalogue Master Workbench (Refactored)
 * v3.0 Architecture: "Schema-driven Universal Engines"
 * Replaced 1200+ lines of custom grid logic with AppCRUD
 * ============================================================ */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Users, Building2, Store, UserCheck, Database, FileSpreadsheet } from "lucide-react";
import { api } from "../../api/client";
import { AppCRUD, AppGridColumn, AppFormSchema } from "../../components/engines";
import { useAppPermissions } from "../../components/engines";

// ── Entity Definitions ────────────────────────────────────────────────────────
type EntityKey = "CUSTOMER" | "VENDOR" | "CHAINSTORE" | "SALESSTAFF" | "ACCOUNTS" | "HSN";

const ENTITY_META: Record<EntityKey, { label: string; icon: any; table: string; filters?: any }> = {
  CUSTOMER: { label: "Customers", icon: Users, table: "customers" },
  VENDOR: { label: "Vendors", icon: Building2, table: "vendors" },
  CHAINSTORE: { label: "Inter-Store", icon: Store, table: "chainstores" },
  SALESSTAFF: { label: "Sales Staff", icon: UserCheck, table: "personnel" },
  ACCOUNTS: { label: "Accounts", icon: Database, table: "accountsmaster" },
  HSN: { label: "HSN Codes", icon: FileSpreadsheet, table: "genlookup", filters: { recid: 11000 } },
};

// ── Schemas ───────────────────────────────────────────────────────────────────
// Convert legacy fields into AppGrid/AppForm schemas
const SCHEMAS: Record<EntityKey, { grid: AppGridColumn[]; form: AppFormSchema }> = {
  CUSTOMER: {
    grid: [
      { field: "code", header: "Code", width: 120, pinned: "left", required: true },
      { field: "nm", header: "Customer Name", width: 220, required: true },
      { field: "pricegrp", header: "Price Group", width: 120 },
      { field: "mobilephone", header: "Mobile", width: 130 },
      { field: "town", header: "City", width: 140 },
      { field: "creditlimit", header: "Credit Limit", width: 120, type: "number" },
    ],
    form: {
      columns: 2,
      fields: [
        { name: "code", label: "Customer Code", type: "text", required: true, sectionHeader: "Basic Details" },
        { name: "nm", label: "Full Name", type: "text", required: true, span: 2 },
        { name: "mobilephone", label: "Mobile Number", type: "phone" },
        { name: "email", label: "Email Address", type: "email" },
        { name: "streetaddr", label: "Street Address", type: "textarea", span: 2, sectionHeader: "Address Details" },
        { name: "town", label: "City/Town", type: "text" },
        { name: "state", label: "State", type: "text" },
        { name: "creditdays", label: "Credit Days", type: "number", sectionHeader: "Commercials" },
        { name: "creditlimit", label: "Credit Limit", type: "number" },
      ],
    },
  },
  VENDOR: {
    grid: [
      { field: "code", header: "Vendor Code", width: 130, pinned: "left", required: true },
      { field: "nm", header: "Vendor Name", width: 250, required: true },
      { field: "vendortype", header: "Type", width: 120 },
      { field: "mobilephone", header: "Mobile", width: 130 },
      { field: "town", header: "City", width: 140 },
      { field: "commissionpercent", header: "Commission %", width: 120, type: "number" },
    ],
    form: {
      columns: 2,
      fields: [
        { name: "code", label: "Vendor Code", type: "text", required: true, sectionHeader: "Basic Details" },
        { name: "nm", label: "Vendor Name", type: "text", required: true, span: 2 },
        { name: "vendortype", label: "Vendor Type", type: "text" },
        { name: "mobilephone", label: "Mobile Number", type: "phone" },
        { name: "streetaddr", label: "Street Address", type: "textarea", span: 2, sectionHeader: "Address Details" },
        { name: "town", label: "City", type: "text" },
        { name: "state", label: "State", type: "text" },
        { name: "commissionpercent", label: "Commission %", type: "number", sectionHeader: "Commercials" },
        { name: "buyingfactor", label: "Buying Factor", type: "number" },
      ],
    },
  },
  CHAINSTORE: {
    grid: [
      { field: "code", header: "Store Code", width: 130, pinned: "left", required: true },
      { field: "nm", header: "Store Name", width: 250, required: true },
      { field: "town", header: "City", width: 140 },
      { field: "mobilephone", header: "Mobile", width: 130 },
    ],
    form: {
      columns: 2,
      fields: [
        { name: "code", label: "Store Code", type: "text", required: true },
        { name: "nm", label: "Store Name", type: "text", required: true, span: 2 },
        { name: "mobilephone", label: "Mobile", type: "phone" },
        { name: "town", label: "City", type: "text" },
      ],
    },
  },
  SALESSTAFF: {
    grid: [
      { field: "code", header: "Staff Code", width: 120, pinned: "left", required: true },
      { field: "nm", header: "Full Name", width: 200, required: true },
      { field: "role", header: "Role", width: 140 },
      { field: "storecode", header: "Store", width: 120 },
      { field: "targetamt", header: "Target Amount", width: 120, type: "number" },
    ],
    form: {
      columns: 2,
      fields: [
        { name: "code", label: "Staff Code", type: "text", required: true },
        { name: "nm", label: "Full Name", type: "text", required: true },
        { name: "role", label: "Role", type: "text" },
        { name: "storecode", label: "Store Assignment", type: "text" },
        { name: "targetamt", label: "Target Amount", type: "number" },
        { name: "commission", label: "Commission %", type: "number" },
      ],
    },
  },
  ACCOUNTS: {
    grid: [
      { field: "code", header: "Account Code", width: 140, pinned: "left", required: true },
      { field: "nm", header: "Account Name", width: 300, required: true },
      { field: "type", header: "Type", width: 120 },
      { field: "yropbaldb", header: "Op Bal (Dr)", width: 130, type: "number" },
      { field: "yropbalcr", header: "Op Bal (Cr)", width: 130, type: "number" },
    ],
    form: {
      columns: 2,
      fields: [
        { name: "code", label: "Account Code", type: "text", required: true },
        { name: "nm", label: "Account Name", type: "text", required: true, span: 2 },
        { name: "type", label: "Type", type: "text" },
        { name: "yropbaldb", label: "Op Bal (Dr)", type: "number", sectionHeader: "Opening Balances" },
        { name: "yropbalcr", label: "Op Bal (Cr)", type: "number" },
      ],
    },
  },
  HSN: {
    grid: [
      { field: "code", header: "HSN Code", width: 150, pinned: "left", required: true },
      { field: "descr", header: "Description", width: 400, required: true },
      { field: "flag", header: "Tax Flag", width: 100 },
    ],
    form: {
      columns: 1,
      fields: [
        { name: "code", label: "HSN Code", type: "text", required: true },
        { name: "descr", label: "Description", type: "textarea", required: true },
        { name: "flag", label: "Tax Flag", type: "text" },
      ],
    },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function CatalogueMasterWorkbench({
  initialEntity = "CUSTOMER",
}: {
  onBack?: () => void;
  initialEntity?: EntityKey;
}) {
  const [activeTab, setActiveTab] = useState<EntityKey>(initialEntity);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const permissions = useAppPermissions("item_master"); // Using item_master access matrix for catalog

  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const meta = ENTITY_META[activeTab];
      // Note: In real app, we'd pass filters to the backend
      const res = await api.legacy.getData(meta.table, {
        limit: 200,
        filters: meta.filters ? JSON.stringify(meta.filters) : undefined,
      });
      // Normalize keys to lowercase for engine matching
      const rows = (res?.data || res || []).map((row: any) => {
        const normalized: any = {};
        for (const [k, v] of Object.entries(row)) normalized[k.toLowerCase()] = v;
        return normalized;
      });
      setData(rows);
    } catch (err) {
      console.error("Failed to load catalog data", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleCreate = async (values: Record<string, any>) => {
    const meta = ENTITY_META[activeTab];
    // Convert keys to expected backend format (Capitalized for legacy reasons, but backend should handle)
    await api.legacy.bulkUpdate(meta.table, [values]);
    await loadData();
  };

  const handleUpdate = async (id: any, values: Record<string, any>) => {
    const meta = ENTITY_META[activeTab];
    await api.legacy.bulkUpdate(meta.table, [values]);
    await loadData();
  };

  const handleInlineEdit = async (rowIndex: number, field: string, value: any, row: any) => {
    const meta = ENTITY_META[activeTab];
    const updatedRow = { ...row, [field]: value };
    await api.legacy.bulkUpdate(meta.table, [updatedRow]);
    // Optionally reload data or just update local state
  };

  const currentSchema = SCHEMAS[activeTab];

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* ── Header & Tabs ── */}
      <div style={{ background: "#1a4a48", padding: "14px 24px", borderBottom: "1px solid var(--primary)" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "0.05em", marginBottom: 16 }}>
          CATALOGUE MASTER WORKBENCH
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(Object.keys(ENTITY_META) as EntityKey[]).map((key) => {
            const meta = ENTITY_META[key];
            const Icon = meta.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", fontSize: 11, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--primary)" : "rgba(255,255,255,0.7)",
                  background: isActive ? "var(--surface)" : "transparent",
                  borderTopLeftRadius: 4, borderTopRightRadius: 4,
                  borderBottom: "none", cursor: "pointer",
                }}
              >
                <Icon size={14} /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Engine View ── */}
      <div className="flex-1 overflow-hidden" style={{ background: "var(--surface)" }}>
        <AppCRUD
          id={`catalog-${activeTab}`}
          title={ENTITY_META[activeTab].label}
          gridColumns={currentSchema.grid}
          formSchema={currentSchema.form}
          data={data}
          loading={loading}
          permissions={{
            canCreate: permissions.create,
            canEdit: permissions.edit,
            canDelete: permissions.delete,
            canExport: permissions.export
          }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onInlineEdit={handleInlineEdit}
          idField="code" // All these entities use 'code' as primary key conceptually
        />
      </div>
    </div>
  );
}
