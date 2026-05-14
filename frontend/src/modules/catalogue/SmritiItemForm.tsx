/**
 * SMRITI-OS — SmritiItemForm
 * ============================================================
 * Sovereign new-item creation form with auto-populate intelligence.
 *
 * When user selects Brand × Category:
 *   → 7 fields auto-fill from Class12combo (81 rows)
 *   → Sub-brand dropdown filters to that combo
 *   → Sub-category dropdown filters to that combo
 *   → Size grid appears if combo has sizes
 *   → Batch/expiry fields appear if batch_mode > 0
 *
 * No hardcoding. Driven by useClassDefaults hook.
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Package, Zap, DollarSign, AlertTriangle, ChevronDown,
  Loader2, CheckCircle2, Sparkles, Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useClassDefaults,
  useClass1List,
  useClass2List,
  applyClassDefaultsToForm,
  type ClassDefaults,
} from "@/hooks/useClassDefaults";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ItemFormState {
  stockno: string;
  itemdesc: string;
  class1cd: string;
  class2cd: string;
  subclass1cd: string;
  subclass2cd: string;
  sizecd: string;
  retail_price: number | "";
  dealer_price: number | "";
  currentcost: number | "";
  prodtaxtype: string;
  rtlmarkup: number | "";
  dlrmarkup: number | "";
  prefvendorid: string;
  batchapplicable: number;
  gradeapplicable: number;
  locationapplicable: number;
  isbillable: boolean;
  isservice: boolean;
  isinventoryitem: boolean;
  regularind: string;
}

const INITIAL_FORM: ItemFormState = {
  stockno: "", itemdesc: "", class1cd: "", class2cd: "",
  subclass1cd: "", subclass2cd: "", sizecd: "",
  retail_price: "", dealer_price: "", currentcost: "",
  prodtaxtype: "", rtlmarkup: "", dlrmarkup: "", prefvendorid: "",
  batchapplicable: 0, gradeapplicable: 0, locationapplicable: 0,
  isbillable: true, isservice: false, isinventoryitem: true,
  regularind: "R",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function FormField({
  label, required, children, hint, autoFilled
}: {
  label: string; required?: boolean; children: React.ReactNode;
  hint?: string; autoFilled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
        {autoFilled && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-500/30">
            <Zap size={8} /> AUTO
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-[9px] text-white/30 font-medium">{hint}</p>}
    </div>
  );
}

function SovereignSelect({
  value, onChange, options, placeholder, disabled
}: {
  value: string; onChange: (v: string) => void;
  options: { code: string; descr: string }[];
  placeholder?: string; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5",
          "text-[11px] font-bold text-white appearance-none cursor-pointer",
          "focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        <option value="" className="bg-slate-900">{placeholder || "— Select —"}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code} className="bg-slate-900">
            {o.descr !== o.code ? `${o.code} · ${o.descr}` : o.code}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

function SovereignInput({
  value, onChange, placeholder, type = "text", readOnly, autoFilled
}: {
  value: string | number; onChange?: (v: string) => void;
  placeholder?: string; type?: string; readOnly?: boolean; autoFilled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={cn(
        "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5",
        "text-[11px] font-bold text-white placeholder:text-white/20",
        "focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all",
        autoFilled && "border-emerald-500/30 bg-emerald-500/5",
        readOnly && "opacity-60 cursor-not-allowed"
      )}
    />
  );
}

// ── Default Pill (shows what was auto-filled) ─────────────────────────────────

function AutoFillBadge({ defaults }: { defaults: ClassDefaults }) {
  const filled = [
    defaults.prod_tax_type && `Tax: ${defaults.prod_tax_type}`,
    defaults.retail_markup > 0 && `RTL Markup: ${defaults.retail_markup}%`,
    defaults.pref_vendor && `Vendor: ${defaults.pref_vendor}`,
    defaults.batch_mode > 0 && "Batch Tracked",
    defaults.size_group && `Sizes: ${defaults.size_options.length}`,
  ].filter(Boolean);

  if (!filled.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
    >
      <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">
          Auto-Populated from Classification DNA
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filled.map((label, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded border border-emerald-500/30"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SmritiItemForm({
  onSave, onCancel
}: {
  onSave?: (form: ItemFormState) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ItemFormState>(INITIAL_FORM);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // ── Class1 / Class2 cascading dropdowns ──────────────────────────────────
  const { options: class1Options, isLoading: class1Loading } = useClass1List();
  const { options: class2Options, isLoading: class2Loading } = useClass2List(form.class1cd);

  // ── Sovereign defaults engine ─────────────────────────────────────────────
  const {
    defaults,
    isLoading: defaultsLoading,
    hasSizeGrid,
    isBatchTracked,
  } = useClassDefaults(form.class1cd, form.class2cd);

  // ── Apply defaults when they arrive ──────────────────────────────────────
  useEffect(() => {
    if (!defaults || !defaults.found) return;

    setForm((prev) => {
      const merged = applyClassDefaultsToForm(prev, defaults);
      // Track which fields were auto-filled
      const newFilled = new Set<string>();
      if (merged.prodtaxtype !== prev.prodtaxtype) newFilled.add("prodtaxtype");
      if (merged.rtlmarkup !== prev.rtlmarkup) newFilled.add("rtlmarkup");
      if (merged.dlrmarkup !== prev.dlrmarkup) newFilled.add("dlrmarkup");
      if (merged.prefvendorid !== prev.prefvendorid) newFilled.add("prefvendorid");
      if (merged.batchapplicable !== prev.batchapplicable) newFilled.add("batchapplicable");
      if (merged.gradeapplicable !== prev.gradeapplicable) newFilled.add("gradeapplicable");
      if (merged.isbillable !== prev.isbillable) newFilled.add("isbillable");
      setAutoFilledFields(newFilled);
      return merged;
    });
  }, [defaults]);

  // ── Reset Class2/sub-fields when Class1 changes ───────────────────────────
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      class2cd: "",
      subclass1cd: "",
      subclass2cd: "",
      sizecd: "",
      prodtaxtype: "",
      rtlmarkup: "",
      dlrmarkup: "",
      prefvendorid: "",
    }));
    setAutoFilledFields(new Set());
  }, [form.class1cd]);

  // ── Reset sub-fields when Class2 changes ─────────────────────────────────
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      subclass1cd: "",
      subclass2cd: "",
      sizecd: "",
    }));
  }, [form.class2cd]);

  const setField = useCallback(<K extends keyof ItemFormState>(
    key: K,
    value: ItemFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Manual edit removes auto-fill marker
    setAutoFilledFields((prev) => {
      const next = new Set(prev);
      next.delete(key as string);
      return next;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(form);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#0a0f1e] rounded-2xl border border-white/5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <Package size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-[14px] font-black text-white uppercase tracking-widest">New Item</h2>
          <p className="text-[10px] text-white/40 font-bold">
            Sovereign creation — defaults auto-populate from Classification DNA
          </p>
        </div>
      </div>

      {/* Section 1: Identity */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Stock No" required>
          <SovereignInput
            value={form.stockno}
            onChange={(v) => setField("stockno", v)}
            placeholder="Auto or manual"
          />
        </FormField>
        <FormField label="Description" required>
          <SovereignInput
            value={form.itemdesc}
            onChange={(v) => setField("itemdesc", v)}
            placeholder="Item description"
          />
        </FormField>
      </div>

      {/* Section 2: Classification (The Intelligence Gate) */}
      <div className="flex flex-col gap-4 p-4 bg-white/3 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
            Classification — Intelligence Gate
          </span>
          {defaultsLoading && (
            <Loader2 size={12} className="animate-spin text-emerald-400 ml-auto" />
          )}
          {defaults?.found && !defaultsLoading && (
            <CheckCircle2 size={12} className="text-emerald-400 ml-auto" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product (Class 1)" required>
            <SovereignSelect
              value={form.class1cd}
              onChange={(v) => setField("class1cd", v)}
              options={class1Options}
              placeholder={class1Loading ? "Loading..." : "Select Product"}
              disabled={class1Loading}
            />
          </FormField>

          <FormField label="Brand (Class 2)" required hint={!form.class1cd ? "Select Product first" : ""}>
            <SovereignSelect
              value={form.class2cd}
              onChange={(v) => setField("class2cd", v)}
              options={class2Options}
              placeholder={
                !form.class1cd ? "Select Product first" :
                class2Loading ? "Loading..." : "Select Brand"
              }
              disabled={!form.class1cd || class2Loading}
            />
          </FormField>

          <FormField label="Sub-Brand (Style)">
            <SovereignSelect
              value={form.subclass1cd}
              onChange={(v) => setField("subclass1cd", v)}
              options={defaults?.subclass1_options || []}
              placeholder="Select Style"
              disabled={!form.class2cd}
            />
          </FormField>

          <FormField label="Sub-Category (Season)">
            <SovereignSelect
              value={form.subclass2cd}
              onChange={(v) => setField("subclass2cd", v)}
              options={defaults?.subclass2_options || []}
              placeholder="Select Season"
              disabled={!form.class2cd}
            />
          </FormField>
        </div>

        {/* Size selector — only shows when combo has sizes */}
        <AnimatePresence>
          {hasSizeGrid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <FormField
                label="Size"
                hint={`Size group: ${defaults?.size_group} · ${defaults?.size_options.length} sizes available`}
              >
                <div className="flex flex-wrap gap-2">
                  {defaults?.size_options.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => setField("sizecd", s.code)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all",
                        form.sizecd === s.code
                          ? "bg-indigo-500/30 text-indigo-300 border-indigo-500/50"
                          : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white"
                      )}
                    >
                      {s.descr}
                      {s.is_pivotal && (
                        <span className="ml-1 text-yellow-400">★</span>
                      )}
                    </button>
                  ))}
                </div>
              </FormField>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-fill badge */}
        <AnimatePresence>
          {defaults?.found && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AutoFillBadge defaults={defaults} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section 3: Pricing */}
      <div className="flex flex-col gap-4 p-4 bg-white/3 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-amber-400" />
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Pricing</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="MRP / Retail Price" required>
            <SovereignInput
              type="number"
              value={form.retail_price}
              onChange={(v) => setField("retail_price", v === "" ? "" : Number(v))}
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Dealer Price">
            <SovereignInput
              type="number"
              value={form.dealer_price}
              onChange={(v) => setField("dealer_price", v === "" ? "" : Number(v))}
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Cost Price">
            <SovereignInput
              type="number"
              value={form.currentcost}
              onChange={(v) => setField("currentcost", v === "" ? "" : Number(v))}
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Tax Code" autoFilled={autoFilledFields.has("prodtaxtype")}>
            <SovereignInput
              value={form.prodtaxtype}
              onChange={(v) => setField("prodtaxtype", v)}
              placeholder="GST5 / GST12..."
              autoFilled={autoFilledFields.has("prodtaxtype")}
            />
          </FormField>
          <FormField label="Retail Markup %" autoFilled={autoFilledFields.has("rtlmarkup")}>
            <SovereignInput
              type="number"
              value={form.rtlmarkup}
              onChange={(v) => setField("rtlmarkup", v === "" ? "" : Number(v))}
              placeholder="0"
              autoFilled={autoFilledFields.has("rtlmarkup")}
            />
          </FormField>
          <FormField label="Dealer Markup %" autoFilled={autoFilledFields.has("dlrmarkup")}>
            <SovereignInput
              type="number"
              value={form.dlrmarkup}
              onChange={(v) => setField("dlrmarkup", v === "" ? "" : Number(v))}
              placeholder="0"
              autoFilled={autoFilledFields.has("dlrmarkup")}
            />
          </FormField>
        </div>
      </div>

      {/* Section 4: Vendor & Tracking */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Preferred Vendor" autoFilled={autoFilledFields.has("prefvendorid")}>
          <SovereignInput
            value={form.prefvendorid}
            onChange={(v) => setField("prefvendorid", v)}
            placeholder="Vendor code"
            autoFilled={autoFilledFields.has("prefvendorid")}
          />
          {defaults?.alt_vendors && defaults.alt_vendors.length > 0 && (
            <p className="text-[9px] text-white/30 mt-1">
              Alt vendors: {defaults.alt_vendors.join(", ")}
            </p>
          )}
        </FormField>

        <FormField label="Item Type">
          <div className="flex gap-2">
            {[
              { key: "isbillable",     label: "Billable" },
              { key: "isinventoryitem", label: "Inventory" },
              { key: "isservice",      label: "Service" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setField(key as any, !(form as any)[key])}
                className={cn(
                  "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                  (form as any)[key]
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-white/5 text-white/30 border-white/10"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      {/* Section 5: Batch Tracking (conditional) */}
      <AnimatePresence>
        {isBatchTracked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">
                  Batch Tracking Active
                </div>
                <p className="text-[10px] text-white/60 font-medium">
                  This classification requires batch/expiry tracking.
                  {defaults?.stop_sale_days && defaults.stop_sale_days > 0 && (
                    <> Sales will be blocked <strong className="text-amber-300">{defaults.stop_sale_days} days</strong> before expiry.</>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 h-10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving || !form.stockno || !form.class1cd || !form.class2cd}
          className={cn(
            "px-8 h-10 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
            "bg-emerald-600 hover:bg-emerald-500 text-white",
            "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
            "flex items-center gap-2"
          )}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
          Create Item
        </button>
      </div>
    </div>
  );
}
