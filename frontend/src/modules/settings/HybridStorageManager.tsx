/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation     :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Activity,
  HardDrive,
  ArrowRightLeft
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Button,
  Badge,
  Switch,
  Progress 
} from '@/components/ui/SovereignUI';

const HybridStorageManager: React.FC = () => {
  const [mode, setMode] = useState<'CLOUD' | 'SOVEREIGN'>('CLOUD');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [cloudStatus, setCloudStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('CONNECTED');
  const [localStatus, setLocalStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('CONNECTED');

  const handleModeChange = async (newMode: 'CLOUD' | 'SOVEREIGN') => {
    setMode(newMode);
    // In a real app, this would call an API to update backend .env or session
    console.log(`Switching to ${newMode} mode...`);
  };

  const runDiagnostics = () => {
    setIsSyncing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setSyncProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsSyncing(false);
      }
    }, 100);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] uppercase italic">
            Hybrid <span className="text-[var(--primary)]">Storage</span> Engine
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">
            Manage your Sovereign Data Lineage and Cloud Synchronization.
          </p>
        </div>
        <Button variant="secondary" className="border-[var(--primary)] text-[var(--primary)] font-bold" onClick={runDiagnostics}>
          <Activity size={16} className="mr-2" /> RUN DIAGNOSTICS
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* SOVEREIGN MODE CARD */}
        <Card className={`relative overflow-hidden border-2 transition-all duration-500 ${mode === 'SOVEREIGN' ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02] shadow-2xl' : 'border-transparent opacity-60'}`}
              onClick={() => handleModeChange('SOVEREIGN')}>
          <div className="absolute top-0 right-0 p-4">
            <Badge variant={localStatus === 'CONNECTED' ? 'success' : 'danger'} className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
              {localStatus}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <Server className="text-blue-500" size={32} />
            </div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Sovereign Mode</CardTitle>
            <CardDescription className="font-medium">Local-First. Institutional. Zero Cloud Dependency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              In Sovereign mode, SMRITI-OS connects directly to the <strong>Local Hyper-V Node (AITDL)</strong>. 
              No billing data ever leaves your Windows environment. Best for high-security retail nodes.
            </p>
            <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Local IP</div>
                <div className="font-mono text-sm">192.168.1.104 (AITDL)</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Database</div>
                <div className="font-mono text-sm">Shoper9X01</div>
              </div>
            </div>
            {mode === 'SOVEREIGN' && (
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs animate-pulse">
                <CheckCircle2 size={14} /> ACTIVE SOVEREIGN NODE
              </div>
            )}
          </CardContent>
        </Card>

        {/* CLOUD MODE CARD */}
        <Card className={`relative overflow-hidden border-2 transition-all duration-500 ${mode === 'CLOUD' ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02] shadow-2xl' : 'border-transparent opacity-60'}`}
              onClick={() => handleModeChange('CLOUD')}>
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="success" className="bg-purple-500/20 text-purple-500 border-purple-500/30">
              CONNECTED
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
              <Cloud className="text-purple-500" size={32} />
            </div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Cloud Mode</CardTitle>
            <CardDescription className="font-medium">Centralized. Scalable. Real-time Multi-store Sync.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Connect your retail nodes to the <strong>SMRITI Cloud (Supabase)</strong>. 
              Enables real-time analytics, HO reporting, and multi-store loyalty programs from any browser.
            </p>
            <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Endpoint</div>
                <div className="font-mono text-sm truncate">ap-southeast-1.supabase.co</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Encryption</div>
                <div className="font-mono text-sm">AES-256 (TLS 1.3)</div>
              </div>
            </div>
            {mode === 'CLOUD' && (
              <div className="flex items-center gap-2 text-purple-500 font-bold text-xs animate-pulse">
                <CheckCircle2 size={14} /> ACTIVE CLOUD INSTANCE
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-12 bg-[var(--card-bg)] border-[var(--border-subtle)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase italic text-lg tracking-wider">
            <ArrowRightLeft className="text-[var(--primary)]" size={20} />
            Sync <span className="text-[var(--primary)]">Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)]">
              <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-2">Sync Mode</div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <span className="font-bold">Real-time (Delta)</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)]">
              <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-2">Last Heartbeat</div>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" />
                <span className="font-bold">Just Now (2s ago)</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)]">
              <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-2">Data Integrity</div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-500" />
                <span className="font-bold">100% Verifed</span>
              </div>
            </div>
          </div>

          {isSyncing && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span>Synchronizing Local ↔ Cloud</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={mode === 'SOVEREIGN' && cloudStatus === 'CONNECTED'} />
                <span className="font-bold text-[var(--text-secondary)] uppercase text-xs">Failover Protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={true} />
                <span className="font-bold text-[var(--text-secondary)] uppercase text-xs">Auto-Backup to Node</span>
              </div>
            </div>
            <Button className="bg-[var(--primary)] text-white font-black px-8">SAVE CONFIGURATION (Ctrl+S)</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 opacity-70">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--card-bg)]/30">
          <HardDrive size={24} className="text-[var(--text-secondary)]" />
          <div>
            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Host Machine</div>
            <div className="text-xs font-bold">HYPERV-SVR-01 (Win 11 Pro)</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--card-bg)]/30">
          <Globe size={24} className="text-[var(--text-secondary)]" />
          <div>
            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Cloud Gateway</div>
            <div className="text-xs font-bold">Azure SG Node (Supabase Proxy)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridStorageManager;
