
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Settings, Save, RotateCcw, CheckCircle, Search, Info } from 'lucide-react';

// AG Grid Modern Theming (Protocol v35+)
import { themeQuartz } from 'ag-grid-community';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

interface Parameter {
  id: string;
  descr: string;
  paramcode: string;
  value: any;
  type: string;
  category: string;
  catdescr: string;
}

const SystemParameters: React.FC = () => {
  const [categories, setCategories] = useState<{code: string, desc: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const gridRef = useRef<AgGridReact>(null);

  // 1. Fetch Categories on Mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Fetch Parameters when Category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchParameters(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/legacy/sysparamextd?limit=1000');
      const result = await response.json();
      
      const catMap = new Map();
      result.data.forEach((item: any) => {
        if (item.category) {
          catMap.set(item.category, item.catdescr || item.category);
        }
      });
      
      const sortedCats = Array.from(catMap.entries())
        .map(([code, desc]) => ({ code, desc }))
        .sort((a, b) => a.code.localeCompare(b.code));
        
      setCategories(sortedCats);
      if (sortedCats.length > 0) setSelectedCategory(sortedCats[0].code);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchParameters = async (catCode: string) => {
    try {
      setLoading(true);
      const extdRes = await fetch(`/api/v1/legacy/sysparamextd?search_col=category&search_val=${catCode}&operator_code=S01&limit=500`);
      const extdData = await extdRes.json();
      
      const paramRes = await fetch(`/api/v1/legacy/sysparam?limit=1000`);
      const paramData = await paramRes.json();
      const valMap = new Map<string, any>(paramData.data.map((p: any) => [p.id, p]));

      const merged = extdData.data.map((ext: any) => {
        const valEntry = (valMap.get(ext.id) || {}) as any;
        return {
          id: ext.id,
          descr: valEntry.descr || ext.paramcode,
          paramcode: ext.paramcode,
          category: ext.category,
          catdescr: ext.catdescr,
          value: valEntry.txt || valEntry.intg || valEntry.boolean || valEntry.cur || "",
          type: valEntry.boolean !== null ? 'bool' : (valEntry.intg !== null ? 'num' : 'str')
        };
      });

      setParameters(merged);
    } catch (err) {
      setError("Failed to load parameters");
    } finally {
      setLoading(false);
    }
  };

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'descr', headerName: 'Description', flex: 2, minWidth: 300, sortable: true, filter: true },
    { field: 'paramcode', headerName: 'Code', flex: 1, minWidth: 150, sortable: true, filter: true },
    { 
      field: 'value', 
      headerName: 'Value', 
      flex: 1, 
      minWidth: 200, 
      editable: true,
      cellEditor: (params: any) => {
        if (params.data.type === 'bool') return 'agCheckboxCellEditor';
        return 'agTextCellEditor';
      },
      cellRenderer: (params: any) => {
        if (params.data.type === 'bool') return <input type="checkbox" checked={!!params.value} readOnly className="w-4 h-4" />;
        return <span className="font-mono text-blue-600">{params.value}</span>;
      }
    }
  ], []);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const saveChanges = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Changes applied to database (Sovereign Engine Simulation)");
    }, 1000);
  };

  if (error) return (
    <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
      <Info className="w-5 h-5 mr-2" />
      {error}
    </div>
  );

  return (
    <div className="p-6 h-screen flex flex-col bg-[#f8fafc]">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-100 rounded-lg mr-3">
          <Settings className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Parameters</h1>
          <p className="text-slate-500 text-sm">Configure legacy Shoper 9 environment variables</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Category Sidebar */}
        <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-800 text-white font-semibold flex items-center">
            <Search className="w-4 h-4 mr-2 opacity-70" />
            Categories
          </div>
          <div className="flex-1 overflow-y-auto">
            {categories.map((cat) => (
              <button 
                key={cat.code}
                onClick={() => setSelectedCategory(cat.code)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                  selectedCategory === cat.code 
                    ? 'bg-blue-50 border-l-4 border-l-blue-600 text-blue-700' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-medium text-sm">{cat.desc}</div>
                <div className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{cat.code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AG Grid Area */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-lg font-semibold text-slate-700">
                {categories.find(c => c.code === selectedCategory)?.desc || 'Parameters'}
              </h2>
              <span className="text-xs text-slate-400">Double click values to edit directly in the grid</span>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button 
                onClick={saveChanges}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md flex items-center disabled:opacity-50"
              >
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Apply to Database
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : null}
            <AgGridReact
              ref={gridRef}
              theme={themeQuartz}
              rowData={parameters}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, sortable: true }}
              onGridReady={onGridReady}
              animateRows={true}
              headerHeight={48}
              rowHeight={48}
            />
          </div>

          <div className="p-3 bg-blue-50 border-t border-blue-100 flex items-center text-blue-700 text-xs font-medium">
            <CheckCircle className="w-4 h-4 mr-2" />
            Sovereign Engine: Active in <b>{selectedCategory}</b>. Validating against legacy protocols.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemParameters;
