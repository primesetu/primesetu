/* ============================================================
 * SMRITI-OS — Architect's Command Center (Full Mission Control)
 * Deployment Modes: LOCAL | CLOUD | HYBRID
 * Schema Studio: Shoper9 → SmritiSetu Introspection & Provisioning
 * ============================================================ */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Shield, Database, Activity, Globe, Zap, Cpu, Server,
  CloudLightning, RefreshCcw, ArrowRight, Wifi, WifiOff,
  HardDrive, Share2, Lock, Terminal, CheckCircle2, AlertCircle,
  Settings, Monitor, ArrowRightLeft, Layers, Plus, Download,
  Copy, ChevronRight, FlaskConical, PackagePlus, Palette
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Flex, Grid, Container, Text, Divider, Switch
} from '@/components/ui/SovereignUI';
import { apiClient } from '@/api/client';

type DeployMode = 'LOCAL' | 'CLOUD' | 'HYBRID';
type Tab = 'deploy' | 'connect' | 'database' | 'telemetry' | 'schema' | 'config' | 'theme';

function cn(...c: any[]) { return c.filter(Boolean).join(' '); }

// ── SUB COMPONENTS ────────────────────────────────────────────

const StatusDot = ({ ok }: { ok: boolean }) => (
  <span className={cn("inline-block w-2 h-2 rounded-full mr-2", ok ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
);

const InfoRow = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <Flex between className="py-2 border-b border-[var(--border-subtle)] last:border-0">
    <Text variant="xs" className="opacity-50">{label}</Text>
    <span className={cn("text-xs font-bold", mono && "font-mono text-blue-400")}>{value}</span>
  </Flex>
);

// ── DEPLOY MODE CARDS ─────────────────────────────────────────

const DEPLOY_MODES = [
  {
    id: 'LOCAL' as DeployMode,
    icon: HardDrive,
    emoji: '🖥️',
    title: 'Local Sovereign',
    subtitle: 'Zero Internet · Maximum Privacy',
    desc: 'Full on-premise. Frontend + Backend + DB all on your Windows machine. Works even without internet.',
    cost: '₹0 / month',
    speed: '< 5ms LAN',
    internet: false,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
    setup: ['Build frontend → Nginx', 'FastAPI as Windows Service', 'Local MSSQL / Postgres', 'Auto-start on boot'],
  },
  {
    id: 'CLOUD' as DeployMode,
    icon: Globe,
    emoji: '🌐',
    title: 'Web Host',
    subtitle: 'Global Access · Multi-Store',
    desc: 'Frontend on Cloudflare Pages, backend on VPS/Railway. Access from anywhere in the world.',
    cost: '₹500–1500 / month',
    speed: '50–150ms',
    internet: true,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500',
    setup: ['Frontend → Cloudflare Pages', 'Backend → VPS / Railway', 'DB → Supabase Cloud', 'SSL auto via Caddy'],
  },
  {
    id: 'HYBRID' as DeployMode,
    icon: ArrowRightLeft,
    emoji: '🔀',
    title: 'Hybrid Bridge',
    subtitle: 'Local Power + Cloud Reach',
    desc: 'Local backend exposed via Cloudflare Tunnel or FRP. Works offline, syncs when internet is back.',
    cost: '₹300–800 / month',
    speed: 'Adaptive',
    internet: true,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500',
    setup: ['Local backend (always-on)', 'Cloudflare Tunnel / FRP', 'Auto failover to local', 'Sync when reconnected'],
  },
];

const MODULES = [
  { id: 'hybrid_storage', icon: CloudLightning, label: 'Hybrid Engine', desc: 'Toggle Cloud vs Sovereign storage', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'table_viewer',  icon: Database,       label: 'DB Explorer',   desc: 'Introspect Shoper9 & Smriti schemas', color: 'text-blue-500',  bg: 'bg-blue-500/10' },
  { id: 'security',      icon: Lock,           label: 'Security Vault', desc: 'Roles, permissions & audit log', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'settings',      icon: Settings,       label: 'System Config',  desc: 'SysParams & print templates', color: 'text-slate-400', bg: 'bg-slate-500/10' },
];

// ── MAIN COMPONENT ────────────────────────────────────────────

const ArchitectControlCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('deploy');
  const [deployMode, setDeployMode] = useState<DeployMode>('LOCAL');
  
  const [configSubTab, setConfigSubTab] = useState<'params' | 'lookups'>('params');
  const [selectedLookupType, setSelectedLookupType] = useState<string | null>(null);
  const [lookupTypes, setLookupTypes] = useState<string[]>([]);
  const [lookups, setLookups] = useState<any[]>([]);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [params, setParams] = useState<any[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'config') {
      // Fetch SysParam categories
      apiClient.get('/settings/sysparams/categories')
        .then(res => res.data)
        .then(data => {
          setCategories(data);
          if (data.length > 0 && !selectedCategory) setSelectedCategory(data[0].code);
        });
      
      // Fetch GenLookUp types
      apiClient.get('/settings/genlookups/types')
        .then(res => res.data)
        .then(data => {
          setLookupTypes(data);
          if (data.length > 0 && !selectedLookupType) setSelectedLookupType(data[0]);
        });
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedLookupType && configSubTab === 'lookups') {
      setIsLookupLoading(true);
      apiClient.get(`/settings/genlookups/${selectedLookupType}`)
        .then(res => res.data)
        .then(data => {
          setLookups(data);
          setIsLookupLoading(false);
        });
    }
  }, [selectedLookupType, configSubTab]);

  useEffect(() => {
    if (selectedCategory) {
      setIsConfigLoading(true);
      apiClient.get(`/settings/sysparams/${selectedCategory}`)
        .then(res => res.data)
        .then(data => {
          setParams(data);
          setIsConfigLoading(false);
        });
    }
  }, [selectedCategory]);

  const updateParam = async (id: string, field: string, value: any) => {
    try {
      await apiClient.put(`/settings/sysparams/${id}`, { [field]: value });
      // Optimistic update
      setParams(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch (err) {
      console.error("Failed to update param", err);
    }
  };
  const [tunnelMode, setTunnelMode] = useState<'CLOUDFLARE' | 'FRP'>('CLOUDFLARE');
  const [serverIP, setServerIP] = useState('192.168.1.104');
  const [domain, setDomain] = useState('yourdomain.com');
  const [vpsIP, setVpsIP] = useState('');
  const [failover, setFailover] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const navigate = (id: string) => window.dispatchEvent(new CustomEvent('navigate', { detail: id }));

  // ── SCHEMA STUDIO STATE ────────────────────────────────────
  const [s9Tables, setS9Tables] = useState<{ name: string; rows: number }[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableStructure, setTableStructure] = useState<any>(null);
  const [generatedDDL, setGeneratedDDL] = useState<string>('');
  const [ddlLoading, setDdlLoading] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [newClientId, setNewClientId] = useState('STORE001');
  const [newClientName, setNewClientName] = useState('');
  const [newSchemaName, setNewSchemaName] = useState('shoper9');  // exact Shoper9 schema name
  const [provisionLog, setProvisionLog] = useState<string[]>([]);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  
  // MSSQL Provisioning state
  const [mssqlStoreCode, setMssqlStoreCode] = useState('10256789');
  const [mssqlProvisionLoading, setMssqlProvisionLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    setLoadingTables(true);
    try {
      const res = await apiClient.get('/schema/shoper9/tables');
      const data = res.data;
      setS9Tables(data.tables || []);
    } catch (e) {
      setS9Tables([]);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  const fetchTableStructure = async (tableName: string) => {
    setSelectedTable(tableName);
    setTableStructure(null);
    setGeneratedDDL('');
    try {
      const res = await apiClient.get(`/schema/shoper9/tables/${tableName}`);
      const data = res.data;
      setTableStructure(data);
    } catch {}
  };

  const generateDDL = async () => {
    if (!selectedTable) return;
    setDdlLoading(true);
    try {
      // No enhancements — exact 1:1 Shoper9 original structure
      const res = await apiClient.get(`/schema/generate-ddl/${selectedTable}?target_schema=shoper9&add_enhancements=false`);
      const data = res.data;
      setGeneratedDDL(data.ddl || '');
    } catch {}
    setDdlLoading(false);
  };

  const copyDDL = () => {
    navigator.clipboard.writeText(generatedDDL);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  const provisionClient = async () => {
    if (!newClientName) return;
    setProvisionLoading(true);
    setProvisionLog(['⏳ Starting provisioning...']);
    try {
      // Uses shoper9 schema — exact original table structure, no new tables
      const res = await apiClient.post(
        `/schema/provision?client_id=${newClientId}&client_name=${encodeURIComponent(newClientName)}&schema_name=${newSchemaName}&include_seed=true`
      );
      const data = res.data;
      setProvisionLog(data.log || [JSON.stringify(data)]);
    } catch (e: any) {
      setProvisionLog(['❌ Error: ' + e.message]);
    }
    setProvisionLoading(false);
  };

  const provisionMssql = async () => {
    if (!mssqlStoreCode) return;
    setMssqlProvisionLoading(true);
    setProvisionLog([`⏳ Starting MSSQL DB creation for SMRITISETU${mssqlStoreCode}...`]);
    try {
      const res = await apiClient.post(
        `/schema/provision-mssql?store_code=${encodeURIComponent(mssqlStoreCode)}`
      );
      const data = res.data;
      setProvisionLog(data.log || [JSON.stringify(data)]);
    } catch (e: any) {
      setProvisionLog(['❌ Error: ' + e.message]);
    }
    setMssqlProvisionLoading(false);
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'deploy',    label: 'Deployment Mode', icon: Monitor },
    { id: 'connect',   label: 'Connection Setup', icon: Share2 },
    { id: 'database',  label: 'DB Provisioning',  icon: Database },
    { id: 'schema',    label: 'Schema Studio',    icon: Terminal },
    { id: 'config',    label: 'System Config',    icon: Settings },
    { id: 'theme',     label: 'Theme Manager',    icon: Palette },
  ];

  const selectedMode = DEPLOY_MODES.find(m => m.id === deployMode)!;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="px-8 pt-8 pb-0 shrink-0">
        <Flex between itemsCenter className="mb-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--foreground)]">
              Architect's <span className="text-[var(--primary)]">Command Center</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 opacity-60 font-medium">
              Unified control for Deployment, Connectivity, and System Integrity.
            </p>
          </div>
          <Flex gap={3}>
            <Badge variant={deployMode === 'LOCAL' ? 'info' : deployMode === 'CLOUD' ? 'info' : 'warn'}>
              <StatusDot ok /> {deployMode} MODE ACTIVE
            </Badge>
            <Button variant="primary" className="px-6 shadow-lg shadow-[var(--primary)]/20">
              <RefreshCcw size={14} className="mr-2" /> SAVE & RESTART
            </Button>
          </Flex>
        </Flex>

        {/* TABS */}
        <div className="flex gap-1 border-b border-[var(--border-subtle)]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
                activeTab === t.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

        {/* ── TAB 1: DEPLOY MODE ── */}
        {activeTab === 'deploy' && (
          <div className="space-y-8 max-w-5xl">
            <Grid cols={3} gap={6}>
              {DEPLOY_MODES.map(m => (
                <div
                  key={m.id}
                  onClick={() => setDeployMode(m.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 space-y-4",
                    deployMode === m.id
                      ? `${m.border} bg-[var(--primary)]/5 scale-[1.02] shadow-xl`
                      : "border-[var(--border-subtle)] hover:border-[var(--primary)]/40 opacity-70 hover:opacity-100"
                  )}
                >
                  <Flex between>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", m.bg)}>
                      <m.icon className={m.color} size={24} />
                    </div>
                    {deployMode === m.id && <CheckCircle2 size={20} className="text-emerald-500" />}
                  </Flex>
                  <div>
                    <div className="font-black text-base uppercase italic tracking-tight">{m.title}</div>
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 opacity-60">{m.subtitle}</div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{m.desc}</p>
                  <Divider />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] font-black uppercase opacity-40 mb-0.5">Cost</div>
                      <div className="text-xs font-bold text-emerald-400">{m.cost}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase opacity-40 mb-0.5">Speed</div>
                      <div className="text-xs font-bold">{m.speed}</div>
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    {m.setup.map(s => (
                      <div key={s} className="flex items-center gap-2 text-[10px] font-medium opacity-60">
                        <CheckCircle2 size={10} className={m.color} /> {s}
                      </div>
                    ))}
                  </div>
                  {!m.internet && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                      <WifiOff size={10} /> No Internet Required
                    </div>
                  )}
                </div>
              ))}
            </Grid>

            {/* Deploy Script Info */}
            <Grid cols={2} gap={6}>
              <Card className="border-[var(--border-subtle)] p-6">
                <Text variant="xs" className="text-[var(--primary)] mb-4 block">POWERSHELL DEPLOY COMMAND</Text>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-white/5 h-24 flex items-center">
                  {deployMode === 'LOCAL' && `.\\deploy\\deploy-local.ps1 -ServerIP "${serverIP}"`}
                  {deployMode === 'CLOUD' && `# Push to GitHub → Cloudflare Pages auto-deploys\ngit push origin main`}
                  {deployMode === 'HYBRID' && `.\\deploy\\deploy-hybrid.ps1 -Mode ${tunnelMode} -Domain "${domain}"${vpsIP ? ` -VpsIP "${vpsIP}"` : ''}`}
                </div>
                <div className="mt-3 text-[10px] text-[var(--text-secondary)] opacity-50">
                  Scripts located at: <span className="font-mono">d:\\IMP\\GitHub\\primesetu\\deploy\\</span>
                </div>
              </Card>

              <Card className="border-[var(--border-subtle)] p-6">
                <Text variant="xs" className="text-blue-400 mb-4 block">PREREQUISITES & TOOLS (FOR WINDOWS)</Text>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-blue-400" />
                      <span className="text-[10px] font-bold uppercase">PostgreSQL Server</span>
                    </div>
                    <code className="text-[9px] bg-black/50 px-2 py-1 rounded text-emerald-400">winget install PostgreSQL.PostgreSQL</code>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-purple-400" />
                      <span className="text-[10px] font-bold uppercase">Cloudflare Tunnel</span>
                    </div>
                    <code className="text-[9px] bg-black/50 px-2 py-1 rounded text-emerald-400">winget install Cloudflare.cloudflared</code>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-amber-400" />
                      <span className="text-[10px] font-bold uppercase">Redis (Optional)</span>
                    </div>
                    <code className="text-[9px] bg-black/50 px-2 py-1 rounded text-emerald-400">winget install Microsoft.OpenTech.Redis</code>
                  </div>
                </div>
              </Card>
            </Grid>
          </div>
        )}

        {/* ── TAB 2: CONNECTION SETUP ── */}
        {activeTab === 'connect' && (
          <div className="space-y-6 max-w-3xl">

            {/* Local Config */}
            <Card className="border-[var(--border-subtle)] p-6 space-y-4">
              <Flex gap={3} itemsCenter>
                <HardDrive size={16} className="text-blue-500" />
                <Text variant="h3" className="text-sm">Local Server Config</Text>
              </Flex>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-50 block mb-2">Server IP (LAN)</label>
                  <input
                    value={serverIP}
                    onChange={e => setServerIP(e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="192.168.1.104"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-50 block mb-2">Backend Port</label>
                  <input
                    defaultValue="8000"
                    className="w-full bg-black/30 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <InfoRow label="Nginx Port" value="80 (HTTP)" />
              <InfoRow label="Access URL" value={`http://${serverIP}`} mono />
              <InfoRow label="API Endpoint" value={`http://${serverIP}/api/`} mono />
            </Card>

            {/* Hybrid/Cloud Config */}
            <Card className="border-[var(--border-subtle)] p-6 space-y-4">
              <Flex gap={3} itemsCenter>
                <Share2 size={16} className="text-amber-500" />
                <Text variant="h3" className="text-sm">Cloud / Tunnel Config</Text>
              </Flex>

              <div>
                <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-50 block mb-2">Your Domain</label>
                <input
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  className="w-full bg-black/30 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="yourdomain.com"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-50 block mb-2">Tunnel Mode</label>
                <div className="flex gap-3">
                  {(['CLOUDFLARE', 'FRP'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setTunnelMode(m)}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase rounded-lg border transition-all",
                        tunnelMode === m
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      )}
                    >
                      {m === 'CLOUDFLARE' ? '☁️ Cloudflare' : '🔧 FRP (Self-hosted)'}
                    </button>
                  ))}
                </div>
              </div>

              {tunnelMode === 'FRP' && (
                <div>
                  <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-50 block mb-2">VPS IP Address</label>
                  <input
                    value={vpsIP}
                    onChange={e => setVpsIP(e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="123.45.67.89"
                  />
                </div>
              )}

              <Divider />
              <InfoRow label="App URL" value={`https://app.${domain}`} mono />
              <InfoRow label="API URL" value={`https://api.${domain}`} mono />
              {tunnelMode === 'CLOUDFLARE' && <InfoRow label="Tunnel Type" value="Cloudflare Zero Trust (Free)" />}
              {tunnelMode === 'FRP' && <InfoRow label="Tunnel Type" value={`FRP via ${vpsIP || 'VPS'} (Self-hosted)`} />}
            </Card>

            {/* Failover & Sync */}
            <Card className="border-[var(--border-subtle)] p-6 space-y-4">
              <Flex gap={3} itemsCenter>
                <Zap size={16} className="text-emerald-500" />
                <Text variant="h3" className="text-sm">Failover & Sync Policy</Text>
              </Flex>
              <Flex between itemsCenter>
                <div>
                  <div className="text-xs font-bold">Auto Failover to Local</div>
                  <div className="text-[10px] text-[var(--text-secondary)] opacity-50">Internet gaye toh local mode auto-activate</div>
                </div>
                <Switch checked={failover} onCheckedChange={setFailover} />
              </Flex>
              <Flex between itemsCenter>
                <div>
                  <div className="text-xs font-bold">Auto Cloud Sync</div>
                  <div className="text-[10px] text-[var(--text-secondary)] opacity-50">Internet aane par delta sync</div>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </Flex>
              <Divider />
              <div className="text-[10px] text-[var(--text-secondary)] opacity-40">
                Sync Interval: Every 5 minutes | Last Sync: Just Now
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB 3: DATABASE & STORAGE ── */}
        {activeTab === 'database' && (
          <div className="space-y-6 max-w-5xl">
            <Grid cols={2} gap={6}>
              {MODULES.map(m => (
                <Card
                  key={m.id}
                  className="p-6 cursor-pointer border-2 border-transparent hover:border-[var(--primary)]/40 transition-all group"
                  onClick={() => navigate(m.id)}
                >
                  <Flex between itemsCenter>
                    <Flex gap={4}>
                      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", m.bg)}>
                        <m.icon className={m.color} size={28} />
                      </div>
                      <div>
                        <div className="font-black text-base uppercase italic">{m.label}</div>
                        <div className="text-xs text-[var(--text-secondary)] opacity-60 mt-1">{m.desc}</div>
                      </div>
                    </Flex>
                    <ArrowRight size={18} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[var(--primary)]" />
                  </Flex>
                </Card>
              ))}
            </Grid>

            {/* DB Connection Status */}
            <Card className="border-[var(--border-subtle)] p-6">
              <Text variant="xs" className="text-[var(--primary)] mb-4 block">ACTIVE DB CONNECTIONS</Text>
              <div className="space-y-3">
                <Flex between itemsCenter className="p-3 rounded-lg bg-black/20">
                  <Flex gap={3}><Database size={14} className="text-blue-500" /><span className="text-xs font-bold">Supabase (Cloud)</span></Flex>
                  <Badge variant="success"><StatusDot ok /> Connected</Badge>
                </Flex>
                <Flex between itemsCenter className="p-3 rounded-lg bg-black/20">
                  <Flex gap={3}><Server size={14} className="text-amber-500" /><span className="text-xs font-bold">MSSQL / Shoper9 (Local)</span></Flex>
                  <Badge variant="success"><StatusDot ok /> Connected</Badge>
                </Flex>
                <Flex between itemsCenter className="p-3 rounded-lg bg-black/20">
                  <Flex gap={3}><Share2 size={14} className="text-purple-500" /><span className="text-xs font-bold">Tunnel Endpoint</span></Flex>
                  <Badge variant="warn"><StatusDot ok={false} /> Not Configured</Badge>
                </Flex>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB 4: LIVE TELEMETRY ── */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6 max-w-5xl">
            <Grid cols={4} gap={4}>
              {[
                { label: 'API Latency', value: '14ms', icon: Activity, color: 'text-emerald-500' },
                { label: 'DB Uptime', value: '99.9%', icon: Zap, color: 'text-amber-500' },
                { label: 'CPU Load', value: '12%', icon: Cpu, color: 'text-blue-500' },
                { label: 'Active Nodes', value: '04', icon: Server, color: 'text-purple-500' },
              ].map(s => (
                <Card key={s.label} className="p-5 border-[var(--border-subtle)]">
                  <Flex gap={3}>
                    <div className={cn("p-2 rounded-lg bg-black/30", s.color)}><s.icon size={18} /></div>
                    <div>
                      <div className="text-[9px] font-black uppercase opacity-40">{s.label}</div>
                      <div className="text-lg font-black mt-0.5">{s.value}</div>
                    </div>
                  </Flex>
                </Card>
              ))}
            </Grid>

            {/* Live Log */}
            <Card className="border-[var(--border-subtle)] overflow-hidden">
              <CardHeader className="border-b border-[var(--border-subtle)] bg-black/20 py-3 px-5">
                <Flex between itemsCenter>
                  <Flex gap={2} itemsCenter>
                    <Terminal size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">System Log — Live</span>
                  </Flex>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </Flex>
              </CardHeader>
              <CardContent className="p-5 font-mono text-[11px] space-y-2 bg-black/10">
                {[
                  { t: '02:34:01', c: 'text-emerald-400', m: 'SOVEREIGN_NODE: Handshake OK → cloudflare_edge_sg1' },
                  { t: '02:34:03', c: 'text-blue-400',    m: 'DB_EXPLORER: Introspecting shoper9.stktrnhdr... 1.2ms' },
                  { t: '02:34:05', c: 'text-amber-400',   m: `HYBRID_ENGINE: storage_mode = ${deployMode}` },
                  { t: '02:34:09', c: 'text-emerald-400', m: 'SYNC_SERVICE: 12 transactions pushed to cloud_vault' },
                  { t: '02:34:12', c: 'text-purple-400',  m: `FAILOVER: Auto-failover ${failover ? 'ENABLED' : 'DISABLED'}` },
                  { t: '02:34:15', c: 'text-slate-400 animate-pulse', m: `HEARTBEAT: Instance 'MUM-X01' healthy...` },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 opacity-80 hover:opacity-100">
                    <span className="text-slate-600 shrink-0">[{log.t}]</span>
                    <span className={log.c}>{log.m}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Grid cols={3} gap={4}>
              {[
                { label: 'Force Global Sync', icon: RefreshCcw, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' },
                { label: 'Run Diagnostics', icon: Activity, color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white' },
                { label: 'Recovery Console', icon: Terminal, color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' },
              ].map(a => (
                <button key={a.label} className={cn("p-4 rounded-xl border border-[var(--border-subtle)] flex items-center gap-3 font-black text-xs uppercase transition-all", a.color)}>
                  <a.icon size={16} /> {a.label}
                </button>
              ))}
            </Grid>
          </div>
        )}

        {/* ── TAB 5: SCHEMA STUDIO ── */}
        {activeTab === 'schema' && (
          <div className="space-y-6 max-w-6xl">

            {/* Header Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                <FlaskConical className="text-violet-400" size={24} />
              </div>
              <div>
                <div className="font-black text-base uppercase italic tracking-tight">Schema Studio</div>
                <p className="text-xs text-[var(--text-secondary)] opacity-70 mt-1 leading-relaxed">
                  Introspect every Shoper9 table, preview its PostgreSQL DDL with SmritiSetu enhancements, and provision a complete new client database — <span className="text-violet-400 font-bold">one click</span>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-5">

              {/* LEFT: Table List */}
              <div className="col-span-4 space-y-3">
                <Flex between itemsCenter>
                  <Text variant="xs" className="opacity-50 font-black uppercase tracking-widest">Shoper9 Tables</Text>
                  <button
                    onClick={fetchTables}
                    disabled={loadingTables}
                    className="text-[10px] font-black uppercase text-[var(--primary)] hover:opacity-70 flex items-center gap-1"
                  >
                    <RefreshCcw size={10} className={loadingTables ? 'animate-spin' : ''} />
                    {loadingTables ? 'Loading...' : 'Refresh'}
                  </button>
                </Flex>

                {s9Tables.length === 0 ? (
                  <Card className="border-dashed border-[var(--border-subtle)] p-6 text-center">
                    <Database size={32} className="mx-auto opacity-20 mb-3" />
                    <div className="text-xs opacity-40 font-medium">Click Refresh to load Shoper9 tables</div>
                    <button
                      onClick={fetchTables}
                      className="mt-4 text-xs font-black text-[var(--primary)] hover:opacity-70"
                    >
                      Load Tables →
                    </button>
                  </Card>
                ) : (
                  <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {s9Tables.map(t => (
                      <button
                        key={t.name}
                        onClick={() => fetchTableStructure(t.name)}
                        className={cn(
                          'w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all',
                          selectedTable === t.name
                            ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-black border border-[var(--primary)]/30'
                            : 'hover:bg-white/5 font-medium opacity-70 hover:opacity-100'
                        )}
                      >
                        <span className="font-mono">{t.name}</span>
                        <span className="text-[9px] opacity-50">{t.rows.toLocaleString()} rows</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Structure + DDL */}
              <div className="col-span-8 space-y-4">

                {!selectedTable && (
                  <Card className="border-dashed border-[var(--border-subtle)] p-10 text-center">
                    <ChevronRight size={32} className="mx-auto opacity-10 mb-3" />
                    <div className="text-xs opacity-30">Select a table from the left to inspect its structure</div>
                  </Card>
                )}

                {selectedTable && tableStructure && (
                  <>
                    {/* Column Grid */}
                    <Card className="border-[var(--border-subtle)] overflow-hidden">
                      <CardHeader className="px-5 py-3 border-b border-[var(--border-subtle)] bg-black/20">
                        <Flex between itemsCenter>
                          <Flex gap={2} itemsCenter>
                            <Database size={13} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              shoper9.{selectedTable} — {tableStructure.columns.length} columns
                            </span>
                          </Flex>
                          <button
                            onClick={generateDDL}
                            disabled={ddlLoading}
                            className="text-[10px] font-black uppercase text-[var(--primary)] hover:opacity-70 flex items-center gap-1"
                          >
                            <Download size={10} className={ddlLoading ? 'animate-spin' : ''} />
                            {ddlLoading ? 'Generating...' : 'Generate DDL'}
                          </button>
                        </Flex>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-52 overflow-y-auto custom-scrollbar">
                          <table className="w-full text-[10px]">
                            <thead className="sticky top-0 bg-black/30">
                              <tr className="text-left">
                                {['Column', 'MSSQL Type', 'PG Type', 'Nullable', 'PK'].map(h => (
                                  <th key={h} className="px-4 py-2 font-black uppercase opacity-40 tracking-widest">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableStructure.columns.map((col: any) => (
                                <tr key={col.name} className="border-t border-[var(--border-subtle)]/30 hover:bg-white/3">
                                  <td className="px-4 py-2 font-mono text-blue-300">{col.name}</td>
                                  <td className="px-4 py-2 opacity-50">{col.mssql_type}</td>
                                  <td className="px-4 py-2 text-emerald-400 font-mono">{col.pg_type}</td>
                                  <td className="px-4 py-2">{col.nullable ? <span className="opacity-30">YES</span> : <span className="text-amber-400">NOT NULL</span>}</td>
                                  <td className="px-4 py-2">{col.is_pk ? <Badge variant="success" className="text-[8px]">PK</Badge> : null}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* DDL Preview */}
                    {generatedDDL && (
                      <Card className="border-[var(--border-subtle)] overflow-hidden">
                        <CardHeader className="px-5 py-3 border-b border-[var(--border-subtle)] bg-black/20">
                          <Flex between itemsCenter>
                            <Flex gap={2} itemsCenter>
                              <Terminal size={13} className="text-emerald-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Generated DDL — shoper9.{selectedTable} (Exact Mirror)</span>
                            </Flex>
                            <button
                              onClick={copyDDL}
                              className="text-[10px] font-black text-[var(--primary)] flex items-center gap-1 hover:opacity-70"
                            >
                              <Copy size={10} /> {copyDone ? '✓ Copied!' : 'Copy'}
                            </button>
                          </Flex>
                        </CardHeader>
                        <CardContent className="p-0">
                          <pre className="text-[10px] font-mono text-emerald-300 p-5 bg-black/30 max-h-64 overflow-y-auto custom-scrollbar leading-relaxed">
                            {generatedDDL}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

              </div>
            </div>

            {/* ONE-CLICK PROVISIONER */}
            <Card className="border-2 border-violet-500/30 bg-violet-500/5 p-6 space-y-5">
              <Flex between itemsCenter>
                <Flex gap={3} itemsCenter>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <PackagePlus className="text-violet-400" size={20} />
                  </div>
                  <div>
                    <div className="font-black text-sm uppercase italic">One-Click Client Provisioner</div>
                    <div className="text-[10px] opacity-50 mt-0.5">Naye client ke liye poora SmritiSetu DB ek click mein create karein</div>
                  </div>
                </Flex>
                <button
                  onClick={() => setProvisionOpen(v => !v)}
                  className="text-xs font-black text-violet-400 hover:opacity-70"
                >
                  {provisionOpen ? '▲ Collapse' : '▼ Expand'}
                </button>
              </Flex>

              {provisionOpen && (
                <div className="flex flex-col space-y-6">
                  
                  {/* Two Column Layout for the Two Provisioners */}
                  <div className="grid grid-cols-2 gap-8">
                    
                    {/* MSSQL Full Database Provisioner */}
                    <div className="bg-black/30 p-5 rounded-xl border border-[var(--border-subtle)] space-y-4">
                      <div>
                        <div className="font-black text-[11px] text-blue-400 uppercase tracking-widest mb-1">1. SOVEREIGN MODE (MSSQL)</div>
                        <div className="text-[10px] opacity-60">Creates a full MSSQL database with exactly 579+ Shoper9 tables.</div>
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-black uppercase opacity-40 block mb-1.5">9-Digit Store Code</label>
                        <input
                          value={mssqlStoreCode}
                          onChange={e => setMssqlStoreCode(e.target.value.toUpperCase())}
                          className="w-full bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-blue-500"
                          placeholder="10256789"
                        />
                        <div className="text-[9px] opacity-50 mt-1.5">
                          Database will be: <span className="font-mono text-blue-400">SMRITISETU{mssqlStoreCode || 'XXXXXXXXX'}</span>
                        </div>
                      </div>

                      <button
                        onClick={provisionMssql}
                        disabled={mssqlProvisionLoading || !mssqlStoreCode}
                        className={cn(
                          "w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          mssqlProvisionLoading || !mssqlStoreCode
                            ? "bg-blue-500/20 text-blue-400/40 cursor-not-allowed"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500 hover:text-white"
                        )}
                      >
                        {mssqlProvisionLoading
                          ? <><RefreshCcw size={14} className="animate-spin" /> Provisioning MSSQL...</>
                          : <><Database size={14} /> Create Full MSSQL Database</>
                        }
                      </button>
                    </div>

                    {/* PostgreSQL Schema Provisioner */}
                    <div className="bg-black/30 p-5 rounded-xl border border-[var(--border-subtle)] space-y-4">
                      <div>
                        <div className="font-black text-[11px] text-violet-400 uppercase tracking-widest mb-1">2. CLOUD MODE (PostgreSQL)</div>
                        <div className="text-[10px] opacity-60">Provisions a tenant schema inside the shared Supabase cloud DB.</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black uppercase opacity-40 block mb-1.5">Client Store ID</label>
                          <input
                            value={newClientId}
                            onChange={e => setNewClientId(e.target.value.toUpperCase())}
                            className="w-full bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-violet-500"
                            placeholder="STORE001"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase opacity-40 block mb-1.5">Target PG Schema</label>
                          <input
                            value={newSchemaName}
                            onChange={e => setNewSchemaName(e.target.value.toLowerCase())}
                            className="w-full bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-violet-500"
                            placeholder="shoper9"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase opacity-40 block mb-1.5">Client Name</label>
                        <input
                          value={newClientName}
                          onChange={e => setNewClientName(e.target.value)}
                          className="w-full bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-violet-500"
                          placeholder="Rajesh Sarees"
                        />
                      </div>

                      <button
                        onClick={provisionClient}
                        disabled={provisionLoading || !newClientName}
                        className={cn(
                          "w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          provisionLoading || !newClientName
                            ? "bg-violet-500/20 text-violet-400/40 cursor-not-allowed"
                            : "bg-violet-500/20 text-violet-400 border border-violet-500/50 hover:bg-violet-500 hover:text-white"
                        )}
                      >
                        {provisionLoading
                          ? <><RefreshCcw size={14} className="animate-spin" /> Provisioning PG...</>
                          : <><Plus size={14} /> Create Cloud Schema</>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Unified Live Log */}
                  {provisionLog.length > 0 && (
                    <div className="bg-black/60 border border-[var(--border-subtle)] rounded-xl p-4 font-mono text-[10px] space-y-1 max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                      <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Live Execution Log</div>
                      {provisionLog.map((line, i) => (
                        <div key={i} className={cn(
                          line.startsWith('✓') || line.startsWith('✅') ? 'text-emerald-400' :
                          line.startsWith('❌') ? 'text-red-400' : 
                          line.startsWith('⚠️') ? 'text-amber-400' : 'text-blue-300'
                        )}>{line}</div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </Card>

          </div>
        )}

        {activeTab === 'config' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub Navigation */}
            <div className="px-8 py-2 border-b border-[var(--border-subtle)] bg-black/40 flex items-center gap-6">
              <button
                onClick={() => setConfigSubTab('params')}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
                  configSubTab === 'params' ? "text-[var(--primary)]" : "text-gray-500 hover:text-white"
                )}
              >
                1. System Parameters
                {configSubTab === 'params' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />}
              </button>
              <button
                onClick={() => setConfigSubTab('lookups')}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
                  configSubTab === 'lookups' ? "text-[var(--primary)]" : "text-gray-500 hover:text-white"
                )}
              >
                2. Lookup Tables (GenLookUp)
                {configSubTab === 'lookups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />}
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {configSubTab === 'params' ? (
                <>
                  {/* Categories Sidebar */}
                  <div className="w-64 border-r border-[var(--border-subtle)] bg-black/20 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    <Text variant="xs" className="text-[var(--primary)] mb-4 block uppercase font-bold tracking-widest">Parameter Categories</Text>
                    {categories.map(cat => (
                      <button
                        key={cat.code}
                        onClick={() => setSelectedCategory(cat.code)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group",
                          selectedCategory === cat.code
                            ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]"
                            : "bg-black/40 border-white/5 text-[var(--text-secondary)] hover:bg-white/5"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono opacity-60">{cat.code}</span>
                          <span className="text-xs font-bold truncate max-w-[140px]">{cat.description}</span>
                        </div>
                        <ChevronRight size={14} className={cn("transition-transform", selectedCategory === cat.code ? "translate-x-1" : "opacity-0")} />
                      </button>
                    ))}
                  </div>

                  {/* Parameters Content */}
                  <div className="flex-1 flex flex-col bg-black/40 overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-subtle)] bg-black/40 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-black text-white">{categories.find(c => c.code === selectedCategory)?.description || 'Select Category'}</h2>
                        <p className="text-xs text-[var(--text-secondary)] opacity-60">Group: {selectedCategory}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-[var(--primary)]/10 rounded-full border border-[var(--primary)]/30">
                        <Activity size={12} className="text-[var(--primary)]" />
                        <span className="text-[10px] font-bold text-[var(--primary)]">{params.length} Parameters</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                      {isConfigLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <RefreshCcw size={32} className="animate-spin text-[var(--primary)] opacity-40" />
                        </div>
                      ) : params.length > 0 ? (
                        params.map(param => (
                          <Card key={param.param_code} className="p-5 border-[var(--border-subtle)] hover:border-[var(--primary)]/30 transition-all bg-black/20">
                            <div className="flex justify-between items-start gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded">{param.param_code}</span>
                                  <span className="text-[9px] font-black uppercase opacity-30">Group: {param.category}</span>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{param.descr}</h3>
                              </div>

                              <div className="w-64 flex flex-col items-end gap-2">
                                {/* Boolean Input */}
                                {param.boolean !== null && (
                                  <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5 w-full justify-between">
                                    <span className="text-[10px] uppercase font-bold opacity-40">Status</span>
                                    <button
                                      onClick={() => updateParam(param.id, 'boolean', !param.boolean)}
                                      className={cn(
                                        "w-12 h-6 rounded-full p-1 transition-all duration-300",
                                        param.boolean ? "bg-emerald-500" : "bg-gray-700"
                                      )}
                                    >
                                      <div className={cn("w-4 h-4 bg-white rounded-full transition-all duration-300", param.boolean ? "translate-x-6" : "translate-x-0")} />
                                    </button>
                                  </div>
                                )}

                                {/* Integer Input */}
                                {param.intg !== null && (
                                  <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5 w-full justify-between">
                                    <span className="text-[10px] uppercase font-bold opacity-40">Value</span>
                                    <input
                                      type="number"
                                      value={param.intg}
                                      onChange={(e) => updateParam(param.id, 'intg', parseInt(e.target.value))}
                                      className="bg-transparent border-none text-right text-xs font-mono text-emerald-400 focus:outline-none w-24"
                                    />
                                  </div>
                                )}

                                {/* Text Input */}
                                {param.txt !== null && (
                                  <div className="flex flex-col gap-1 w-full">
                                    <span className="text-[9px] uppercase font-bold opacity-40 ml-2">Configuration Text</span>
                                    <textarea
                                      value={param.txt}
                                      rows={2}
                                      onChange={(e) => updateParam(param.id, 'txt', e.target.value)}
                                      className="bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-blue-300 focus:outline-none focus:border-[var(--primary)] transition-all resize-none w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                          <Settings size={64} strokeWidth={1} />
                          <Text variant="sm">No parameters found for this category</Text>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* GenLookUp Sidebar */}
                  <div className="w-64 border-r border-[var(--border-subtle)] bg-black/20 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    <Text variant="xs" className="text-emerald-400 mb-4 block uppercase font-bold tracking-widest">Lookup Types (RecType)</Text>
                    {lookupTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedLookupType(type)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group",
                          selectedLookupType === type
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-black/40 border-white/5 text-[var(--text-secondary)] hover:bg-white/5"
                        )}
                      >
                        <span className="text-xs font-bold truncate">{type}</span>
                        <ChevronRight size={14} className={cn("transition-transform", selectedLookupType === type ? "translate-x-1" : "opacity-0")} />
                      </button>
                    ))}
                  </div>

                  {/* GenLookUp Content */}
                  <div className="flex-1 flex flex-col bg-black/40 overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-subtle)] bg-black/40 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-black text-white">{selectedLookupType} Explorer</h2>
                        <p className="text-xs text-[var(--text-secondary)] opacity-60">Master Data Dictionary</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                        <Database size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400">{lookups.length} Entries</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                      {isLookupLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <RefreshCcw size={32} className="animate-spin text-emerald-400 opacity-40" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lookups.map(lookup => (
                            <Card key={`${lookup.code}-${lookup.recid}`} className="p-4 border-[var(--border-subtle)] bg-black/20 hover:bg-black/40 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
                                  {lookup.code.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-white">{lookup.code}</span>
                                    <span className="text-[9px] opacity-30 font-mono">RECID: {lookup.recid}</span>
                                  </div>
                                  <div className="text-[11px] text-[var(--text-secondary)] leading-tight">{lookup.descr}</div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: THEME MANAGER ── */}
        {activeTab === 'theme' && (
          <div className="space-y-6 max-w-5xl">
            <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20 p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                <Palette className="text-pink-400" size={24} />
              </div>
              <div>
                <div className="font-black text-base uppercase italic tracking-tight">Institutional Theme Architect</div>
                <p className="text-xs text-[var(--text-secondary)] opacity-70 mt-1 leading-relaxed">
                  Design tokens define the visual structure of SMRITI-OS. Control border radius, primary colors, and structural styling centrally. 
                  Changes pushed here are instantly broadcasted to all active Point of Sale terminals.
                </p>
              </div>
            </div>

            <Grid cols={2} gap={6}>
              <Card className="border-[var(--border-subtle)] p-6 space-y-5 bg-black/20">
                <Flex gap={3} itemsCenter>
                  <Palette size={16} className="text-pink-500" />
                  <Text variant="h3" className="text-sm uppercase tracking-widest font-black">Design Tokens</Text>
                </Flex>

                <div>
                  <label className="text-[10px] font-black uppercase opacity-50 block mb-2">Color Palette (Brand)</label>
                  <select className="w-full bg-black/50 border border-[var(--border-subtle)] rounded-none px-3 py-2 text-xs font-mono focus:outline-none focus:border-pink-500 transition-colors">
                    <option value="emerald">Institutional Emerald (Default)</option>
                    <option value="blue">Sovereign Blue</option>
                    <option value="purple">Premium Violet</option>
                    <option value="red">High-Contrast Red</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase opacity-50 block mb-2">Border Radius Compliance</label>
                  <select className="w-full bg-black/50 border border-[var(--border-subtle)] rounded-none px-3 py-2 text-xs font-mono focus:outline-none focus:border-pink-500 transition-colors">
                    <option value="none">Zero Radius (Institutional Square)</option>
                    <option value="sm">Subtle Curve (2px)</option>
                    <option value="md">Modern Soft (6px)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase opacity-50 block mb-2">Typography Pack</label>
                  <select className="w-full bg-black/50 border border-[var(--border-subtle)] rounded-none px-3 py-2 text-xs font-mono focus:outline-none focus:border-pink-500 transition-colors">
                    <option value="jetbrains">JetBrains Mono + Inter</option>
                    <option value="fira">Fira Code + Roboto</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                
                <Button className="w-full bg-pink-600 hover:bg-pink-500 border-2 border-pink-800 rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-white font-black uppercase py-6 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
                  <Activity size={16} className="mr-2" /> Broadcast Theme to Store Nodes
                </Button>
              </Card>

              <Card className="border-[var(--border-subtle)] p-6 bg-black/20 flex flex-col items-center justify-center space-y-4">
                 <div className="w-full max-w-xs border-2 border-slate-900 bg-white p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-none relative">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 uppercase">Live Preview</div>
                    <div className="text-emerald-700 font-mono font-black text-sm mb-2 uppercase">Institutional POS</div>
                    <input className="w-full border-2 border-slate-900 h-10 mb-2 px-2 font-mono text-sm outline-none focus:bg-emerald-50" placeholder="SKU001" readOnly/>
                    <button className="w-full bg-slate-900 text-white font-black uppercase h-10 border-2 border-slate-900 hover:bg-slate-800 transition-colors">Commit Entry</button>
                 </div>
                 <Text variant="xs" className="opacity-50 text-center w-64">This preview represents the exact UI rendered on the cashier terminals under the current config.</Text>
              </Card>
            </Grid>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="px-8 py-3 border-t border-[var(--border-subtle)] shrink-0">
        <Flex between className="opacity-40">
          <Text variant="xs">SMRITI-OS ARCHITECT CONSOLE v1.0.5</Text>
          <Text variant="xs" className="text-emerald-500">SYSTEM SECURE · {deployMode} MODE</Text>
        </Flex>
      </div>
    </div>
  );
};

export default ArchitectControlCenter;
