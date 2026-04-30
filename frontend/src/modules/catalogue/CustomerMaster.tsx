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

import { Users, Search, Plus, UserPlus, Phone, Award } from 'lucide-react';
import { DataTable } from '../../components/ui/SovereignUI';

export default function CustomerMaster() {
  return (
    <div className="flex flex-col gap-6" style={{ padding: '0 4px' }}>

      {/* ── Page Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
            CRM Registry
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Customer Master
          </h1>
        </div>
        <button
          className="flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={14} />
          Enroll Member
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-tertiary)' }}
        />
        <input
          placeholder="Search CRM by Mobile, Name, UID..."
          className="w-full h-9 pl-12 pr-4 text-sm rounded-lg outline-none transition-colors"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      <div className="rounded-xl overflow-hidden min-h-[400px]">
        <DataTable
          data={[]}
          emptyMessage="CRM Registry Empty"
          columns={[
            { header: 'Member ID', accessor: 'id', className: 'font-mono text-xs' },
            { header: 'Full Name', accessor: 'name', className: 'font-bold uppercase' },
            { header: 'Contact', accessor: 'mobile', className: 'font-mono' },
            { header: 'Points', accessor: (item: any) => item.points || 0, align: 'center', className: 'font-bold text-accent' },
            { header: 'Loyalty Tier', accessor: 'tier', align: 'right', className: 'font-black' }
          ]}
        />
      </div>
    </div>
  );
}




