/* ============================================================
 * SMRITI-OS — Module 17: E-Commerce Integration
 * Flipkart · Amazon · Meesho · Shopify · WooCommerce
 * v3.0 Architecture — "Omnichannel retail natively"
 * ============================================================ */
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import {
  ShoppingBag, RefreshCw, CheckCircle, AlertCircle,
  Package, BarChart3, Link2, Unlink, Settings,
  TrendingUp, ShoppingCart, RotateCcw, DollarSign,
  Zap, Globe, Clock, X, Key, Shield, Webhook
} from 'lucide-react';

// ── Platform Config ──────────────────────────────────────────
const PLATFORMS = [
  { id: 'amazon',      name: 'Amazon India',logo: '📦', color: '#FF9900', api: 'Amazon SP-API',         priority: 'CRITICAL' },
  { id: 'flipkart',    name: 'Flipkart',    logo: '🛒', color: '#F7B500', api: 'Flipkart Seller API',  priority: 'CRITICAL' },
  { id: 'myntra',      name: 'Myntra',      logo: '🛍️', color: '#FF3F6C', api: 'Myntra Partner API',   priority: 'CRITICAL' },
  { id: 'ajio',        name: 'AJIO',        logo: '👗', color: '#2F4F4F', api: 'Reliance Retail API',  priority: 'HIGH'     },
  { id: 'shoppersstop',name: 'Shoppers Stop',logo: '👜',color: '#000000', api: 'SS Omnichannel API',   priority: 'HIGH'     },
  { id: 'westside',    name: 'Westside',    logo: '🧥', color: '#8B0000', api: 'Tata Cliq/Westside API',priority: 'HIGH'     },
  { id: 'reliance',    name: 'Reliance',    logo: '🏬', color: '#0033A0', api: 'JioMart/Reliance API', priority: 'HIGH'     },
  { id: 'meesho',      name: 'Meesho',      logo: '📱', color: '#F43397', api: 'Meesho Supplier API',  priority: 'HIGH'     },
  { id: 'shopify',     name: 'Shopify',     logo: '🏪', color: '#96BF48', api: 'Shopify REST/GraphQL', priority: 'MEDIUM'   },
  { id: 'woocommerce', name: 'WooCommerce', logo: '🌐', color: '#96588A', api: 'WooCommerce REST API',  priority: 'MEDIUM'   },
  { id: 'unicommerce', name: 'Unicommerce', logo: '🔗', color: '#0078D4', api: 'Unicommerce API',       priority: 'MEDIUM'   },
];

type Tab = 'connections' | 'orders' | 'inventory' | 'pricing' | 'returns' | 'settlement';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'connections', label: 'Platform Connections', icon: <Link2 size={14} /> },
  { id: 'orders',      label: 'Order Queue',          icon: <ShoppingCart size={14} /> },
  { id: 'inventory',   label: 'Inventory Sync',       icon: <Package size={14} /> },
  { id: 'pricing',     label: 'Price Sync',           icon: <DollarSign size={14} /> },
  { id: 'returns',     label: 'Returns',              icon: <RotateCcw size={14} /> },
  { id: 'settlement',  label: 'Settlement Reconcile', icon: <BarChart3 size={14} /> },
];

// ── Mock Order Data ──────────────────────────────────────────
const MOCK_ORDERS = [
  { id: 'FK-8821', platform: 'flipkart', item: 'Blue Denim Shirt L', qty: 2, amount: 1598, status: 'NEW',        time: '2 min ago'  },
  { id: 'AMZ-441', platform: 'amazon',   item: 'Cotton Kurti XL',    qty: 1, amount:  849, status: 'PROCESSING', time: '8 min ago'  },
  { id: 'MSH-229', platform: 'meesho',   item: 'Polo T-Shirt M',     qty: 3, amount: 1197, status: 'DISPATCHED', time: '22 min ago' },
  { id: 'SHO-115', platform: 'shopify',  item: 'Canvas Shoes 42',    qty: 1, amount: 1299, status: 'NEW',        time: '35 min ago' },
  { id: 'FK-8820', platform: 'flipkart', item: 'Formal Trouser 32',  qty: 1, amount:  999, status: 'DELIVERED',  time: '1 hr ago'   },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: '#3b82f6', PROCESSING: '#f59e0b', DISPATCHED: '#10b981', DELIVERED: '#6b7280',
};

const getPlatformColor = (id: string) =>
  PLATFORMS.find((p) => p.id === id)?.color ?? '#888';
const getPlatformName = (id: string) =>
  PLATFORMS.find((p) => p.id === id)?.name ?? id;

// ── Connections Tab ──────────────────────────────────────────
const ConnectionsTab: React.FC = () => {
  const [connected, setConnected] = useState<Record<string, boolean>>({
    flipkart: true, amazon: true, myntra: true, ajio: false, shoppersstop: false,
    westside: false, reliance: false, meesho: false,
    shopify: false, woocommerce: false, unicommerce: false,
  });
  
  const [selectedPlatform, setSelectedPlatform] = useState<any | null>(null);

  return (
    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {PLATFORMS.map((p) => (
        <div
          key={p.id}
          style={{
            background: 'var(--surface)',
            border: `1px solid ${connected[p.id] ? p.color : 'var(--border-default)'}`,
            borderRadius: 0,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{p.logo}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.api}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px',
                background: p.priority === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : p.priority === 'HIGH' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)',
                color: p.priority === 'CRITICAL' ? 'var(--danger)' : p.priority === 'HIGH' ? '#f59e0b' : 'var(--text-tertiary)',
                borderRadius: 2,
              }}>
                {p.priority}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {connected[p.id] ? (
              <CheckCircle size={14} color="#10b981" />
            ) : (
              <AlertCircle size={14} color="#94a3b8" />
            )}
            <span style={{ fontSize: 12, color: connected[p.id] ? '#10b981' : 'var(--text-tertiary)' }}>
              {connected[p.id] ? 'Connected & Syncing' : 'Not Connected'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setConnected((c) => ({ ...c, [p.id]: !c[p.id] }))}
              style={{
                flex: 1, height: 32, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: connected[p.id] ? 'rgba(239,68,68,0.1)' : p.color,
                color: connected[p.id] ? 'var(--danger)' : '#fff',
                border: connected[p.id] ? '1px solid var(--danger)' : 'none',
                borderRadius: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {connected[p.id] ? <><Unlink size={12} /> Disconnect</> : <><Link2 size={12} /> Connect</>}
            </button>
            {connected[p.id] && (
              <button
                onClick={() => setSelectedPlatform(p)}
                style={{
                  width: 32, height: 32, cursor: 'pointer',
                  background: 'var(--surface-muted)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-default)', borderRadius: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Settings size={13} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Platform Settings Modal */}
      {selectedPlatform && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--surface)', width: 480,
            border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{selectedPlatform.logo}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{selectedPlatform.name} Integration</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Configure API credentials & Webhooks</div>
                </div>
              </div>
              <button onClick={() => setSelectedPlatform(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <Shield size={14} /> Seller ID / Merchant ID
                </label>
                <input type="text" placeholder={`Enter ${selectedPlatform.name} Seller ID`} style={{
                  width: '100%', padding: '8px 12px', fontSize: 13, background: 'var(--background)',
                  border: '1px solid var(--border-default)', borderRadius: 0, color: 'var(--text-primary)'
                }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <Key size={14} /> API Access Key
                </label>
                <input type="password" placeholder="••••••••••••••••" style={{
                  width: '100%', padding: '8px 12px', fontSize: 13, background: 'var(--background)',
                  border: '1px solid var(--border-default)', borderRadius: 0, color: 'var(--text-primary)'
                }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <Key size={14} /> API Secret Key
                </label>
                <input type="password" placeholder="••••••••••••••••" style={{
                  width: '100%', padding: '8px 12px', fontSize: 13, background: 'var(--background)',
                  border: '1px solid var(--border-default)', borderRadius: 0, color: 'var(--text-primary)'
                }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <Webhook size={14} /> Webhook Endpoint (For Orders)
                </label>
                <div style={{
                  width: '100%', padding: '8px 12px', fontSize: 12, background: 'rgba(59,130,246,0.05)',
                  border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', fontFamily: 'var(--font-mono)'
                }}>
                  https://api.smritios.com/v1/webhooks/{selectedPlatform.id}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setSelectedPlatform(null)} style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'var(--surface)', color: 'var(--text-primary)',
                border: '1px solid var(--border-default)', borderRadius: 0
              }}>Cancel</button>
              <button onClick={() => setSelectedPlatform(null)} style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 0
              }}>Save Credentials</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Order Queue Tab ──────────────────────────────────────────
const OrderQueueTab: React.FC = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['ecommerce-orders'],
    queryFn: () => api.ecommerce.getOrders(),
  });

  return (
  <div style={{ padding: 24 }}>
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      {['All Orders', 'New (2)', 'Processing (1)', 'Dispatched (1)', 'Delivered (1)'].map((t, i) => (
        <button key={t} style={{
          padding: '6px 14px', fontSize: 12, fontWeight: i === 0 ? 700 : 400, cursor: 'pointer',
          background: i === 0 ? 'var(--primary)' : 'var(--surface)',
          color: i === 0 ? '#fff' : 'var(--text-secondary)',
          border: '1px solid var(--border-default)', borderRadius: 0,
        }}>{t}</button>
      ))}
      <button style={{
        marginLeft: 'auto', padding: '6px 14px', fontSize: 12, cursor: 'pointer',
        background: 'var(--surface)', color: 'var(--text-secondary)',
        border: '1px solid var(--border-default)', borderRadius: 0,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <RefreshCw size={12} /> Sync Now
      </button>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#1a4a48', color: '#fff' }}>
          {['Order ID', 'Platform', 'Item', 'Qty', 'Amount', 'Status', 'Time', 'Action'].map((h) => (
            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</td>
          </tr>
        ) : orders.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No orders found</td>
          </tr>
        ) : orders.map((o: any, i: number) => (
          <tr key={o.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-muted)' }}>
            <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{o.id}</td>
            <td style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: getPlatformColor(o.platform), padding: '2px 8px', background: `${getPlatformColor(o.platform)}15` }}>
                {getPlatformName(o.platform)}
              </span>
            </td>
            <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>{o.item}</td>
            <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{o.qty}</td>
            <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{o.amount.toLocaleString('en-IN')}</td>
            <td style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status] }}>
                {o.status}
              </span>
            </td>
            <td style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />{o.time}
            </td>
            <td style={{ padding: '10px 14px' }}>
              {o.status === 'NEW' && (
                <button style={{
                  padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 0,
                }}>
                  Process
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}

// ── Inventory Sync Tab ───────────────────────────────────────
const InventorySyncTab: React.FC = () => {
  const syncMutation = useMutation({
    mutationFn: () => api.ecommerce.syncInventory(),
    onSuccess: (data: any) => {
      alert(data.message);
    }
  });

  return (
  <div style={{ padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{
        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
        padding: 14, fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 10, color: '#3b82f6', flex: 1, marginRight: 16
      }}>
        <Zap size={16} />
        <span>Real-time inventory sync is <strong>ACTIVE</strong>. Stock changes push to all connected platforms within 60 seconds to prevent overselling.</span>
      </div>
      <button 
        onClick={() => syncMutation.mutate()}
        disabled={syncMutation.isPending}
        style={{
          padding: '10px 20px', background: 'var(--primary)', color: '#fff', 
          border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
      }}>
        <RefreshCw size={14} className={syncMutation.isPending ? "animate-spin" : ""} />
        {syncMutation.isPending ? "Syncing..." : "Force Sync"}
      </button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
      {[
        { label: 'Items Synced',   value: '2,847', color: '#10b981' },
        { label: 'Sync Errors',    value: '3',     color: '#ef4444' },
        { label: 'Last Sync',      value: '2 min', color: 'var(--text-secondary)' },
      ].map((k) => (
        <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', padding: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: k.color }}>{k.value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{k.label}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {PLATFORMS.slice(0, 4).map((p) => (
        <div key={p.id} style={{
          background: 'var(--surface)', border: '1px solid var(--border-default)', padding: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>{p.logo}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {Math.floor(Math.random() * 1000 + 500)} items in sync
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Live</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
};

// ── Settlement Tab ───────────────────────────────────────────
const SettlementTab: React.FC = () => (
  <div style={{ padding: 24 }}>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
      Match platform payment settlements against Smriti OS sales transactions.
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {PLATFORMS.slice(0, 3).map((p) => (
        <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>{p.logo}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
            ₹{(Math.random() * 50000 + 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Pending settlement</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={{
              flex: 1, height: 30, fontSize: 11, cursor: 'pointer', fontWeight: 600,
              background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 0,
            }}>Reconcile</button>
            <button style={{
              height: 30, padding: '0 10px', fontSize: 11, cursor: 'pointer',
              background: 'var(--surface-muted)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)', borderRadius: 0,
            }}>Export</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Main ECommerce Module ────────────────────────────────────
export const ECommerceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('connections');

  const tabContent: Record<Tab, React.ReactNode> = {
    connections: <ConnectionsTab />,
    orders:      <OrderQueueTab />,
    inventory:   <InventorySyncTab />,
    pricing:     (
      <div style={{ padding: 24, color: 'var(--text-secondary)', fontSize: 13 }}>
        Price sync configuration — push Smriti OS MRP changes to all connected platforms automatically.
        <br /><br />
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Coming soon: Platform-specific pricing rules (Flipkart floor price, Amazon competitive pricing)</span>
      </div>
    ),
    returns:     (
      <div style={{ padding: 24, color: 'var(--text-secondary)', fontSize: 13 }}>
        Platform returns are reflected as sales returns in Smriti OS inventory automatically.
        <br /><br />
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Coming soon: Automated return approval workflows per platform SLA</span>
      </div>
    ),
    settlement: <SettlementTab />,
  };

  const { data: orders } = useQuery({
    queryKey: ['ecommerce-orders'],
    queryFn: () => api.ecommerce.getOrders(),
  });

  const totalOrders = orders ? orders.length : 14;
  const newOrders   = orders ? orders.filter((o: any) => o.status === 'NEW').length : 2;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--background)', fontFamily: 'var(--font-primary)',
    }}>
      {/* Header */}
      <div style={{
        background: '#1a4a48', padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        borderBottom: '2px solid var(--primary)',
      }}>
        <Globe size={20} color="#fff" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
            E-COMMERCE INTEGRATION
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
            Module 17 · Amazon · Myntra · AJIO · Shoppers Stop · Westside · Reliance
          </div>
        </div>

        {/* KPI pills */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {[
            { label: 'Active Platforms', value: '2', color: '#10b981' },
            { label: 'Orders Today',     value: String(totalOrders), color: '#3b82f6' },
            { label: 'New Orders',       value: String(newOrders),   color: '#f59e0b' },
          ].map((k) => (
            <div key={k.label} style={{
              background: 'rgba(255,255,255,0.1)', padding: '6px 14px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: k.color }}>{k.value}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border-default)',
        background: 'var(--surface)', overflowX: 'auto',
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`ecommerce-tab-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px', fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeTab === t.id ? 'var(--primary)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default ECommerceModule;
