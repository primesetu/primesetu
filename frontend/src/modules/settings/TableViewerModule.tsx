/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/client';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Database, Search, Table2, HardDrive, RefreshCw } from 'lucide-react';
import { Button, Input } from '@/components/ui/SovereignUI';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';

export default function TableViewerModule() {
  const { theme } = useTheme();
  const isInstitutional = theme === 'LIGHT';

  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableSchema, setTableSchema] = useState<any[]>([]);
  
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTable, setSearchTable] = useState('');
  const [searchData, setSearchData] = useState('');

  // 1. Fetch List of Tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoadingTables(true);
        const data = await api.legacy.listTables();
        setTables(data);
      } catch (err) {
        console.error("Failed to load tables", err);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, []);

  // 2. Fetch Schema and Data for Selected Table
  useEffect(() => {
    if (!selectedTable) return;

    const fetchTableInfo = async () => {
      try {
        setLoadingData(true);
        const schemaRes = await api.legacy.getSchema(selectedTable);
        console.log(`DEBUG: Schema for ${selectedTable}:`, schemaRes);
        setTableSchema(schemaRes.columns);

        const dataRes = await api.legacy.getData(selectedTable, { limit: 100 });
        console.log(`DEBUG: Data for ${selectedTable}:`, dataRes);
        setTableData(dataRes.data || []);
      } catch (err) {
        console.error("Failed to fetch table data", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchTableInfo();
  }, [selectedTable]);

  // 3. Direct AG Grid ColDef builder from schema
  const agColDefs = useMemo<ColDef[]>(() => {
    if (!tableSchema || tableSchema.length === 0) return [];
    return tableSchema.map(col => ({
      headerName: col.name.toUpperCase(),
      field: col.name,
      width: 150,
      cellClass: 'font-mono text-[11px]',
      headerClass: 'font-black text-[10px] uppercase tracking-widest',
      sortable: true,
      filter: true,
      resizable: true,
    } as ColDef));
  }, [tableSchema]);

  const filteredTables = tables.filter(t => t.toLowerCase().includes(searchTable.toLowerCase()));
  
  // Basic search across all string columns for data
  const filteredData = useMemo(() => {
    if (!searchData) return tableData;
    const lowerSearch = searchData.toLowerCase();
    return tableData.filter(row => {
      return Object.values(row).some(val => 
        val && String(val).toLowerCase().includes(lowerSearch)
      );
    });
  }, [tableData, searchData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Left Sidebar: Table List ── */}
      <div className={cn(
        "lg:col-span-1 rounded-[var(--radius-lg)] border flex flex-col overflow-hidden shadow-2xl",
        isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)] border-[var(--border-subtle)]/50"
      )}>
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--background)]/40">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
                 <Database size={16} />
              </div>
              <div>
                 <h2 className="text-xs font-black uppercase text-[var(--text-primary)]">Sovereign DB</h2>
                 <p className="text-[8px] font-black tracking-widest text-[var(--text-tertiary)] uppercase">{tables.length} Tables Loaded</p>
              </div>
           </div>
           
           <div className="relative">
             <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
             <Input 
               placeholder="SEARCH TABLES..." 
               className="pl-8 h-8 text-[9px] font-black uppercase shadow-none"
               value={searchTable}
               onChange={(e) => setSearchTable(e.target.value)}
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 tally-scrollbar">
          {loadingTables ? (
            <div className="p-4 text-center text-[10px] text-[var(--text-tertiary)]">Loading Schema...</div>
          ) : (
            filteredTables.map(table => (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-md transition-all flex items-center gap-3 group",
                  selectedTable === table 
                    ? "bg-[var(--accent)] text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                )}
              >
                <Table2 size={14} className={cn(
                  selectedTable === table ? "text-white" : "text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors"
                )} />
                <span className="text-[10px] font-black uppercase tracking-tight truncate">{table}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main Area: Data Grid ── */}
      <div className={cn(
        "lg:col-span-4 rounded-[var(--radius-lg)] border flex flex-col overflow-hidden shadow-2xl relative",
        isInstitutional ? "bg-[var(--background)] border-[var(--border-subtle)]" : "bg-[var(--surface-elevated)] border-[var(--border-subtle)]/50"
      )}>
        
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--surface-elevated)]/50 backdrop-blur-md z-10">
           <div className="flex items-center gap-4">
              <HardDrive size={24} className="text-[var(--text-tertiary)]" />
              <div>
                <h3 className="text-xl font-serif font-black uppercase text-[var(--text-primary)]">
                  {selectedTable ? selectedTable : 'No Table Selected'}
                </h3>
                <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mt-0.5">
                  {selectedTable ? `Viewing Top 100 Rows · ${tableSchema.length} Columns` : 'Select a table from the registry to view data'}
                </p>
              </div>
           </div>
           
           {selectedTable && (
             <div className="flex items-center gap-4">
               <div className="relative w-64">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                 <Input 
                   placeholder="SEARCH IN RESULTS..." 
                   className="pl-9 h-10 text-[10px] font-black uppercase"
                   value={searchData}
                   onChange={e => setSearchData(e.target.value)}
                 />
               </div>
               <Button 
                 variant="ghost" 
                 className="h-10 px-4 gap-2 text-[10px] font-black uppercase text-[var(--text-tertiary)] hover:text-[var(--accent)]"
                 onClick={() => setSelectedTable(selectedTable)} // Refetch
               >
                 <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} /> Refresh
               </Button>
             </div>
           )}
        </div>

        {/* Data Grid Area */}
        <div className="flex-1 overflow-hidden bg-[var(--background)] relative">
           {!selectedTable ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                <Database size={80} className="mb-6 text-[var(--text-tertiary)]" />
                <span className="text-sm font-black uppercase tracking-[0.5em] text-[var(--text-tertiary)]">Sovereign Data Explorer</span>
             </div>
           ) : loadingData ? (
             <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="animate-spin text-[var(--accent)] opacity-50" size={32} />
             </div>
           ) : (
             <div className="absolute inset-0">
                <AgGridReact
                  theme={themeQuartz}
                  rowData={filteredData}
                  columnDefs={agColDefs}
                  rowHeight={40}
                  headerHeight={36}
                  defaultColDef={{ sortable: true, filter: true, resizable: true }}
                  animateRows={true}
                  rowSelection={{ mode: 'singleRow' }}
                  overlayNoRowsTemplate='<div style="padding:32px;text-align:center;opacity:0.4;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.3em">No Records in Table</div>'
                />
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
