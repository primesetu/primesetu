import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  Database, 
  Search, 
  Download, 
  RefreshCw, 
  Table as TableIcon,
  ChevronRight,
  Filter,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

import { Button, Input, Card, Badge } from '@/components/ui/SovereignUI';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LegacyExplorer: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('itemmaster');
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'data' | 'schema'>('data');
  const [schema, setSchema] = useState<any[]>([]);

  // Fetch Available Tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE}/api/v1/legacy/tables`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await response.json();
        setTables(data);
      } catch (err) {
        console.error("Failed to fetch legacy tables", err);
      }
    };
    fetchTables();
  }, []);

  // Fetch Table Data & Schema
  const fetchData = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Authorization': `Bearer ${session?.access_token}` };

      // Data fetch
      const dataRes = await fetch(`${API_BASE}/api/v1/legacy/${selectedTable}?limit=100`, { headers });
      const dataJson = await dataRes.json();
      setRowData(dataJson.data);
      setTotalRows(dataJson.total);

      // Schema fetch
      const schemaRes = await fetch(`${API_BASE}/api/v1/legacy/${selectedTable}/schema`, { headers });
      const schemaJson = await schemaRes.json();
      setSchema(schemaJson.columns);

      // Dynamic Column Definitions for AG-Grid
      const cols = schemaJson.columns.map((c: any) => ({
        field: c.name,
        headerName: c.name.toUpperCase(),
        sortable: true,
        filter: true,
        resizable: true,
        pinned: c.primary_key ? 'left' : null,
        cellClass: c.primary_key ? 'font-mono font-bold text-[var(--accent)]' : '',
        width: c.name.length * 15 + 100
      }));
      setColumnDefs(cols);

    } catch (err) {
      console.error("Migration Audit Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable]);

  const onExport = () => {
    // Logic for CSV export could go here
  };

  return (
    <div className="p-[var(--space-6)] flex flex-col gap-[var(--space-6)] h-[calc(100vh-140px)]">
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Legacy Data Explorer</h1>
            <p className="text-[10px] text-[var(--text-secondary)] u-uppercase tracking-wider">
              Real-time Bridge to Shoper 9 Warehouse • {totalRows.toLocaleString()} Records Total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[var(--space-3)] bg-[var(--surface-raised)] p-1 rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
          <select 
            className="bg-transparent text-sm font-medium px-4 py-2 outline-none border-none text-[var(--text-primary)] min-w-[240px]"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            {tables.map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex gap-[var(--space-6)] overflow-hidden">
        {/* Left Stats Panel */}
        <div className="w-64 flex flex-col gap-[var(--space-4)]">
          <Card className="p-[var(--space-4)] border-l-4 border-l-[var(--accent)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] u-uppercase text-[var(--text-secondary)] font-bold">Active Table</span>
              <Badge variant="muted" className="bg-[var(--accent)]/5">{selectedTable}</Badge>
            </div>
            <div className="text-2xl font-bold font-mono">{totalRows.toLocaleString()}</div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">Total operational records</div>
          </Card>

          <div className="flex-1 bg-[var(--surface-subtle)]/50 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-[var(--space-4)] overflow-y-auto">
             <h3 className="text-[10px] u-uppercase font-bold text-[var(--text-secondary)] mb-[var(--space-4)] flex items-center gap-2">
               <Info size={12} /> Table Metadata
             </h3>
             <div className="flex flex-col gap-[var(--space-3)]">
                {schema.slice(0, 20).map(col => (
                  <div key={col.name} className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-[var(--text-primary)]">{col.name}</span>
                    <span className="text-[9px] text-[var(--text-secondary)] u-uppercase">{col.type.split('(')[0]}</span>
                  </div>
                ))}
                {schema.length > 20 && <div className="text-[9px] text-[var(--accent)] italic">+{schema.length - 20} more columns</div>}
             </div>
          </div>
        </div>

        {/* AG-Grid Content */}
        <Card className="flex-1 flex flex-col overflow-hidden relative border-[var(--border-subtle)] shadow-xl glass">
           <div className="ag-theme-alpine-dark w-full h-full">
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={{
                  flex: 1,
                  minWidth: 100,
                }}
                enableRangeSelection={true}
                pagination={true}
                paginationPageSize={50}
                animateRows={true}
                overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Bypassing Legacy Barriers...</span>'}
              />
           </div>
           
           {/* Floating Control Bar */}
           <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <Button size="sm" variant="secondary" className="shadow-lg backdrop-blur-md bg-white/10" onClick={onExport}>
                <Download size={14} className="mr-2" /> Export to CSV
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default LegacyExplorer;
