// ============================================================
// SMRITI-OS — BulkItemImport
// High-Speed ItemMaster Injection UI
// (c) 2026 AITDL Network — Jawahar R Mallah
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { useBulkItemParser, ParsedItem, FieldDef } from './hooks/useBulkItemParser';

// ──────────────────────────────────────────────────────────────
// Styles (inline, self-contained — no external deps)
// ──────────────────────────────────────────────────────────────

const S = {
  wrap: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%)',
    minHeight: '100vh',
    color: '#e2e8f0',
    padding: '24px',
  } as React.CSSProperties,

  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    backdropFilter: 'blur(12px)',
  } as React.CSSProperties,

  title: {
    fontSize: '22px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '20px',
  } as React.CSSProperties,

  pasteZone: (dragging: boolean) => ({
    border: `2px dashed ${dragging ? '#a78bfa' : 'rgba(167,139,250,0.3)'}`,
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: dragging ? 'rgba(167,139,250,0.08)' : 'transparent',
    marginBottom: '16px',
  }),

  btn: (variant: 'primary' | 'ghost' | 'danger') => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: variant === 'ghost' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    transition: 'all 0.2s',
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
      : variant === 'danger'
      ? 'rgba(239,68,68,0.15)'
      : 'rgba(255,255,255,0.06)',
    color: variant === 'danger' ? '#f87171' : '#e2e8f0',
  } as React.CSSProperties),

  badge: (color: 'green' | 'red' | 'yellow' | 'blue') => {
    const colors = {
      green:  { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
      red:    { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
      yellow: { bg: 'rgba(234,179,8,0.15)',   text: '#facc15' },
      blue:   { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa' },
    };
    return {
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      background: colors[color].bg,
      color: colors[color].text,
    } as React.CSSProperties;
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '12px',
    overflowX: 'auto' as const,
  },

  th: {
    padding: '8px 10px',
    background: 'rgba(167,139,250,0.1)',
    color: '#a78bfa',
    fontWeight: 600,
    textAlign: 'left' as const,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap' as const,
  },

  td: {
    padding: '7px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: '#cbd5e1',
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  progressBar: (pct: number) => ({
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: '12px',
    position: 'relative' as const,
  }),

  progressFill: (pct: number) => ({
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(90deg, #7c3aed, #60a5fa)',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  }),

  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '14px 18px',
    flex: 1,
    minWidth: '120px',
  } as React.CSSProperties,

  statVal: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#a78bfa',
    lineHeight: 1,
  },

  statLabel: {
    fontSize: '11px',
    color: '#475569',
    marginTop: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
};

// ──────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────

function StatCard({ value, label, color = '#a78bfa' }: { value: number | string; label: string; color?: string }) {
  return (
    <div style={S.statCard}>
      <div style={{ ...S.statVal, color }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

function PipelineStep({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700,
        background: done ? 'rgba(34,197,94,0.2)' : active ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
        color: done ? '#4ade80' : active ? '#a78bfa' : '#475569',
        border: `1px solid ${done ? '#4ade80' : active ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.3s',
      }}>
        {done ? '✓' : step}
      </div>
      <span style={{ fontSize: '12px', color: done ? '#4ade80' : active ? '#e2e8f0' : '#475569', transition: 'color 0.3s' }}>
        {label}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

export default function BulkItemImport() {
  const {
    isLoadingConfig, isSubmitting, config, template,
    parsedItems, parseErrors, importResult, progress, error,
    loadConfig, parseClipboard, onPaste, submitImport, reset,
  } = useBulkItemParser();

  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'preview' | 'result'>('paste');
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  // Load config on mount
  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Auto-switch tab when items are parsed
  useEffect(() => {
    if (parsedItems.length > 0) setActiveTab('preview');
  }, [parsedItems.length]);

  useEffect(() => {
    if (importResult) setActiveTab('result');
  }, [importResult]);

  // Pipeline steps (derived from progress %) — used in progress bar label
  const pipelineStep = Math.min(5, Math.ceil((progress / 100) * 5));
  void pipelineStep; // consumed in JSX below

  // Visible columns for grid (required + classification + enabled analcodes)
  const gridColumns: FieldDef[] = template
    ? [
        ...template.required_fields,
        ...template.classification_fields,
        ...template.optional_fields.slice(0, 5), // Show first 5 optional
        ...template.analcode_fields.filter(f => f.enabled),
      ]
    : [];

  const handlePasteArea = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text) parseClipboard(text);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const text = e.dataTransfer.getData('text');
    if (text) parseClipboard(text);
  };

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={S.title}>⚡ Bulk Item Import Pipeline</div>
        <div style={S.subtitle}>
          High-speed atomic injection · Sysparam-driven fields · S9 Schema Parity
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {config && (
            <>
              <span style={S.badge('blue')}>
                {config.captions.class1cd} × {config.captions.class2cd}
              </span>
              {config.enabled.subclass1cd && <span style={S.badge('blue')}>{config.captions.subclass1cd}</span>}
              {config.enabled.subclass2cd && <span style={S.badge('blue')}>{config.captions.subclass2cd}</span>}
              {config.enabled.sizecd && <span style={S.badge('blue')}>{config.captions.sizecd}</span>}
              {config.enabled.superclass1 && <span style={S.badge('yellow')}>{config.captions.superclass1}</span>}
              {config.enabled.superclass2 && <span style={S.badge('yellow')}>{config.captions.superclass2}</span>}
              {Object.entries(config.analcode_enabled).filter(([,v]) => v).map(([k]) => (
                <span key={k} style={S.badge('green')}>
                  {config.analcode_captions[Number(k)]}
                </span>
              ))}
            </>
          )}
          {isLoadingConfig && <span style={S.badge('yellow')}>Loading config…</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
        {(['paste', 'preview', 'result'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            ...S.btn('ghost'),
            background: activeTab === tab ? 'rgba(167,139,250,0.15)' : 'transparent',
            color: activeTab === tab ? '#a78bfa' : '#64748b',
            position: 'relative' as const,
          }}>
            {tab === 'paste' ? '📋 Paste Data' : tab === 'preview' ? `🔍 Preview ${parsedItems.length > 0 ? `(${parsedItems.length})` : ''}` : '📊 Result'}
            {tab === 'preview' && parseErrors.length > 0 && (
              <span style={{ ...S.badge('red'), marginLeft: '6px', fontSize: '10px' }}>{parseErrors.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Paste */}
      {activeTab === 'paste' && (
        <div style={S.card}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>
            Copy rows from Excel / Shoper 9 Item Master grid → Paste here
          </div>
          <div
            style={S.pasteZone(dragging)}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => pasteRef.current?.focus()}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '15px', color: '#64748b', marginBottom: '8px' }}>
              Click here then <strong style={{ color: '#a78bfa' }}>Ctrl+V</strong> to paste, or drag & drop TSV data
            </div>
            <div style={{ fontSize: '12px', color: '#374151' }}>
              First row must be headers matching: StockNo · {config?.captions.class1cd ?? 'Product'} · {config?.captions.class2cd ?? 'Brand'} · Item Description · Retail Price
            </div>
            <textarea
              ref={pasteRef}
              onPaste={handlePasteArea}
              style={{
                position: 'absolute', opacity: 0, width: '1px', height: '1px',
                pointerEvents: 'none',
              }}
              aria-label="Paste area for bulk item data"
              readOnly
            />
          </div>

          {/* Field Reference */}
          {template && (
            <div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Expected Column Headers
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {template.required_fields.map(f => (
                  <span key={f.column} style={{ ...S.badge('blue'), fontSize: '11px' }}>
                    {f.caption} *
                  </span>
                ))}
                {template.classification_fields.map(f => (
                  <span key={f.column} style={{ ...S.badge('green'), fontSize: '11px' }}>
                    {f.caption}
                  </span>
                ))}
                {template.optional_fields.slice(0, 8).map(f => (
                  <span key={f.column} style={{ ...S.badge('yellow'), fontSize: '11px', opacity: 0.7 }}>
                    {f.caption}
                  </span>
                ))}
                {template.analcode_fields.filter(f => f.enabled).map(f => (
                  <span key={f.column} style={{ ...S.badge('green'), fontSize: '11px' }}>
                    {f.caption}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#374151', marginTop: '8px' }}>
                * Required · <span style={{ color: '#4ade80' }}>■</span> Classification · <span style={{ color: '#facc15' }}>■</span> Optional · Max 5000 rows per batch
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Preview */}
      {activeTab === 'preview' && (
        <div>
          {/* Validation Errors */}
          {parseErrors.length > 0 && (
            <div style={{ ...S.card, border: '1px solid rgba(239,68,68,0.3)', marginBottom: '12px' }}>
              <div style={{ color: '#f87171', fontWeight: 600, marginBottom: '8px' }}>
                ⚠ {parseErrors.length} Validation Error{parseErrors.length > 1 ? 's' : ''}
              </div>
              {parseErrors.slice(0, 5).map((err, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '4px' }}>
                  Row {err.row} · <strong>{err.column}</strong>: {err.message}
                </div>
              ))}
              {parseErrors.length > 5 && (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>…and {parseErrors.length - 5} more errors</div>
              )}
            </div>
          )}

          {/* Summary */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <StatCard value={parsedItems.length} label="Items Parsed" />
            <StatCard value={parseErrors.length} label="Errors" color={parseErrors.length > 0 ? '#f87171' : '#4ade80'} />
            <StatCard
              value={[...new Set(parsedItems.map(i => i['class1cd']))].filter(Boolean).length}
              label={`Unique ${config?.captions.class1cd ?? 'Products'}`}
              color="#60a5fa"
            />
            <StatCard
              value={[...new Set(parsedItems.map(i => i['class2cd']))].filter(Boolean).length}
              label={`Unique ${config?.captions.class2cd ?? 'Brands'}`}
              color="#34d399"
            />
          </div>

          {/* Data Grid */}
          {parsedItems.length > 0 && (
            <div style={{ ...S.card, overflow: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, color: '#475569' }}>#</th>
                    {gridColumns.map(col => (
                      <th key={col.column} style={S.th}>{col.caption}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedItems.slice(0, 50).map((item, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ ...S.td, color: '#475569' }}>{idx + 1}</td>
                      {gridColumns.map(col => (
                        <td key={col.column} style={S.td} title={String(item[col.column] ?? '')}>
                          {item[col.column] !== null && item[col.column] !== undefined
                            ? String(item[col.column])
                            : <span style={{ color: '#374151' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedItems.length > 50 && (
                <div style={{ textAlign: 'center', padding: '12px', color: '#475569', fontSize: '12px' }}>
                  Showing 50 of {parsedItems.length} rows
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button
              style={S.btn('primary')}
              onClick={() => submitImport()}
              disabled={isSubmitting || parsedItems.length === 0}
            >
              {isSubmitting ? '⏳ Injecting…' : `🚀 Import ${parsedItems.length} Items`}
            </button>
            <button style={S.btn('ghost')} onClick={() => setActiveTab('paste')}>
              ← Paste Again
            </button>
            <button style={S.btn('danger')} onClick={reset}>
              🗑 Clear
            </button>
          </div>
        </div>
      )}

      {/* Tab: Result */}
      {activeTab === 'result' && importResult && (
        <div>
          {/* Pipeline Steps */}
          <div style={S.card}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '14px' }}>
              Pipeline Execution
            </div>
            <PipelineStep step={1} label="Genlookup Upsert (Class1, Class2, SuperClass, AnalCodes)" active={false} done />
            <PipelineStep step={2} label="Class12combo Upsert (Product × Brand matrix)" active={false} done />
            <PipelineStep step={3} label="Itemmaster Bulk INSERT (audit-bypass)" active={false} done />
            <PipelineStep step={4} label="Stockmaster Auto-Init (Qty = 0)" active={false} done />
            <PipelineStep step={5} label="Atomic Commit" active={false} done />
          </div>

          {/* Result Stats */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <StatCard value={importResult.items_inserted} label="Items Inserted" color="#4ade80" />
            <StatCard value={importResult.items_skipped} label="Skipped (Existing)" color="#facc15" />
            <StatCard value={importResult.items_errored} label="Errors" color={importResult.items_errored > 0 ? '#f87171' : '#4ade80'} />
            <StatCard value={importResult.genlookup_inserted} label="Lookup Values Added" color="#60a5fa" />
            <StatCard value={importResult.combo_inserted} label="New Combos" color="#a78bfa" />
            <StatCard value={importResult.stock_rows_init} label="Stock Rows Init" color="#34d399" />
          </div>

          {/* Status Banner */}
          <div style={{
            ...S.card,
            border: `1px solid ${importResult.items_errored === 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            background: importResult.items_errored === 0 ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: importResult.items_errored === 0 ? '#4ade80' : '#f87171' }}>
              {importResult.items_errored === 0 ? '✅ Import Successful!' : '⚠ Import Completed with Errors'}
            </div>
            {importResult.errors.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                {importResult.errors.slice(0, 5).map((e, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '4px' }}>
                    <strong>{e.stockno}</strong>: {e.error}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={S.btn('primary')} onClick={() => { reset(); setActiveTab('paste'); }}>
              📋 Import More
            </button>
            <button style={S.btn('ghost')} onClick={() => setActiveTab('preview')}>
              ← Back to Preview
            </button>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#fca5a5',
          fontSize: '13px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Progress Bar (visible during submit) */}
      {isSubmitting && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
            Running pipeline… Step {Math.ceil((progress / 100) * 5)} of 5
          </div>
          <div style={S.progressBar(progress)}>
            <div style={S.progressFill(progress)} />
          </div>
        </div>
      )}
    </div>
  );
}
