/* ============================================================
 * SMRITI-OS — Module 18: Loyalty & CRM
 * Tier management, customer 360 view, CRM campaigns
 * v3.0 Architecture — "Retain and Reward natively"
 * ============================================================ */
import React, { useState } from 'react';
import {
  Trophy, Target, TrendingUp, Users, Search, 
  Gift, Star, Zap, UserSquare2, Crown, 
  MessageCircle, BarChart3, Clock, Settings
} from 'lucide-react';

type Tab = 'dashboard' | 'customers' | 'tiers' | 'campaigns';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Loyalty Dashboard', icon: <BarChart3 size={14} /> },
  { id: 'customers', label: 'Customer 360',      icon: <Users size={14} /> },
  { id: 'tiers',     label: 'Tier Management',   icon: <Crown size={14} /> },
  { id: 'campaigns', label: 'CRM Campaigns',     icon: <MessageCircle size={14} /> },
];

const TIERS = [
  { id: 'bronze',   name: 'Bronze',   color: '#8b4513', req: 'Default',        pts: '1 pt / ₹100',   benefits: 'Standard benefits' },
  { id: 'silver',   name: 'Silver',   color: '#94a3b8', req: '₹10,000 / yr',   pts: '1.5 pt / ₹100', benefits: 'Birthday bonus, Early sale' },
  { id: 'gold',     name: 'Gold',     color: '#f59e0b', req: '₹50,000 / yr',   pts: '2 pt / ₹100',   benefits: 'Priority service, Exclusive discounts' },
  { id: 'platinum', name: 'Platinum', color: '#6366f1', req: '₹1,00,000 / yr', pts: '3 pt / ₹100',   benefits: 'VIP events, Dedicated support' },
];

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Rahul Sharma', phone: '9876543210', tier: 'gold',     points: 4500,  spend: 52400, lastVisit: '2 days ago' },
  { id: 'CUST-002', name: 'Priya Patel',  phone: '9876543211', tier: 'platinum', points: 12400, spend: 115000,lastVisit: '5 days ago' },
  { id: 'CUST-003', name: 'Amit Varma',   phone: '9876543212', tier: 'silver',   points: 850,   spend: 14200, lastVisit: '12 days ago' },
  { id: 'CUST-004', name: 'Sneha Gupta',  phone: '9876543213', tier: 'bronze',   points: 120,   spend: 4500,  lastVisit: '1 month ago' },
];

const MOCK_CAMPAIGNS = [
  { id: 'CAMP-1', name: 'Diwali Bonanza',  segment: 'All Members',    type: 'WhatsApp', sent: 12400, conv: '4.2%', status: 'COMPLETED' },
  { id: 'CAMP-2', name: 'Win-back Lapsed', segment: 'Inactive > 90d', type: 'SMS',      sent: 3200,  conv: '1.8%', status: 'ACTIVE' },
  { id: 'CAMP-3', name: 'Platinum VIP',    segment: 'Platinum Only',  type: 'WhatsApp', sent: 145,   conv: '-',    status: 'DRAFT' },
];

// ── Dashboard Tab ────────────────────────────────────────────
const DashboardTab: React.FC = () => (
  <div style={{ padding: 24 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
      {[
        { label: 'Total Members', value: '12,402', icon: <Users size={16} color="#3b82f6" /> },
        { label: 'Points Issued (YTD)', value: '1.4M', icon: <Gift size={16} color="#f59e0b" /> },
        { label: 'Points Redeemed', value: '840K', icon: <Trophy size={16} color="#10b981" /> },
        { label: 'Redemption Rate', value: '60%', icon: <Zap size={16} color="#ef4444" /> },
      ].map((k) => (
        <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{k.label}</div>
            {k.icon}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{k.value}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      {/* Tier Distribution */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tier Distribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TIERS.map((t, i) => {
            const pct = [60, 25, 12, 3][i];
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, fontSize: 11, fontWeight: 700, color: t.color }}>{t.name}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--surface-muted)', borderRadius: 0 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: t.color }} />
                </div>
                <div style={{ width: 40, textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ padding: '10px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={14} /> New WhatsApp Campaign
          </button>
          <button style={{ padding: '10px', background: 'var(--surface-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={14} /> Create Bonus Event
          </button>
          <button style={{ padding: '10px', background: 'var(--surface-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={14} /> Loyalty Settings
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Customer 360 Tab ─────────────────────────────────────────
const Customer360Tab: React.FC = () => (
  <div style={{ padding: 24 }}>
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input 
          type="text" 
          placeholder="Search by Name, Phone, or ID..." 
          style={{ width: '100%', height: 36, paddingLeft: 32, fontSize: 13, border: '1px solid var(--border-default)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }}
        />
      </div>
      <button style={{ padding: '0 16px', height: 36, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
        Search
      </button>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#1a4a48', color: '#fff' }}>
          {['ID', 'Name', 'Phone', 'Tier', 'Points', 'Total Spend', 'Last Visit', 'Action'].map((h) => (
            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {MOCK_CUSTOMERS.map((c, i) => {
          const tierInfo = TIERS.find(t => t.id === c.tier);
          return (
            <tr key={c.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{c.id}</td>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{c.phone}</td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: tierInfo?.color, padding: '2px 8px', background: `${tierInfo?.color}15`, textTransform: 'uppercase' }}>
                  {tierInfo?.name}
                </span>
              </td>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 700 }}>{c.points.toLocaleString()}</td>
              <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>₹{c.spend.toLocaleString()}</td>
              <td style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontSize: 12 }}>{c.lastVisit}</td>
              <td style={{ padding: '10px 14px' }}>
                <button style={{ padding: '4px 10px', fontSize: 11, cursor: 'pointer', background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                  View 360
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ── Tiers Tab ────────────────────────────────────────────────
const TiersTab: React.FC = () => (
  <div style={{ padding: 24 }}>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
      Configure earning rules, redemption limits, and tier thresholds. (Pushed to all stores via HO)
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
      {TIERS.map((t) => (
        <div key={t.id} style={{ background: 'var(--surface)', border: `1px solid ${t.color}`, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Crown size={20} color={t.color} />
            <span style={{ fontSize: 16, fontWeight: 800, color: t.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.name}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Requirement</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.req}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Earn Rate</div>
              <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{t.pts}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Benefits</div>
              <div style={{ color: 'var(--text-secondary)' }}>{t.benefits}</div>
            </div>
          </div>
          
          <button style={{ marginTop: 20, width: '100%', height: 32, background: 'transparent', border: `1px solid ${t.color}`, color: t.color, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Edit Tier
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ── Campaigns Tab ────────────────────────────────────────────
const CampaignsTab: React.FC = () => (
  <div style={{ padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {['All', 'Active', 'Drafts', 'Completed'].map((filter, i) => (
          <button key={filter} style={{
            padding: '6px 14px', fontSize: 12, cursor: 'pointer',
            background: i === 0 ? 'var(--primary)' : 'var(--surface)',
            color: i === 0 ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border-default)', fontWeight: i === 0 ? 600 : 400
          }}>
            {filter}
          </button>
        ))}
      </div>
      <button style={{ padding: '6px 16px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
        + Create Campaign
      </button>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#1a4a48', color: '#fff' }}>
          {['Campaign ID', 'Name', 'Target Segment', 'Channel', 'Sent To', 'Conversion', 'Status', 'Action'].map((h) => (
            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {MOCK_CAMPAIGNS.map((c, i) => (
          <tr key={c.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
            <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{c.id}</td>
            <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
            <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{c.segment}</td>
            <td style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                {c.type}
              </span>
            </td>
            <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{c.sent.toLocaleString()}</td>
            <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>{c.conv}</td>
            <td style={{ padding: '10px 14px' }}>
              <span style={{ 
                fontSize: 11, fontWeight: 700, padding: '2px 8px', 
                background: c.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : c.status === 'COMPLETED' ? 'rgba(59,130,246,0.1)' : 'rgba(148,163,184,0.1)',
                color: c.status === 'ACTIVE' ? '#10b981' : c.status === 'COMPLETED' ? '#3b82f6' : 'var(--text-secondary)'
              }}>
                {c.status}
              </span>
            </td>
            <td style={{ padding: '10px 14px' }}>
              <button style={{ padding: '4px 10px', fontSize: 11, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                {c.status === 'DRAFT' ? 'Edit' : 'View Stats'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Main Loyalty Module ──────────────────────────────────────
export const LoyaltyModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabContent: Record<Tab, React.ReactNode> = {
    dashboard: <DashboardTab />,
    customers: <Customer360Tab />,
    tiers:     <TiersTab />,
    campaigns: <CampaignsTab />,
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--background)', fontFamily: 'var(--font-primary)' }}>
      {/* Header */}
      <div style={{ background: '#1a4a48', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '2px solid var(--accent)' }}>
        <Trophy size={20} color="var(--accent)" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>LOYALTY & CRM PROTOCOL</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Module 18 · Points · Tiers · WhatsApp Campaigns</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', background: 'var(--surface)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px', fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400,
              cursor: 'pointer', background: activeTab === t.id ? 'var(--primary)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default LoyaltyModule;
