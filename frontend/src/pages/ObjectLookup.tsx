/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * ObjectLookup Manager — "The S9 Universal Dictionary"
 * ============================================================
 * Mapping: Genlookup (recid, code, descr, flag, number)
 * ============================================================ */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  Plus, Save, RefreshCw, Trash2, Search, Filter, 
  ChevronRight, Database, HardDrive, ShieldCheck, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { AllCommunityModule, ModuleRegistry, ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

// S9 GenLookup Categories (Common RecIds)
/**
 * RECID_MAP — Maps Genlookup RecId → human-readable label.
 * Derived from live GKP store SysParam (Retail_tmp.txt — 829 rows).
 * RecIds 1-2: Item Classification (Class1/Class2)
 * RecIds 51-54: Super-Classification, Size Group, Tax Type
 * RecIds 55-64: Customer Classifications 1-5 + Customer Profiles 1-5
 * RecIds 65-69: Item Analysis Codes 1-5 (Fibre, Finish, ColourBase, Styling, Usage)
 * RecIds 7000+: Extended analysis codes, Grade, Location, HSN, Vendor
 */
const RECID_MAP: Record<number, string> = {
  // ── Item Classification ──────────────────────────────────────────
  1: 'Product (Class1)',
  2: 'Brand (Class2)',
  // ── Super Classification ─────────────────────────────────────────
  51: 'Department (SuperClass1)',
  52: 'Buyer (SuperClass2)',
  // ── Size & Tax ───────────────────────────────────────────────────
  53: 'Size Group',
  54: 'Product Tax Type',
  // ── Customer Classifications (CustClass1RecId=55..CustClass5RecId=59) ──
  55: 'Religion (CustClass1)',
  56: 'Ethnicity (CustClass2)',
  57: 'Age Group (CustClass3)',
  58: 'Profession (CustClass4)',
  59: 'Type (CustClass5)',
  // ── Customer Profiles (CustProfile1RecId=60..CustProfile5RecId=64) ──
  60: 'Customer Profile 1',
  61: 'Customer Profile 2',
  62: 'Customer Profile 3',
  63: 'Customer Profile 4',
  64: 'Customer Profile 5',
  // ── Item Analysis Codes (ItemAnaCd1RecId=65..ItemAnaCd5RecId=69) ─
  65: 'Fibre (AC1)',
  66: 'Finish (AC2)',
  67: 'Colour Base (AC3)',
  68: 'Styling (AC4)',
  69: 'Usage (AC5)',
  // ── Extended Analysis Codes (7000+) ──────────────────────────────
  7026: 'HSN Code (AC32)',
  7030: 'Grade',
  7031: 'Location',
  7034: 'Vendor Group',
  // ── POS / Payment ────────────────────────────────────────────────
  11: 'Pay Mode Category',
  12: 'Tender Type',
};

const ObjectLookup: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecId, setSelectedRecId] = useState<number>(1);
  const [modified, setModified] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const gridRef = React.useRef<any>(null);

  // Auto-clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle local searching
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption('quickFilterText', searchTerm);
    }
  }, [searchTerm]);

  // ── Data Fetching ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.legacy.getData("Genlookup", { 
        filters: JSON.stringify({ recid: selectedRecId }),
        limit: 1000
      });
      
      if (response && response.data) {
        setRows(response.data.map((r: any) => ({
          ...r,
          id: `${r.recid}-${r.code}` 
        })));
      }
      setModified(new Set());
    } catch (err: any) {
      setToast({ msg: "Failed to load lookup data", ok: false });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedRecId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Grid Config ─────────────────────────────────────────────
  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      field: 'code', 
      headerName: 'Code', 
      editable: (params) => params.data.id.includes('NEW'), // Only editable for new rows
      flex: 1,
      cellStyle: { fontWeight: 'bold', color: 'var(--primary)' }
    },
    { 
      field: 'descr', 
      headerName: 'Description', 
      editable: true, 
      flex: 2 
    },
    { 
      field: 'flag', 
      headerName: 'Flag', 
      editable: true, 
      width: 100 
    },
    { 
      field: 'number', 
      headerName: 'Value (Num)', 
      editable: true, 
      width: 120,
      valueFormatter: (p) => p.value || 0
    },
    {
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        return (
          <button 
            onClick={() => handleDelete(params.data)}
            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
            title="Delete Record"
          >
            <Trash2 size={14} />
          </button>
        );
      }
    }
  ], [selectedRecId]);

  const onCellValueChanged = useCallback((params: any) => {
    if (params.oldValue !== params.newValue) {
      setModified(prev => new Set(prev).add(params.data.id));
    }
  }, []);

  // ── Actions ────────────────────────────────────────────────
  const handleDelete = async (data: any) => {
    if (!data.code) {
      // If it's a blank new row, just remove from local state
      setRows(prev => prev.filter(r => r.id !== data.id));
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${data.code}? This will check for dependencies first.`)) return;

    try {
      setLoading(true);
      const filters = JSON.stringify({ recid: data.recid, code: data.code });
      await api.legacy.deleteRecord("Genlookup", filters);
      setToast({ msg: `Successfully deleted ${data.code}`, ok: true });
      loadData();
    } catch (err: any) {
      setToast({ msg: err.response?.data?.detail || "Delete failed", ok: false });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newRow = {
      recid: selectedRecId,
      code: '',
      descr: '',
      flag: '',
      number: 0,
      id: `${selectedRecId}-NEW-${Math.random()}`
    };
    setRows(prev => [newRow, ...prev]);
    // Focus the new row? AG Grid focus API is complex, we'll skip for now.
  };

  const handleSave = async () => {
    const itemsToSave = rows.filter(r => modified.has(r.id));
    if (itemsToSave.length === 0) return;

    // Validation
    const invalid = itemsToSave.find(item => !item.code);
    if (invalid) {
      setToast({ msg: "Error: Code is required for all records", ok: false });
      return;
    }

    try {
      setLoading(true);
      // Clean data for backend (remove our temporary frontend ID)
      const cleaned = itemsToSave.map(({ id, ...rest }) => rest);
      
      await api.legacy.bulkUpdate("Genlookup", cleaned);
      setToast({ msg: `${itemsToSave.length} records synchronized`, ok: true });
      loadData();
    } catch (err: any) {
      setToast({ msg: "Save failed: " + err.message, ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[var(--text-primary)] u-uppercase">
              Object Lookup
            </h1>
            <p className="text-[10px] text-[var(--text-tertiary)] font-mono tracking-widest u-uppercase">
              SMRITI Master Dictionary • RecId: {selectedRecId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text"
              placeholder="Search dictionary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--background)] border border-[var(--border-subtle)] rounded-md text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all w-[240px]"
            />
          </div>

          <div className="h-6 w-px bg-[var(--border-subtle)] mx-2" />

          <select 
            value={selectedRecId}
            onChange={(e) => setSelectedRecId(Number(e.target.value))}
            className="px-3 py-2 bg-[var(--background)] border border-[var(--border-subtle)] rounded-md text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all min-w-[200px]"
          >
            {Object.entries(RECID_MAP).map(([id, label]) => (
              <option key={id} value={id}>{label} ({id})</option>
            ))}
          </select>

          <div className="h-6 w-px bg-[var(--border-subtle)] mx-2" />

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--surface-elevated)] hover:bg-[var(--primary)] hover:text-white transition-all text-xs font-bold border border-[var(--border-subtle)]"
          >
            <Plus size={14} /> Add New
          </button>

          <button
            onClick={handleSave}
            disabled={modified.size === 0 || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-black u-uppercase tracking-widest shadow-lg ${
              modified.size > 0 
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white scale-105' 
                : 'bg-[var(--surface-elevated)] text-[var(--text-tertiary)] opacity-50'
            }`}
          >
            <Save size={14} /> {loading ? 'Syncing...' : 'Sync Changes'}
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-md hover:bg-[var(--surface-elevated)] text-[var(--text-tertiary)] transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="px-4 py-1.5 bg-[var(--primary)]/5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-[9px] font-black u-uppercase tracking-widest text-[var(--text-secondary)]">
              Sovereign Node Active
            </span>
          </div>
          <div className="text-[9px] font-bold text-[var(--text-tertiary)] flex items-center gap-1">
            <ShieldCheck size={10} /> Tenant Isolated: <span className="text-[var(--primary)]">SMRITI-PROD</span>
          </div>
        </div>
        <div className="text-[9px] font-black text-[var(--text-tertiary)] u-uppercase tracking-tighter">
          {rows.length} Definitions Loaded • {modified.size} Pending Sync
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 ag-theme-smriti-dark">
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          animateRows={true}
          rowSelection="multiple"
          headerHeight={32}
          rowHeight={36}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true
          }}
          overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Accessing SMRITI Vault...</span>'}
        />
      </div>

      {/* ── Footer ── */}
      <div className="p-3 bg-[var(--surface)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-4 text-[var(--text-tertiary)] font-mono">
          <span>TABLE: SMRITI.genlookup</span>
          <span>SCHEMA: v3.0-SOVEREIGN</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 text-[var(--accent)] font-bold">
             <HardDrive size={10} /> Local Node
           </div>
        </div>
      </div>

      {/* ── Toast Overlay ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              toast.ok 
                ? 'bg-emerald-500/90 text-white border-emerald-400' 
                : 'bg-rose-500/90 text-white border-rose-400'
            }`}
          >
            {toast.ok ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-black u-uppercase tracking-wider">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ObjectLookup;
