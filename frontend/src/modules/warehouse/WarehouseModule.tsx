/* ============================================================
 * SMRITI-OS — Module 5: Warehouse Management Workbench
 * Sovereign Multi-Store Routing, Adjustments, and Bin Assignment
 * ============================================================ */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Package, ArrowRightLeft, SlidersHorizontal, MapPin, CheckCircle, Search, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

type Tab = 'DASHBOARD' | 'TRANSFER' | 'ADJUST' | 'BIN';

export default function WarehouseModule() {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>
          WAREHOUSE OPERATIONS
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Live Pulse · Inter-Store Routing · Stock Corrections · Bin Topology
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid var(--color-border)', paddingBottom: 16, marginBottom: 24 }}>
        <TabButton active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} icon={<Package size={15}/>} label="Live Pulse" />
        <TabButton active={activeTab === 'TRANSFER'} onClick={() => setActiveTab('TRANSFER')} icon={<ArrowRightLeft size={15}/>} label="Stock Routing" />
        <TabButton active={activeTab === 'ADJUST'} onClick={() => setActiveTab('ADJUST')} icon={<SlidersHorizontal size={15}/>} label="Corrections" />
        <TabButton active={activeTab === 'BIN'} onClick={() => setActiveTab('BIN')} icon={<MapPin size={15}/>} label="Bin Layout" />
      </div>

      {activeTab === 'DASHBOARD' && <DashboardTab />}
      {activeTab === 'TRANSFER' && <TransferTab />}
      {activeTab === 'ADJUST' && <AdjustTab />}
      {activeTab === 'BIN' && <BinTab />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        background: active ? 'var(--color-text)' : 'transparent',
        color: active ? 'var(--color-bg)' : 'var(--color-text)',
        border: '2px solid',
        borderColor: active ? 'var(--color-text)' : 'var(--color-border)',
        transition: 'all 0.15s'
      }}
    >
      {icon} {label}
    </button>
  );
}

function DashboardTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-dashboard'],
    queryFn: () => api.warehouse.getDashboard()
  });

  if (isLoading) return <div>Loading warehouse metrics...</div>;
  if (!data) return <div>Failed to load metrics.</div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <MetricCard label="TOTAL ITEMS" value={data.metrics.total_items} />
        <MetricCard label="VALUATION" value={formatCurrency(data.metrics.valuation_paise / 100)} />
        <MetricCard label="LOW STOCK ALERTS" value={data.metrics.low_stock_count} highlight={data.metrics.low_stock_count > 0} />
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 16 }}>BIN OCCUPANCY HIGHLIGHTS</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <th style={{ textAlign: 'left', padding: '10px 0', fontWeight: 700 }}>ITEM NAME</th>
              <th style={{ textAlign: 'right', padding: '10px 0', fontWeight: 700 }}>BIN</th>
              <th style={{ textAlign: 'right', padding: '10px 0', fontWeight: 700 }}>QTY</th>
            </tr>
          </thead>
          <tbody>
            {data.bin_highlights?.map((row: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 0' }}>{row.name}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>{row.bin}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{row.qty}</td>
              </tr>
            ))}
            {(!data.bin_highlights || data.bin_highlights.length === 0) && (
              <tr><td colSpan={3} style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>No bin highlights.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div style={{ padding: 20, border: `2px solid ${highlight ? '#ef4444' : 'var(--color-border)'}`, background: 'var(--color-surface)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: highlight ? '#ef4444' : 'var(--color-text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: highlight ? '#ef4444' : 'inherit' }}>{value}</div>
    </div>
  );
}

function TransferTab() {
  const [destStore, setDestStore] = useState('');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.warehouse.getStores()
  });

  const mutation = useMutation({
    mutationFn: () => api.warehouse.transfer({
      source_store_id: 'auto-resolved-by-backend', // Handled by current_user.store_id in backend if auth
      destination_store_id: destStore,
      items: [{ sku, qty: parseInt(qty) }]
    }),
    onSuccess: (res: any) => {
      setSuccess(`Transfer successful! TRF ID: ${res.transfer_id}`);
      setSku('');
      setQty('');
    }
  });

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 24, maxWidth: 600 }}>
      {success && (
        <div style={{ padding: 12, background: '#10b98115', border: '1px solid #10b981', color: '#10b981', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>DESTINATION STORE</label>
        <select
          value={destStore} onChange={e => setDestStore(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: 13, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        >
          <option value="">-- Select Store --</option>
          {stores?.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>ITEM SKU / BARCODE</label>
          <input
            value={sku} onChange={e => setSku(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>QTY</label>
          <input
            type="number" min={1} value={qty} onChange={e => setQty(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <button
        onClick={() => { setSuccess(null); mutation.mutate(); }}
        disabled={!destStore || !sku || !qty || mutation.isPending}
        style={{
          width: '100%', padding: '12px', background: 'var(--color-text)', color: 'var(--color-bg)',
          fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', opacity: (!destStore || !sku || !qty) ? 0.5 : 1
        }}
      >
        {mutation.isPending ? 'PROCESSING...' : 'EXECUTE ROUTING'}
      </button>
      
      {mutation.isError && (
        <div style={{ marginTop: 12, padding: 12, background: '#ef444415', border: '1px solid #ef4444', color: '#ef4444', fontSize: 12 }}>
          ✗ {(mutation.error as any)?.response?.data?.detail || 'Failed to route stock.'}
        </div>
      )}
    </div>
  );
}

function AdjustTab() {
  const [sku, setSku] = useState('');
  const [qtyChange, setQtyChange] = useState('');
  const [reason, setReason] = useState('DAMAGE');
  const [success, setSuccess] = useState<string | null>(null);
  
  const mutation = useMutation({
    mutationFn: () => api.warehouse.adjust({ sku, qty_change: parseInt(qtyChange), reason_code: reason }),
    onSuccess: (res: any) => {
      setSuccess(`Adjusted successfully! New Qty: ${res.new_qty}`);
      setSku('');
      setQtyChange('');
    }
  });

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 24, maxWidth: 600 }}>
      {success && (
        <div style={{ padding: 12, background: '#10b98115', border: '1px solid #10b981', color: '#10b981', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>ITEM SKU</label>
          <input
            value={sku} onChange={e => setSku(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>+/- QTY</label>
          <input
            type="number" value={qtyChange} onChange={e => setQtyChange(e.target.value)} placeholder="-5 or +10"
            style={{ width: '100%', padding: '10px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>REASON CODE</label>
        <select
          value={reason} onChange={e => setReason(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: 13, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        >
          <option value="DAMAGE">DAMAGE - Product Damaged</option>
          <option value="SHRINKAGE">SHRINKAGE - Missing / Lost</option>
          <option value="FOUND">FOUND - Found in Audit</option>
          <option value="EXPIRED">EXPIRED - Beyond Shelf Life</option>
        </select>
      </div>

      <button
        onClick={() => { setSuccess(null); mutation.mutate(); }}
        disabled={!sku || !qtyChange || mutation.isPending}
        style={{
          width: '100%', padding: '12px', background: 'var(--color-text)', color: 'var(--color-bg)',
          fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', opacity: (!sku || !qtyChange) ? 0.5 : 1
        }}
      >
        {mutation.isPending ? 'PROCESSING...' : 'COMMIT CORRECTION'}
      </button>

      {mutation.isError && (
        <div style={{ marginTop: 12, padding: 12, background: '#ef444415', border: '1px solid #ef4444', color: '#ef4444', fontSize: 12 }}>
          ✗ {(mutation.error as any)?.response?.data?.detail || 'Failed to adjust stock.'}
        </div>
      )}
    </div>
  );
}

function BinTab() {
  const [sku, setSku] = useState('');
  const [bin, setBin] = useState('');
  const [shelf, setShelf] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.warehouse.assignBin({ sku, bin_location: bin, shelf_no: shelf }),
    onSuccess: () => {
      setSuccess(`Location updated for ${sku}.`);
      setSku(''); setBin(''); setShelf('');
    }
  });

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 24, maxWidth: 600 }}>
      {success && (
        <div style={{ padding: 12, background: '#10b98115', border: '1px solid #10b981', color: '#10b981', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>ITEM SKU</label>
        <input
          value={sku} onChange={e => setSku(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>BIN / AISLE</label>
          <input
            value={bin} onChange={e => setBin(e.target.value)} placeholder="e.g. A12"
            style={{ width: '100%', padding: '10px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>SHELF NO</label>
          <input
            value={shelf} onChange={e => setShelf(e.target.value)} placeholder="e.g. 04"
            style={{ width: '100%', padding: '10px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <button
        onClick={() => { setSuccess(null); mutation.mutate(); }}
        disabled={!sku || !bin || !shelf || mutation.isPending}
        style={{
          width: '100%', padding: '12px', background: 'var(--color-text)', color: 'var(--color-bg)',
          fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', opacity: (!sku || !bin || !shelf) ? 0.5 : 1
        }}
      >
        {mutation.isPending ? 'ASSIGNING...' : 'ASSIGN LOCATION'}
      </button>

      {mutation.isError && (
        <div style={{ marginTop: 12, padding: 12, background: '#ef444415', border: '1px solid #ef4444', color: '#ef4444', fontSize: 12 }}>
          ✗ {(mutation.error as any)?.response?.data?.detail || 'Failed to assign bin.'}
        </div>
      )}
    </div>
  );
}
