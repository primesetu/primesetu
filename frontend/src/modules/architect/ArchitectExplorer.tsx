/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "The Code is the Blueprint."
 * ============================================================ */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Database, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ArrowLeft, 
  Code2, 
  Table as TableIcon,
  ChevronRight,
  Workflow,
  BarChart3,
  Settings,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LegacyDictionary from './LegacyDictionary';

// ── SCHEMA MAPPINGS DATA ──
const SCHEMA_DATA: Record<string, any> = {
  billing: {
    title: "Billing Terminal Architecture",
    description: "Transaction processing, tax snapshots, and fiscal audit trails.",
    tables: ["stktrnhdr", "stktrndtl", "personnel", "pospaymodes"],
    workflow: [
      { step: "Initialize", pick: "PrefixTrnNo", action: "Next DocNo", save: "SaleTrnHdr.DocNo", icon: "🆔" },
      { step: "Scan/Pick", pick: "ItemMaster", action: "Retail_Price Fetch", save: "xtempGridItemdtls", icon: "🔍" },
      { step: "Validate", pick: "StockMaster", action: "Stock Check", save: "xtempErrorLog", icon: "🛡️" },
      { step: "Drafting", pick: "xtemp", action: "Tax/Promo Split", save: "ExpectedTrnDtls(Status 5)", icon: "📝" },
      { step: "Commit", pick: "Expected", action: "Finalize (Post)", save: "SaleTrnHdr/Dtl", icon: "💾" },
      { step: "Settle", pick: "POSCashTrn", action: "Tender Logic", save: "AccTrnHdr", icon: "💰" },
    ],
    mappings: [
      { field: "bill_no", legacy: "SaleTrnHdr.DocNo", smriti: "bills.bill_no", attributes: "invno, billno", type: "Identity" },
      { field: "bill_dt", legacy: "SaleTrnHdr.DocTime", smriti: "bills.created_at", attributes: "invdt, date", type: "DateTime" },
      { field: "stock_no", legacy: "ItemMaster.StockNo", smriti: "inventory.sku", attributes: "barcode, itemcode", type: "Identity" },
      { field: "rate", legacy: "ItemMaster.Retail_Price", smriti: "bill_items.unit_price", attributes: "mrp, unitprice", type: "Currency" },
      { field: "qty", legacy: "SaleTrnDtl.Qty", smriti: "bill_items.qty", attributes: "quantity, docqty", type: "Quantity" },
      { field: "grid_mask", legacy: "AcceptDisplayDtls", smriti: "GridConfig", attributes: "layout, columns", type: "Metadata" },
      { field: "draft_id", legacy: "ExpectedTrnDtls", smriti: "draft_bills", attributes: "temp_id", type: "Draft" },
    ],
    rules: [
      "InBillingCustSelectionCompulsary (1 = Mandatory Customer)",
      "SMSelectionCompulsary (1 = Mandatory Salesman)",
      "PONetValueRndOff (1 = Round to nearest Rupee)",
    ],
  },
  inventory: {
    title: "Inventory & Catalogue Registry",
    description: "Product master data, barcode standards, and stock intelligence.",
    tables: ["itemmaster", "stockmaster", "barcodemaster"],
    workflow: [
      { step: "Import", pick: "Excel/API", action: "Catalogue Inward", save: "itemmaster.temp", icon: "📥" },
      { step: "Validate", pick: "itemmaster", action: "Data Scrubbing", save: "itemmaster.clean", icon: "🛡️" },
      { step: "Standardize", pick: "GS1/Hsn", action: "HSN Linkage", save: "itemmaster.hsn", icon: "🏷️" },
      { step: "Generate", pick: "sku_logic", action: "Barcode Gen", save: "barcodemaster", icon: "🖨️" },
      { step: "Initialize", pick: "physical", action: "Opening Stock", save: "stockmaster", icon: "📦" },
      { step: "Audit", pick: "stockmaster", action: "Valuation", save: "stock_ledger", icon: "🔍" },
    ],
    mappings: [
      { field: "stock_no", legacy: "itemmaster.stockno", smriti: "inventory.sku", attributes: "sku, item_code", type: "Primary Key" },
      { field: "descr", legacy: "itemmaster.itemdesc", smriti: "inventory.name", attributes: "itemname, description", type: "Text" },
      { field: "mrp", legacy: "itemmaster.mrp", smriti: "inventory.mrp", attributes: "retail_price", type: "Currency" },
      { field: "cost_price", legacy: "itemmaster.unitcost", smriti: "inventory.cost_price", attributes: "costrate", type: "Currency" },
      { field: "stock_qty", legacy: "stockmaster.curbalqty", smriti: "inventory.stock_qty", attributes: "qty, stock", type: "Integer" },
    ],
    rules: [
      "StockOutActionInBill (0 = Block, 1 = Warn, 2 = Allow)",
      "NegativeStockAllow (0 = No, 1 = Yes)",
    ],
  },
  finance: {
    title: "Fiscal & Compliance Bridge",
    description: "GST registers, HSN mapping, and Tally XML accounting flows.",
    tables: ["taxdtl", "hsnmaster", "taxmaster"],
    workflow: [
      { step: "Extract", pick: "stktrndtl", action: "Sales Extract", save: "tax_registers", icon: "📊" },
      { step: "Map", pick: "hsnmaster", action: "Compliance Check", save: "gstr1_report", icon: "🗺️" },
      { step: "Calculate", pick: "taxper", action: "Tax Split", save: "tax_audit_vault", icon: "🧮" },
      { step: "Reconcile", pick: "poscash", action: "Cash Recon", save: "accounts_master", icon: "💸" },
      { step: "Format", pick: "TallySchema", action: "XML Generation", save: "export_queue", icon: "📄" },
      { step: "Transmit", pick: "ExportQueue", action: "Head Office Sync", save: "ho_server", icon: "📡" },
    ],
    mappings: [
      { field: "hsn_code", legacy: "itemmaster.hsn", smriti: "inventory.hsn_code", attributes: "sac_code", type: "Compliance" },
      { field: "gst_rate", legacy: "taxdtl.taxper", smriti: "inventory.gst_rate", attributes: "tax_per", type: "Percentage" },
      { field: "cgst", legacy: "stktrndtl.cgst_amt", smriti: "bill_items.cgst_amount", attributes: "cgst_amount", type: "Currency" },
      { field: "sgst", legacy: "stktrndtl.sgst_amt", smriti: "bill_items.sgst_amount", attributes: "sgst_amount", type: "Currency" },
    ],
    rules: [
      "GstComplianceVersion (Current: 2.1)",
      "TallyExportEnabled (1 = Yes)",
    ],
  },
  analytics: {
    title: "Business Intelligence & KPIs",
    description: "Sales drill-downs, stock velocity, and performance metrics.",
    tables: ["stktrnhdr", "auditlog"],
    workflow: [
      { step: "Stream", pick: "LiveBills", action: "Real-time Sync", save: "analytics_buffer", icon: "🌊" },
      { step: "Aggregate", pick: "stktrnhdr", action: "Daily Totals", save: "daily_sales", icon: "📉" },
      { step: "Compare", pick: "History", action: "YoY Variance", save: "kpi_registry", icon: "⚖️" },
      { step: "Predict", pick: "ML_Model", action: "Stock Velocity", save: "reorder_alerts", icon: "🔮" },
      { step: "Visualize", pick: "KpiRegistry", action: "Chart Render", save: "dashboard_cache", icon: "🖼️" },
      { step: "Distribute", pick: "Dashboard", action: "Email/Push", save: "mobile_app", icon: "📱" },
    ],
    mappings: [
      { field: "net_sales", legacy: "stktrnhdr.netvalue", smriti: "bills.total_amount", attributes: "total", type: "Currency" },
      { field: "footfall", legacy: "COUNT(stktrnhdr)", smriti: "Counter", attributes: "bill_count", type: "Integer", table: "Count(bills)" },
    ],
    rules: [
      "KpiRefreshInterval (Minutes: 15)",
    ],
  },
  system: {
    title: "System Registry & Schema Mapping",
    description: "Core configuration, store metadata, and license controls.",
    tables: ["sysparams", "showroommaster"],
    workflow: [
      { step: "Boot", pick: "env_vars", action: "Instance Init", save: "sys_state", icon: "🚀" },
      { step: "Config", pick: "sysparams", action: "Parameter Load", save: "runtime_ctx", icon: "⚙️" },
      { step: "Identify", pick: "showroom", action: "Store Binding", save: "stores.code", icon: "🆔" },
      { step: "Secure", pick: "Auth0/JWT", action: "Token Refresh", save: "session_vault", icon: "🔐" },
      { step: "Cache", pick: "Redis/Mem", action: "Warm Up", save: "global_cache", icon: "⚡" },
      { step: "Health", pick: "UptimeKuma", action: "Heartbeat", save: "monitoring_db", icon: "💓" },
    ],
    mappings: [
      { field: "store_code", legacy: "showroommaster.code", smriti: "stores.code", attributes: "storecd, branch", type: "Identity" },
      { field: "param_val", legacy: "sysparams.val", smriti: "sysparams.value", attributes: "value", type: "Variant" },
    ],
    rules: [
      "SovereignMode (1 = Local First)",
      "AutoBackupEnabled (1 = Yes)",
      "DataEncryption (AES-256)",
    ],
  },
  dictionary: {
    title: "Sovereign Lexicon",
    description: "Translation of legacy Shoper9 tables to SMRITI-OS sovereign identities.",
    component: <LegacyDictionary />
  }
};

const ArchitectExplorer: React.FC = () => {
  const { module } = useParams<{ module?: string }>();
  
  const currentModule = module ? SCHEMA_DATA[module] : null;

  if (module && !currentModule) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant">
        <div className="text-center">
          <Code2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-black uppercase">Module Not Found</h2>
          <Link to="/jawaharmallah" className="text-primary text-xs font-bold flex items-center justify-center gap-1 mt-4">
            <ArrowLeft className="w-3 h-3" /> BACK TO ARCHITECT ROOT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-surface text-on-surface font-sans overflow-hidden flex flex-col">
      {/* ── HEADER ── */}
      <header className="p-8 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Architect Explorer</h1>
            <p className="text-[10px] font-bold text-on-surface-variant tracking-[0.2em] mt-1 uppercase opacity-60">System Registry & Schema Mapping</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Lead Architect</p>
            <p className="text-sm font-black text-primary">JAWAHAR R MALLAH</p>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/30" />
          <ShieldCheck className="w-8 h-8 text-primary opacity-40" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ── SIDEBAR NAVIGATION ── */}
        <aside className="w-80 border-r border-outline-variant/30 bg-surface-container-lowest p-6 overflow-y-auto">
          <div className="mb-8">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em] mb-4">Core Modules</p>
            <div className="space-y-1">
              {Object.keys(SCHEMA_DATA).map(key => (
                <Link 
                  key={key}
                  to={`/jawaharmallah/${key}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all group",
                    module === key 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "hover:bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                    module === key ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary"
                  )}>
                    {key === 'billing' && <Database className="w-4 h-4" />}
                    {key === 'inventory' && <Layers className="w-4 h-4" />}
                    {key === 'finance' && <Workflow className="w-4 h-4" />}
                    {key === 'analytics' && <BarChart3 className="w-4 h-4" />}
                    {key === 'system' && <Settings className="w-4 h-4" />}
                    {key === 'dictionary' && <Book className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{SCHEMA_DATA[key].title.split(' ')[0]}</span>
                  <ChevronRight className={cn("w-3 h-3 ml-auto opacity-0 transition-opacity", module === key && "opacity-100")} />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-outline-variant/30">
            <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/50">
              <p className="text-[10px] font-black text-primary uppercase mb-1">Institutional Parity</p>
              <p className="text-[9px] text-on-surface-variant leading-relaxed">
                All mappings are synchronized with legacy Shoper 9 PostgreSQL attributes to ensure zero-loss data migration.
              </p>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-12 bg-surface">
          {!currentModule ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6 mx-auto border border-outline-variant">
                  <Code2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Select a Domain</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8 font-medium">
                  Select a module from the sidebar to inspect its underlying database schema, field mappings, and architectural business rules.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.keys(SCHEMA_DATA).map(key => (
                    <Link 
                      key={key} 
                      to={`/jawaharmallah/${key}`}
                      className="p-6 bg-surface-container-low border border-outline-variant/50 rounded-2xl hover:border-primary transition-all hover:shadow-xl hover:shadow-primary/5 group text-center"
                    >
                      <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        {key === 'billing' && <Database className="w-5 h-5" />}
                        {key === 'inventory' && <Layers className="w-5 h-5" />}
                        {key === 'finance' && <Workflow className="w-5 h-5" />}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">{key}</p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              key={module}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-5xl"
            >
              <div className="mb-12">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Live Registry
                </div>
                <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{currentModule.title}</h2>
                <p className="text-on-surface-variant text-lg font-medium max-w-2xl">{currentModule.description}</p>
              </div>

              {module === 'dictionary' ? (
                currentModule.component
              ) : (
                <>
                  {/* ── DATA FLOW PIPELINE ── */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Read Source (Pick)</span>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-black uppercase">shoper9 schema</span>
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant opacity-60 leading-tight">
                    Legacy Master Data, Stock Balances, and Personnel Registry.
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1 opacity-20">
                    <div className="w-px h-8 bg-on-surface" />
                    <span className="text-[8px] font-black uppercase tracking-tighter italic">Processing Bridge</span>
                    <div className="w-px h-8 bg-on-surface" />
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Write Target (Save)</span>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-black uppercase">public schema</span>
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant opacity-60 leading-tight">
                    Sovereign Audit Trail, Finalized Bills, and Fiscal Snapshots.
                  </p>
                </div>
              </div>

              {/* ── TRANSACTION LIFECYCLE (WORKFLOW) ── */}
              {currentModule.workflow && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-surface-container-highest rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Operational Lifecycle Blueprint</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {currentModule.workflow.map((w: any, idx: number) => (
                      <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 flex flex-col gap-2 relative group hover:border-primary/50 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px]">{w.icon}</span>
                          <span className="text-[8px] font-black opacity-20 italic">0{idx + 1}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-primary tracking-tighter">{w.step}</span>
                          <span className="text-[11px] font-bold leading-tight">{w.action}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-outline-variant/20 flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <ArrowUpRight className="w-2 h-2 text-blue-500" />
                            <span className="text-[8px] font-black text-blue-600 uppercase">Pick: {w.pick}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ArrowDownRight className="w-2 h-2 text-green-500" />
                            <span className="text-[8px] font-black text-green-600 uppercase">Save: {w.save}</span>
                          </div>
                        </div>
                        {idx < currentModule.workflow.length - 1 && (
                          <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 opacity-20">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FIELD MAPPINGS ── */}
                <div className="space-y-4">
                  {Object.entries(
                    currentModule.mappings.reduce((acc: any, m: any) => {
                      const tableName = m.legacy.includes('.') ? m.legacy.split('.')[0] : 'LOGIC';
                      if (!acc[tableName]) acc[tableName] = [];
                      acc[tableName].push(m);
                      return acc;
                    }, {})
                  ).map(([tableName, mappings]: [string, any]) => (
                    <div key={tableName} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low/30 border-b border-outline-variant/20">
                            <th className="p-3 text-[9px] font-black uppercase tracking-widest opacity-40 w-1/2">FROM SOURCE (PICK)</th>
                            <th className="p-3 text-[9px] font-black uppercase tracking-widest opacity-40 w-1/2">TO SAVE (FINAL)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {mappings.map((m: any, i: number) => (
                            <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-on-surface">
                                    {m.legacy.split('.')[1] || m.legacy}
                                  </span>
                                  <span className="text-[9px] font-bold text-blue-600/60 uppercase">
                                    shoper9.{m.legacy.split('.')[0] || 'logic'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-primary">
                                    {m.smriti.split('.')[1] || m.smriti}
                                  </span>
                                  <span className="text-[9px] font-bold text-green-600/60 uppercase">
                                    public.{m.smriti.split('.')[0] || 'modern'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>

              <div className="grid grid-cols-2 gap-8">
                {/* ── LINKED TABLES ── */}
                <div className="p-8 bg-surface-container-high rounded-3xl border border-outline-variant/30">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Linked SQL Tables</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentModule.tables.map((t: string) => (
                      <div key={t} className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant/50 group hover:border-primary transition-colors cursor-default">
                        <Database className="w-3 h-3 text-on-surface-variant group-hover:text-primary" />
                        <span className="text-xs font-black text-on-surface-variant group-hover:text-on-surface">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── ARCHITECTURAL RULES ── */}
                <div className="p-8 bg-surface-container-high rounded-3xl border border-outline-variant/30">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">System Parameters (Rules)</h4>
                  <div className="space-y-3">
                    {currentModule.rules.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-primary">{i + 1}</span>
                        </div>
                        <p className="text-xs font-bold text-on-surface-variant leading-tight">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
            )}
            </motion.div>
          )}
        </main>
      </div>

      {/* ── FOOTER STATS ── */}
      <footer className="p-4 bg-surface-container-highest border-t border-outline-variant/30 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
        <div className="flex gap-6">
          <span>Schema: Postgres 16</span>
          <span>Engine: SQLAlchemy 2.0</span>
          <span>Sovereignty Level: Tier 1</span>
        </div>
        <div>
          PrimeSetu Enterprise v2.4.0
        </div>
      </footer>
    </div>
  );
};

export default ArchitectExplorer;
