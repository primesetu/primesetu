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
  ShoppingCart, 
  RefreshCw, 
  Download, 
  Eye,
  Calendar,
  CreditCard,
  User,
  X as XIcon
} from 'lucide-react';
import { api } from '@/api/client';
import { 
  DataTable, 
  Button, 
  Badge, 
  Card, 
  Text,
  cn
} from '@/components/ui/SovereignUI';
import { motion, AnimatePresence } from 'framer-motion';

const SalesJournal: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const history = await api.billing.getHistory();
      setData(history);
    } catch (err) {
      console.error("Failed to fetch Sales history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const columns = [
    { 
      header: 'BILL NO', 
      accessor: 'bill_no', 
      pinned: 'left' as const, 
      className: 'font-mono font-bold text-primary',
      width: 180
    },
    { 
      header: 'DATE', 
      accessor: (r: any) => new Date(r.created_at).toLocaleString(),
      width: 150
    },
    { 
      header: 'CUSTOMER', 
      accessor: (r: any) => r.customer_id || 'WALK-IN',
      width: 200
    },
    { 
      header: 'TOTAL (₹)', 
      accessor: (r: any) => `₹${(r.net_payable || 0).toLocaleString()}`,
      width: 120,
      className: 'font-bold text-right'
    },
    { 
      header: 'STATUS', 
      accessor: (r: any) => (
        <Badge variant={r.status === 'Finalized' ? 'success' : 'warning'}>
          {r.status.toUpperCase()}
        </Badge>
      ),
      width: 120
    },
    { 
      header: 'CASHIER', 
      accessor: 'cashier_id',
      width: 120
    },
    {
      header: 'ACTIONS',
      width: 100,
      pinned: 'right' as const,
      accessor: (data: any) => (
        <Button size="sm" variant="ghost" onClick={() => setSelectedBill(data)}>
          <Eye size={14} />
        </Button>
      )
    }
  ];

  return (
    <div className="p-6 h-screen flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-navy uppercase tracking-tight">Sales Journal</h1>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Retail Audit Log • Store Sales Ledger</p>
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

      <div className="flex-1 flex gap-6 overflow-hidden">
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
          {selectedBill && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-[450px] flex flex-col gap-4 bg-white/80 backdrop-blur-xl border-l border-white/20 p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedBill(null)}
                className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full"
              >
                <XIcon size={20} />
              </button>

              <div className="mb-8">
                <Text variant="h3" className="text-navy font-black u-uppercase tracking-tighter">Bill Snapshot</Text>
                <div className="mt-2">
                  <Badge variant="info" className="font-mono text-lg py-1 px-4">{selectedBill.bill_no}</Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy"><Calendar size={20}/></div>
                   <div>
                     <div className="text-[10px] font-black text-muted u-uppercase tracking-widest">Transaction Date</div>
                     <div className="font-bold text-navy">{new Date(selectedBill.created_at).toLocaleString()}</div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy"><User size={20}/></div>
                   <div>
                     <div className="text-[10px] font-black text-muted u-uppercase tracking-widest">Customer</div>
                     <div className="font-bold text-navy">{selectedBill.customer_id || 'Walk-In Customer'}</div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy"><CreditCard size={20}/></div>
                   <div>
                     <div className="text-[10px] font-black text-muted u-uppercase tracking-widest">Payment Mode</div>
                     <div className="font-bold text-navy">{Object.keys(selectedBill.payments || {}).join(', ') || 'CASH'}</div>
                   </div>
                </div>

                <Card className="p-6 bg-navy text-white rounded-[2rem] border-none shadow-xl mt-8">
                   <div className="text-[10px] font-black text-white/40 u-uppercase tracking-widest mb-2">Net Payable Amount</div>
                   <div className="text-4xl font-black font-serif text-gold">₹{(selectedBill.net_payable || 0).toLocaleString()}</div>
                </Card>
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

export default SalesJournal;
