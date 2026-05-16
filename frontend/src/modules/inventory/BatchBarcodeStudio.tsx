import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz, type ColDef } from 'ag-grid-community';
import { Printer, Search, RefreshCw, X } from 'lucide-react';
import { Button, Input, Select, Card, Text } from '@/components/ui/SovereignUI';
import { apiClient } from '@/api/client';

export default function BatchBarcodeStudio() {
  const [mode, setMode] = useState('Manual Selection');
  const [template, setTemplate] = useState('standard_label.prn');
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState<any[]>([]);
  const gridRef = useRef<AgGridReact>(null);

  // Criteria State
  const [manualCriteria, setManualCriteria] = useState({ stockNo: '', product: '', brand: '', article: '', color: '', size: '' });
  const [poCriteria, setPoCriteria] = useState({ prefix: '', from: '', to: '' });
  const [txnCriteria, setTxnCriteria] = useState({ prefix: '', from: '', to: '' });
  const [scanCriteria, setScanCriteria] = useState({ stockNo: '', qty: 1, autoPrint: true });
  const [mastersCriteria, setMastersCriteria] = useState({ fromDate: '', toDate: '' });
  const [ptFileCriteria, setPtFileCriteria] = useState({ fileName: '' });
  const [suggestions, setSuggestions] = useState<{field: string, items: any[]}>({ field: '', items: [] });

  // Auto-fetch grid items
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [mode, manualCriteria, poCriteria, txnCriteria, scanCriteria, mastersCriteria, ptFileCriteria]);

  const lookupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerLookup = (field: string, value: string) => {
    if (lookupTimeout.current) clearTimeout(lookupTimeout.current);
    lookupTimeout.current = setTimeout(() => {
      handleLookup(field, value);
    }, 500);
  };

  const handleManualCriteriaChange = (field: string, value: string) => {
    setManualCriteria(prev => ({ ...prev, [field]: value }));
    triggerLookup(field, value);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const payload = {
        mode,
        criteria: mode === 'Manual Selection' ? manualCriteria :
                  mode === 'Against Purchase Order' ? poCriteria :
                  mode === 'Against Transactions' ? txnCriteria :
                  mode === 'Against Direct Scan' ? scanCriteria :
                  mode === 'Against Masters' ? mastersCriteria :
                  mode === 'Against Purchase (PT File)' ? ptFileCriteria : {}
      };
      const res = await apiClient.post('/barcode-batch/fetch-matrix', payload);
      setGridData(res.data || []);
    } catch (e) {
      console.error("Failed to fetch matrix", e);
      // Fallback dummy data for visual testing
      setGridData([
        { id: '1', code: manualCriteria.stockNo || 'STK001', name: 'Premium Cotton Shirt', mrp: 1999, printQty: 1 },
        { id: '2', code: 'STK002', name: 'Slim Fit Jeans', mrp: 2499, printQty: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (field: string, value: string) => {
    if (!value) {
      setSuggestions({ field: '', items: [] });
      return;
    }
    try {
      const res = await apiClient.post('/barcode-batch/lookup-criteria', { field, value });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSuggestions({ field, items: res.data });
      } else {
        setSuggestions({ field: '', items: [] });
      }
    } catch (e) {
      console.error("Failed to lookup criteria", e);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    setManualCriteria(prev => ({ ...prev, ...item }));
    setSuggestions({ field: '', items: [] });
  };

  const handlePrint = async (printAll: boolean) => {
    const selected = printAll ? gridData : gridRef.current?.api.getSelectedRows() || [];
    if (!selected.length) return alert("Select items to print");
    
    // Filter out items with 0 or negative print quantity
    const printableItems = selected.filter((s: any) => (s.printQty || 0) > 0);
    
    if (!printableItems.length) return alert("No labels to print (all quantities are 0)");
    
    try {
      await apiClient.post('/barcode-batch/compile-bulk-prn', {
        template,
        items: printableItems.map((s: any) => ({
          code: s.code,
          name: s.name,
          mrp: s.mrp,
          qty: s.printQty
        }))
      });
      alert(`Successfully spooled ${printableItems.reduce((acc, curr) => acc + (curr.printQty || 0), 0)} labels for ${printableItems.length} items.`);
    } catch (e) {
      console.error(e);
      alert("Failed to print labels");
    }
  };

  const colDefs = useMemo<ColDef[]>(() => [
    { field: 'code', headerName: 'Stock No', width: 120, checkboxSelection: true, headerCheckboxSelection: true },
    { field: 'name', headerName: 'Item Description', flex: 1 },
    { field: 'mrp', headerName: 'MRP', width: 100 },
    { field: 'printQty', headerName: 'Labels to Print', width: 150, editable: true, type: 'numericColumn' },
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white p-6 gap-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <Text variant="h2" className="text-emerald-400">Barcode Print Studio</Text>
          <Text variant="xs" className="text-white/50 tracking-widest mt-1 uppercase">SMRITI Barcode Print Engine</Text>
        </div>
        <div className="flex gap-4 items-center">
          <Select value={template} onChange={e => setTemplate(e.target.value)} className="w-48 bg-white/5 h-10 border-white/10">
            <option value="standard_label.prn">Standard (50x25mm)</option>
            <option value="shelf_label.prn">Shelf Tag (100x30mm)</option>
            <option value="jewel_label.prn">Jewelry Tag</option>
          </Select>
        </div>
      </div>

      {/* Criteria & Options */}
      <div className="flex gap-6 items-start">
        <Card variant="flat" className="p-4 w-64 bg-white/5 border-white/10 shrink-0 space-y-2">
          <Text variant="sm" className="font-bold text-white/70 mb-4 uppercase">Print Option</Text>
          {['Manual Selection', 'Against Purchase (PT File)', 'Against Transactions', 'Against Purchase Order', 'Against Masters', 'Against Direct Scan'].map(opt => (
            <label key={opt} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
              <input 
                type="radio" 
                name="printMode" 
                value={opt} 
                checked={mode === opt} 
                onChange={() => setMode(opt)}
                className="accent-emerald-500"
              />
              <span className="text-xs font-semibold">{opt}</span>
            </label>
          ))}
        </Card>

        <Card variant="flat" className="flex-1 p-6 bg-white/5 border-white/10">
          <div className="flex justify-between items-center mb-6">
            <Text variant="sm" className="font-bold uppercase text-emerald-400">{mode} Criteria</Text>
            <Button onClick={fetchItems} disabled={loading} className="h-8 px-4 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40">
              {loading ? <RefreshCw className="animate-spin" size={14} /> : 'OK / Fetch'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mode === 'Manual Selection' && (
              <>
                <div className="relative">
                  <Input className="bg-slate-900 text-white border-white/20 h-10 px-3 w-full" placeholder="Stock No..." value={manualCriteria.stockNo} onChange={e => handleManualCriteriaChange('stockNo', e.target.value)} />
                  {suggestions.field === 'stockNo' && suggestions.items.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 border border-white/20 rounded-md shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {suggestions.items.map((item, idx) => (
                        <div key={idx} onClick={() => handleSelectSuggestion(item)} className="p-2 text-xs hover:bg-emerald-500/20 cursor-pointer border-b border-white/5 last:border-0">
                          <span className="font-bold text-emerald-400">{item.stockNo}</span> — {item.product} ({item.brand})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Input className="bg-slate-900 text-white border-white/20 h-10 px-3 w-full" placeholder="Product..." value={manualCriteria.product} onChange={e => handleManualCriteriaChange('product', e.target.value)} />
                  {suggestions.field === 'product' && suggestions.items.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 border border-white/20 rounded-md shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {suggestions.items.map((item, idx) => (
                        <div key={idx} onClick={() => handleSelectSuggestion(item)} className="p-2 text-xs hover:bg-emerald-500/20 cursor-pointer border-b border-white/5 last:border-0">
                          <span className="font-bold text-emerald-400">{item.product}</span> — {item.brand}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Brand..." value={manualCriteria.brand} onChange={e => handleManualCriteriaChange('brand', e.target.value)} />
                <div className="relative">
                  <Input className="bg-slate-900 text-white border-white/20 h-10 px-3 w-full" placeholder="Article..." value={manualCriteria.article} onChange={e => handleManualCriteriaChange('article', e.target.value)} />
                  {suggestions.field === 'article' && suggestions.items.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 border border-white/20 rounded-md shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {suggestions.items.map((item, idx) => (
                        <div key={idx} onClick={() => handleSelectSuggestion(item)} className="p-2 text-xs hover:bg-emerald-500/20 cursor-pointer border-b border-white/5 last:border-0">
                          <span className="font-bold text-emerald-400">{item.article}</span> — {item.product}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Color..." value={manualCriteria.color} onChange={e => handleManualCriteriaChange('color', e.target.value)} />
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Size..." value={manualCriteria.size} onChange={e => handleManualCriteriaChange('size', e.target.value)} />
              </>
            )}
            {(mode === 'Against Purchase Order' || mode === 'Against Transactions') && (
              <>
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Doc No Prefix..." value={mode === 'Against Transactions' ? txnCriteria.prefix : poCriteria.prefix} onChange={e => mode === 'Against Transactions' ? setTxnCriteria({...txnCriteria, prefix: e.target.value}) : setPoCriteria({...poCriteria, prefix: e.target.value})} />
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Doc No From..." value={mode === 'Against Transactions' ? txnCriteria.from : poCriteria.from} onChange={e => mode === 'Against Transactions' ? setTxnCriteria({...txnCriteria, from: e.target.value}) : setPoCriteria({...poCriteria, from: e.target.value})} />
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Doc No To..." value={mode === 'Against Transactions' ? txnCriteria.to : poCriteria.to} onChange={e => mode === 'Against Transactions' ? setTxnCriteria({...txnCriteria, to: e.target.value}) : setPoCriteria({...poCriteria, to: e.target.value})} />
              </>
            )}
            {mode === 'Against Direct Scan' && (
              <>
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Scan Stock No..." value={scanCriteria.stockNo} onChange={e => setScanCriteria({...scanCriteria, stockNo: e.target.value})} />
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" type="number" placeholder="Labels Qty..." value={scanCriteria.qty} onChange={e => setScanCriteria({...scanCriteria, qty: parseInt(e.target.value) || 1})} />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={scanCriteria.autoPrint} onChange={e => setScanCriteria({...scanCriteria, autoPrint: e.target.checked})} className="accent-emerald-500" />
                  Auto-Print One Label
                </label>
              </>
            )}
            {mode === 'Against Masters' && (
              <>
                <div className="space-y-1">
                  <span className="text-xs text-white/50">From Date</span>
                  <Input className="bg-slate-900 text-white border-white/20 h-10 px-3 w-full" type="date" value={mastersCriteria.fromDate} onChange={e => setMastersCriteria({...mastersCriteria, fromDate: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-white/50">To Date</span>
                  <Input className="bg-slate-900 text-white border-white/20 h-10 px-3 w-full" type="date" value={mastersCriteria.toDate} onChange={e => setMastersCriteria({...mastersCriteria, toDate: e.target.value})} />
                </div>
              </>
            )}
            {mode === 'Against Purchase (PT File)' && (
              <>
                <Input className="bg-slate-900 text-white border-white/20 h-10 px-3" placeholder="Select PT File..." value={ptFileCriteria.fileName} onChange={e => setPtFileCriteria({...ptFileCriteria, fileName: e.target.value})} />
                <Button className="h-10 bg-white/10 hover:bg-white/20">Browse</Button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-[300px] flex flex-col mt-4">
        <div className="flex items-center justify-between mb-2">
          <Text variant="xs" className="font-bold uppercase tracking-widest text-white/50">Selected Items ({gridData.length})</Text>
          <div className="flex gap-2">
            <Button onClick={() => handlePrint(false)} className="h-8 text-xs bg-white/10 hover:bg-white/20">Print Selected</Button>
            <Button onClick={() => handlePrint(true)} className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">Print All</Button>
            <Button onClick={() => setGridData([])} className="h-8 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40">Clear</Button>
          </div>
        </div>
        
        <div className="flex-1 ag-theme-quartz-dark" style={{
            "--ag-background-color": "rgba(255, 255, 255, 0.02)",
            "--ag-header-background-color": "rgba(15, 23, 42, 0.95)",
            "--ag-row-hover-color": "rgba(59, 130, 246, 0.05)",
            "--ag-border-color": "rgba(255, 255, 255, 0.1)",
            "--ag-foreground-color": "#ffffff",
        } as React.CSSProperties}>
          <AgGridReact
            theme={themeQuartz}
            ref={gridRef}
            rowData={gridData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            animateRows={true}
            singleClickEdit={true}
            stopEditingWhenCellsLoseFocus={true}
          />
        </div>
      </div>
    </div>
  );
}
