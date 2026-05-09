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
  ArrowRightLeft, 
  RefreshCw, 
  Download, 
  Eye,
  Activity,
  Box,
  Search,
  X as XIcon
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

const StockLedgerJournal: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrn, setSelectedTrn] = useState<any | null>(null);
  const [trnDetails, setTrnDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const ledger = await api.stockLedger.list(100);
      setData(ledger);
    } catch (err) {
      console.error("Failed to fetch Stock Ledger", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const viewDetails = async (trn: any) => {
    setSelectedTrn(trn);
    setLoadingDetails(true);
    try {
      const details = await api.stockLedger.getDetails(trn.trnctrlno);
      setTrnDetails(details);
    } catch (err) {
      console.error("Failed to fetch transaction details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getTrnTypeLabel = (type: number) => {
    switch (type) {
      case 1200: return 'PURCHASE (GRN)';
      case 2100: return 'SALES (BILLING)';
      case 2200: return 'SALES RETURN';
      case 1300: return 'STOCK ADJUSTMENT';
      default: return `TYPE ${type}`;
    }
  };

  const columns = [
    { 
      header: 'CTRL NO', 
      accessor: 'trnctrlno', 
      pinned: 'left' as const, 
      className: 'font-mono font-bold text-primary',
      width: 120
    },
    { 
      header: 'DOC NO', 
      accessor: (r: any) => `${r.docnoprefix}${r.docno}`,
      width: 150,
      className: 'font-bold'
    },
    { 
      header: 'DATE', 
      accessor: (r: any) => new Date(r.trndt).toLocaleString(),
      width: 150
    },
    { 
      header: 'TYPE', 
      accessor: (r: any) => (
        <Badge variant={r.trntype === 1200 ? 'success' : r.trntype === 2100 ? 'info' : 'muted'}>
          {getTrnTypeLabel(r.trntype)}
        </Badge>
      ),
      width: 180
    },
    { 
      header: 'NET VALUE (₹)', 
      accessor: (r: any) => `₹${r.netdocvalue.toLocaleString()}`,
      width: 150,
      className: 'font-black text-right'
    },
    {
      header: 'ACTIONS',
      width: 80,
      pinned: 'right' as const,
      accessor: (data: any) => (
        <Button size="sm" variant="ghost" onClick={() => viewDetails(data)}>
          <Eye size={14} />
        </Button>
      )
    }
  ];

  const detailColumns = [
    { header: 'STOCK NO', accessor: 'stockno', width: 140, className: 'font-mono font-bold' },
    { header: 'QTY', accessor: 'docqty', width: 80, className: 'font-bold text-right' },
    { header: 'RATE', accessor: (r: any) => `₹${r.docentrate}`, width: 100, className: 'text-right' },
    { header: 'NET VALUE', accessor: (r: any) => `₹${r.docentnetvalue}`, width: 120, className: 'font-bold text-right' },
    { header: 'AFTER STOCK', accessor: 'aftcurbalqty', width: 100, className: 'font-mono text-center opacity-50' }
  ];

  return (
    <div className="p-6 h-screen flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-navy uppercase tracking-tight">Stock Ledger</h1>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Sovereign Stock Movement Protocol • High Fidelity Shoper 9 Parity</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={fetchLedger} disabled={loading}>
            <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} /> Refresh
          </Button>
          <Button variant="primary" size="sm">
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Grid */}
        <div className="flex-1 flex flex-col glass border border-white/20 rounded-[2rem] overflow-hidden shadow-2xl bg-[var(--surface)]/50 dark:bg-[var(--surface-elevated)]/50">
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
          {selectedTrn && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-[500px] flex flex-col gap-4 bg-white/80 backdrop-blur-xl border-l border-white/20 p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedTrn(null)}
                className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full"
              >
                <XIcon size={20} />
              </button>

              <div className="mb-6">
                 <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info" className="font-mono">{selectedTrn.grn_no}</Badge>
                  <Text variant="xs" className="text-muted font-bold u-uppercase">{new Date(selectedTrn.trndt).toLocaleDateString()}</Text>
                </div>
                 <Text variant="h3" className="text-navy font-black u-uppercase tracking-tighter">
                   {selectedTrn.docnoprefix}{selectedTrn.docno}
                 </Text>
                 <div className="mt-2">
                  <Badge variant="info" className="font-mono text-lg py-1 px-4">{selectedTrn.bill_no}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-navy/5 border-none rounded-2xl">
                  <Text variant="xs" className="text-muted font-bold u-uppercase mb-1">Items Count</Text>
                  <Text className="font-black text-navy">{selectedTrn.totallineitems}</Text>
                </Card>
                <Card className="p-4 bg-navy/5 border-none rounded-2xl">
                  <Text variant="xs" className="text-muted font-bold u-uppercase mb-1">Audit Status</Text>
                  <Badge variant="success" className="h-5">VERIFIED</Badge>
                </Card>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                   <Text variant="xs" className="text-muted font-bold u-uppercase flex items-center gap-2">
                      <Box size={12} /> Stock Movement Registry
                   </Text>
                </div>
                <div className="flex-1 border border-navy/5 rounded-[1.5rem] overflow-hidden">
                  <DataTable 
                    data={trnDetails}
                    columns={detailColumns}
                    loading={loadingDetails}
                    rowHeight={40}
                    headerHeight={35}
                    className="h-full"
                  />
                </div>
              </div>
              <div className="mt-auto pt-8 border-t border-navy/5">
                <Button variant="secondary" className="w-full justify-center">
                  Reprint Invoice (Thermal)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StockLedgerJournal;
