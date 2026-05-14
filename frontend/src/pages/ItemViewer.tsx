/* ============================================================
 * SMRITI-OS — Item Audit Viewer
 * "High-Velocity Master Intelligence."
 * ============================================================ */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  ModuleRegistry, AllCommunityModule, themeQuartz 
} from 'ag-grid-community';
import { 
  Search, Filter, Calendar, Download, RefreshCw, 
  Database, Tag, Info, AlertCircle, Clock, Layers, Briefcase, ExternalLink
} from 'lucide-react';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';

ModuleRegistry.registerModules([AllCommunityModule]);

const smritiTheme = themeQuartz.withParams({
  backgroundColor: "#020617",
  foregroundColor: "rgba(255,255,255,0.82)",
  headerBackgroundColor: "#0f172a",
  headerTextColor: "rgba(255,255,255,0.5)",
  headerFontWeight: 700,
  headerFontSize: 10,
  rowHoverColor: "#1e293b",
  selectedRowBackgroundColor: "#1e3a5f",
  oddRowBackgroundColor: "#020f1f",
  borderColor: "rgba(255,255,255,0.06)",
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  rowHeight: 36,
  headerHeight: 40,
});

import { useWindowStore } from '@/store/useWindowStore';

export default function ItemViewer() {
  const { openWindow } = useWindowStore();
  const [rowData, setRowData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(500);
  // Default to last 30 days
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [fClass1, setFClass1] = useState('');
  const [fClass2, setFClass2] = useState('');
  const [fSubClass1, setFSubClass1] = useState('');
  const [searchMode, setSearchMode] = useState<'local' | 'global'>('global');
  
  const gridRef = useRef<any>(null);

  const columnDefs = useMemo<any[]>(() => [
    { 
      headerName: "AUDIT INFO",
      children: [
        { field: 'dateinsert', headerName: 'Created On', width: 140, sort: 'desc', 
          valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleString() : '' },
        { field: 'lastupdateddate', headerName: 'Updated On', width: 140,
          valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleString() : '' },
      ]
    },
    {
      headerName: "IDENTIFICATION",
      children: [
        { field: 'stockno', headerName: 'Stock No', width: 150, filter: true, pinned: 'left' },
        { field: 'itemdesc', headerName: 'Description', width: 250, filter: true },
        { field: 'batchsrlno', headerName: 'Batch', width: 100 },
      ]
    },
    {
      headerName: "CLASSIFICATION",
      children: [
        { field: 'class1cd', headerName: 'Product', width: 120, filter: true },
        { field: 'class2cd', headerName: 'Brand', width: 120, filter: true },
        { field: 'subclass1cd', headerName: 'Style', width: 120, filter: true },
        { field: 'sizecd', headerName: 'Size', width: 80, filter: true },
      ]
    },
    {
      headerName: "PRICING & TAX",
      children: [
        { field: 'retail_price', headerName: 'MRP', width: 100, type: 'numericColumn', cellStyle: { color: '#fbbf24', fontWeight: 'bold' } },
        { field: 'dealer_price', headerName: 'Dealer', width: 100, type: 'numericColumn' },
        { field: 'prodtaxtype', headerName: 'GST Code', width: 100 },
      ]
    },
    {
        headerName: "SYSTEM FIELDS",
        children: [
            { field: 'vauid', headerName: 'User', width: 100 },
            { field: 'vatermid', headerName: 'Terminal', width: 100 },
        ]
    }
  ], []);

  const fetchItems = async (forceNoFilter = false) => {
    // [PRO OPTION] If in local mode, use AG Grid's instant filter instead of DB fetch
    if (searchMode === 'local' && !forceNoFilter) {
      gridRef.current?.api.setGridOption('quickFilterText', searchQuery);
      return;
    }

    setLoading(true);
    try {
      // Use our new >= operator for date filtering
      const filters: any = {};
      
      // LOGIC: If we are searching for something specific, bypass the date restriction
      const isSearchingSpecific = searchQuery || fClass1 || fClass2 || fSubClass1;
      
      if (dateFilter && !forceNoFilter && !isSearchingSpecific) {
        filters.dateinsert = `>= ${dateFilter} 00:00:00`;
      }
      
      if (fClass1) filters.class1cd = fClass1;
      if (fClass2) filters.class2cd = fClass2;
      if (fSubClass1) filters.subclass1cd = fSubClass1;

      const res = await api.legacy.getData('itemmaster', { 
        limit: pageSize,
        offset: page * pageSize,
        filters: JSON.stringify(filters),
        search: searchQuery || undefined
      });
      setRowData(res.data);
      setTotalRows(res.total || 0);
    } catch (e: any) {
      console.error("Fetch failed", e);
      alert("Error: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [dateFilter, fClass1, fClass2, fSubClass1, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [dateFilter, fClass1, fClass2, fSubClass1, searchQuery, page, pageSize]);

  const onFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handlePopout = () => {
    openWindow('Item Audit (Popout)', 'item-viewer');
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] text-white">
      {/* --- HEADER BAR --- */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f172a]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Item Audit Viewer</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest">Master Data Surveillance</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text"
              placeholder="Search StockNo / Desc..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
              value={searchQuery}
              onChange={onFilterTextChange}
            />
          </form>

          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
            <Calendar className="w-4 h-4 text-white/30 ml-2" />
            <input 
              type="date"
              className="bg-transparent border-none text-sm text-white/80 focus:outline-none p-1"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <button 
            onClick={() => fetchItems(true)}
            className="px-3 py-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg hover:bg-indigo-500/30 transition-all border border-indigo-500/30"
          >
            VIEW ALL
          </button>

          <button 
            onClick={() => fetchItems()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-5 h-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
          </button>

          <button 
            onClick={handlePopout}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
            title="Popout Window"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- FILTER RIBBON --- */}
      <div className="flex items-center gap-4 px-6 py-2 border-b border-white/5 bg-[#0f172a]/30">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-white/30" />
          <input 
            placeholder="Filter Product..."
            className="bg-white/5 border border-white/10 rounded px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
            value={fClass1}
            onChange={(e) => setFClass1(e.target.value.toUpperCase())}
          />
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-white/30" />
          <input 
            placeholder="Filter Brand..."
            className="bg-white/5 border border-white/10 rounded px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
            value={fClass2}
            onChange={(e) => setFClass2(e.target.value.toUpperCase())}
          />
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-white/30" />
          <input 
            placeholder="Filter Style..."
            className="bg-white/5 border border-white/10 rounded px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
            value={fSubClass1}
            onChange={(e) => setFSubClass1(e.target.value.toUpperCase())}
          />
        </div>
        
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/10 ml-4">
          <button 
            onClick={() => setSearchMode('local')}
            className={cn("px-2 py-1 text-[9px] font-bold rounded transition-all", searchMode === 'local' ? "bg-indigo-500 text-white shadow-lg" : "text-white/30 hover:text-white/60")}
          >
            LOCAL VIEW
          </button>
          <button 
            onClick={() => setSearchMode('global')}
            className={cn("px-2 py-1 text-[9px] font-bold rounded transition-all", searchMode === 'global' ? "bg-indigo-500 text-white shadow-lg" : "text-white/30 hover:text-white/60")}
          >
            GLOBAL DB
          </button>
        </div>

        <button 
          onClick={() => {
            setFClass1(''); setFClass2(''); setFSubClass1(''); setSearchQuery('');
            fetchItems(true);
          }}
          className="ml-auto text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
        >
          Reset All Filters
        </button>
      </div>

      {/* --- GRID AREA --- */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs font-medium text-white/50 tracking-widest uppercase">Fetching Sovereign Data...</span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 p-4">
          <div className="w-full h-full rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <AgGridReact
              ref={gridRef}
              theme={smritiTheme}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100,
              }}
              animateRows={true}
              pagination={true}
              paginationPageSize={100}
              enableCellTextSelection={true}
              overlayNoRowsTemplate="No items found for this date/search."
            />
          </div>
        </div>
      </div>

      {/* --- STATUS BAR --- */}
      <div className="px-6 py-2 border-t border-white/5 bg-[#0f172a]/80 flex items-center justify-between text-[10px] text-white/30 font-medium uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sovereign Node Active</span>
          </div>
          <span>|</span>
          <span>Records: {rowData.length} of {totalRows.toLocaleString()}</span>
          <span>|</span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded"
            >
              Prev
            </button>
            <span className="text-indigo-400 font-bold">Page {page + 1}</span>
            <button 
              disabled={(page + 1) * pageSize >= totalRows} 
              onClick={() => setPage(p => p + 1)}
              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded"
            >
              Next
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Schema: Shoper9.ItemMaster</span>
          <span>|</span>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>Local DB: smriti_local</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("animate-spin", className)} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
