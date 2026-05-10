/* ============================================================
 * SMRITI-OS — Module 6: Returns & Exchange Workbench
 * Sovereign Reverse-POS — Scan, Verify, Issue Credit Note
 * ============================================================ */
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { Search, RotateCcw, CheckCircle, AlertTriangle, Package } from 'lucide-react';

type ReturnType = 'REFUND' | 'CREDIT_NOTE' | 'EXCHANGE';

interface OriginalItem {
  line_no: number; stock_no: string; item_name: string;
  qty_sold: number; mrp: number; discount_per: number; net_amount: number;
}

interface OriginalSale {
  bill_no: string; bill_date: string; customer_id: string | null;
  net_payable: number; items: OriginalItem[];
}

interface SelectedItem extends OriginalItem {
  return_qty: number;
}

export default function ReturnsDesk() {
  const [billQuery, setBillQuery] = useState('');
  const [originalSale, setOriginalSale] = useState<OriginalSale | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [returnType, setReturnType] = useState<ReturnType>('CREDIT_NOTE');
  const [reason, setReason] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const lookupBill = async () => {
    if (!billQuery.trim()) return;
    setLookingUp(true);
    setLookupError(null);
    setOriginalSale(null);
    setSelectedItems({});
    setResult(null);
    try {
      const res = await apiClient.get(`/returns/lookup/${billQuery.trim()}`);
      setOriginalSale(res.data);
    } catch (e: any) {
      setLookupError(e?.response?.data?.detail || 'Bill not found.');
    } finally {
      setLookingUp(false);
    }
  };

  const toggleItem = (item: OriginalItem) => {
    setSelectedItems(prev => {
      if (prev[item.stock_no]) {
        const next = { ...prev };
        delete next[item.stock_no];
        return next;
      }
      return { ...prev, [item.stock_no]: { ...item, return_qty: 1 } };
    });
  };

  const setReturnQty = (sku: string, qty: number) => {
    setSelectedItems(prev => {
      if (!prev[sku]) return prev;
      const max = prev[sku].qty_sold;
      return { ...prev, [sku]: { ...prev[sku], return_qty: Math.min(Math.max(1, qty), max) } };
    });
  };

  const totalRefund = Object.values(selectedItems).reduce(
    (sum, si) => sum + si.mrp * si.return_qty * (1 - si.discount_per / 100), 0
  );

  const processMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/returns/process', {
        original_bill_no: originalSale?.bill_no,
        return_type: returnType,
        reason,
        items: Object.values(selectedItems).map(si => ({ stock_no: si.stock_no, qty: si.return_qty, mrp: si.mrp * 100 })),
      }),
    onSuccess: (res) => {
      setResult(res.data);
    },
  });

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>
          RETURNS DESK
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Scan or enter original bill number · Verify items · Issue Credit Note or Refund
        </p>
      </div>

      {/* Bill Lookup */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={billQuery}
          onChange={e => setBillQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookupBill()}
          placeholder="Enter original bill number (e.g. B-STORE1-1001)"
          style={{ flex: 1, padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          autoFocus
        />
        <button
          onClick={lookupBill}
          disabled={lookingUp}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}
        >
          <Search size={15} /> {lookingUp ? 'Looking up...' : 'Find Bill'}
        </button>
      </div>

      {lookupError && (
        <div style={{ padding: 12, background: '#ef444415', border: '1px solid #ef4444', color: '#ef4444', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {lookupError}
        </div>
      )}

      {result && (
        <div style={{ padding: 20, background: '#10b98110', border: '1px solid #10b981', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <CheckCircle size={20} color="#10b981" />
            <span style={{ fontWeight: 800, fontSize: 15, color: '#10b981' }}>Return Processed Successfully</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
            <div>Return Bill: <strong>{result.return_bill_no}</strong></div>
            <div>Refund Amount: <strong>{formatCurrency(result.refund_amount)}</strong></div>
            <div>Credit Note ID: <strong>{result.credit_note_id}</strong></div>
          </div>
          <button
            onClick={() => { setResult(null); setOriginalSale(null); setBillQuery(''); setSelectedItems({}); }}
            style={{ marginTop: 12, padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            Process Another Return
          </button>
        </div>
      )}

      {originalSale && !result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Items list */}
          <div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 8 }}>ORIGINAL SALE — {originalSale.bill_no}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Date: {new Date(originalSale.bill_date).toLocaleDateString('en-IN')} &nbsp;·&nbsp;
                Total: {formatCurrency(originalSale.net_payable)}
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8 }}>
              SELECT ITEMS TO RETURN (click to select)
            </div>
            {originalSale.items.map(item => {
              const selected = !!selectedItems[item.stock_no];
              return (
                <div
                  key={item.stock_no}
                  onClick={() => toggleItem(item)}
                  style={{
                    padding: 14, marginBottom: 8, cursor: 'pointer',
                    border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selected ? 'var(--color-primary-10, #0f766e10)' : 'var(--color-surface)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Package size={16} color={selected ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{item.item_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{item.stock_no}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{formatCurrency(item.mrp)}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Sold: {item.qty_sold} pcs</div>
                    </div>
                  </div>
                  {selected && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }} onClick={e => e.stopPropagation()}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>RETURN QTY:</label>
                      <input
                        type="number" min={1} max={item.qty_sold}
                        value={selectedItems[item.stock_no]?.return_qty || 1}
                        onChange={e => setReturnQty(item.stock_no, parseInt(e.target.value))}
                        style={{ width: 60, padding: '4px 8px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>of {item.qty_sold}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right panel — summary + controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 18, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 14 }}>RETURN SUMMARY</div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>RETURN TYPE</label>
                {(['REFUND', 'CREDIT_NOTE', 'EXCHANGE'] as ReturnType[]).map(rt => (
                  <div
                    key={rt}
                    onClick={() => setReturnType(rt)}
                    style={{ padding: '8px 12px', marginBottom: 4, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                      border: `2px solid ${returnType === rt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: returnType === rt ? 'var(--color-primary-10, #0f766e10)' : 'transparent',
                      color: returnType === rt ? 'var(--color-primary)' : 'var(--color-text)',
                    }}
                  >
                    {rt.replace('_', ' ')}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>REASON</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Size issue, defective, customer preference..."
                  rows={2}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', resize: 'none', fontSize: 12, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid var(--color-border)', marginBottom: 14 }}>
                <span style={{ fontWeight: 700 }}>Refund Amount</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: 18, color: '#ef4444' }}>
                  {formatCurrency(totalRefund)}
                </span>
              </div>

              <button
                onClick={() => processMutation.mutate()}
                disabled={Object.keys(selectedItems).length === 0 || processMutation.isPending}
                style={{
                  width: '100%', padding: '13px', fontWeight: 800, fontSize: 13,
                  background: Object.keys(selectedItems).length === 0 ? '#94a3b8' : '#ef4444',
                  color: '#fff', border: 'none',
                  cursor: Object.keys(selectedItems).length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <RotateCcw size={15} />
                {processMutation.isPending ? 'PROCESSING...' : 'PROCESS RETURN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
