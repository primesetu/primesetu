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
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RefreshCw, 
  Download, 
  Search,
  Eye,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/api/client';
import { 
  DataTable, 
  Button, 
  Badge, 
  Card, 
  Text,
  Input,
  cn
} from '@/components/ui/SovereignUI';
import { motion, AnimatePresence } from 'framer-motion';

const PurchaseJournal: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrn, setSelectedGrn] = useState<any | null>(null);
  const [grnLines, setGrnLines] = useState<any[]>([]);
  const [loadingLines, setLoadingLines] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const history = await api.purchase.getGRNHistory();
      setData(history);
    } catch (err) {
      console.error("Failed to fetch GRN history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const viewDetails = async (grn: any) => {
    setSelectedGrn(grn);
    setLoadingLines(true);
    try {
      const lines = await api.purchase.getGRNLines(grn.trnctrlno);
      setGrnLines(lines);
    } catch (err) {
      console.error("Failed to fetch GRN lines", err);
    } finally {
      setLoadingLines(false);
    }
  };

  const columns = [
    { 
      header: 'GRN NO', 
      accessor: 'grn_no', 
      pinned: 'left' as const, 
      className: 'font-mono font-bold text-primary',
      width: 150
    },
    { 
      header: 'DATE', 
      accessor: (r: any) => new Date(r.grn_date).toLocaleDateString(),
      width: 120
    },
    { 
      header: 'VENDOR', 
      accessor: 'vendor_code',
      width: 150
    },
    { 
      header: 'VALUE (₹)', 
      accessor: (r: any) => `₹${r.net_value.toLocaleString()}`,
      width: 120,
      className: 'font-bold text-right'
    },
    { 
      header: 'ITEMS', 
      accessor: 'line_count',
      width: 100,
      className: 'text-center'
    },
    { 
      header: 'USER', 
      accessor: 'entered_by',
      width: 120
    },
    {
      header: 'ACTIONS',
      width: 100,
      pinned: 'right' as const,
      accessor: (data: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => viewDetails(data)}>
            <Eye size={14} />
          </Button>
        </div>
      )
    }
  ];

  const lineColumns = [
    { header: '#', accessor: 'entsrlno', width: 60, className: 'font-mono' },
    { header: 'STOCK NO', accessor: 'stockno', width: 150, className: 'font-mono font-bold' },
    { header: 'ITEM DESCRIPTION', accessor: 'item_name', width: 250 },
    { header: 'QTY', accessor: 'qty', width: 80, className: 'font-bold' },
    { header: 'RATE', accessor: (r: any) => `₹${r.rate}`, width: 100 },
    { header: 'VALUE', accessor: (r: any) => `₹${r.net_value}`, width: 120, className: 'font-bold' },
    { header: 'BATCH', accessor: 'batchno', width: 120 }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-8 flex items-center justify-between border-b border-black/5 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-navy uppercase tracking-tight">Purchase Journal</h1>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Master Transaction Ledger • Goods Inward (GRN)</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} /> Refresh
          </Button>
          <Button variant="primary" size="sm">
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden p-8">
        {/* Main Grid */}
        <div className="flex-1 flex flex-col glass border border-white/20 rounded-[2rem] overflow-hidden shadow-2xl bg-white/50">
          <DataTable 
            data={data}
            columns={columns}
            loading={loading}
            pagination={true}
            paginationPageSize={20}
            className="flex-1"
          />
        </div>

        {/* Details Sidebar */}
        <AnimatePresence>
          {selectedGrn && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-[500px] flex flex-col gap-4 bg-white/80 backdrop-blur-xl border-l border-white/20 p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedGrn(null)}
                className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <Text variant="h3" className="text-navy font-black u-uppercase tracking-tighter">GRN Details</Text>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info" className="font-mono">{selectedGrn.grn_no}</Badge>
                  <Text variant="xs" className="text-muted font-bold u-uppercase">{new Date(selectedGrn.grn_date).toLocaleDateString()}</Text>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-navy/5 border-none">
                  <Text variant="xs" className="text-muted font-bold u-uppercase mb-1">Vendor</Text>
                  <Text className="font-black text-navy">{selectedGrn.vendor_code}</Text>
                </Card>
                <Card className="p-4 bg-navy/5 border-none">
                  <Text variant="xs" className="text-muted font-bold u-uppercase mb-1">Total Value</Text>
                  <Text className="font-black text-navy text-xl">₹{selectedGrn.net_value.toLocaleString()}</Text>
                </Card>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <Text variant="xs" className="text-muted font-bold u-uppercase mb-2 flex items-center gap-2">
                  <AlertCircle size={12} /> Line Items ({selectedGrn.line_count})
                </Text>
                <div className="flex-1 border border-navy/5 rounded-xl overflow-hidden">
                  <DataTable 
                    data={grnLines}
                    columns={lineColumns}
                    loading={loadingLines}
                    rowHeight={40}
                    headerHeight={35}
                    className="h-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Internal X icon since it was missing in imports
const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

export default PurchaseJournal;
