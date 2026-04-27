/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React from 'react';
import { Users, Search, Plus, UserPlus, Phone, Award } from 'lucide-react';

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
          className="w-full h-9 pl-9 pr-4 text-sm rounded-lg outline-none transition-colors"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Table header */}
        <div
          className="grid px-5 py-3"
          style={{
            gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {['Member ID', 'Full Name', 'Contact', 'Points', 'Loyalty Tier'].map((col, i) => (
            <span
              key={col}
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-tertiary)', textAlign: i === 4 ? 'right' : 'left' }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-24 gap-4 select-none">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
          >
            <Users size={24} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              CRM Registry Empty
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Enroll your first customer to get started
            </p>
          </div>
          <button
            className="flex items-center gap-2 mt-2 px-4 h-8 rounded-lg text-xs font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--accent-light)' }}
          >
            <UserPlus size={13} /> Enroll First Member
          </button>
        </div>
      </div>
    </div>
  );
}
