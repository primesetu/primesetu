/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Package,
  Search,
  RefreshCw,
  ShoppingCart,
  BarChart3,
  Flame,
  Snowflake,
  Activity,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  Flex,
  Grid,
  Container,
  DataTable,
  Input,
  Divider
} from '../../components/ui/SovereignUI';
import { cn } from '@/lib/utils';

interface DoCItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  stock: number;
  velocity: number;
  doc: number;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OVERSTOCK' | 'DEAD';
}

const IntelligenceCockpit: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // 1. Fetch Risk Summary
  const { data: riskSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['intelligence_risk_summary'],
    queryFn: () => api.intelligence.getRiskSummary()
  });

  // 2. Fetch DoC Analysis
  const { data: docData = [], isLoading: docLoading, refetch } = useQuery<DoCItem[]>({
    queryKey: ['intelligence_doc'],
    queryFn: () => api.intelligence.getDoc()
  });

  const filteredData = useMemo(() => {
    return docData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter ? item.status === activeFilter : true;
      return matchesSearch && matchesFilter;
    });
  }, [docData, search, activeFilter]);

  const stats = [
    { label: 'Critical Risk', count: riskSummary?.CRITICAL || 0, color: 'text-status-red', bg: 'bg-status-red/10', icon: Flame, status: 'CRITICAL' },
    { label: 'Warning', count: riskSummary?.WARNING || 0, color: 'text-status-amber', bg: 'bg-status-amber/10', icon: AlertTriangle, status: 'WARNING' },
    { label: 'Healthy', count: riskSummary?.HEALTHY || 0, color: 'text-status-green', bg: 'bg-status-green/10', icon: ShieldCheck, status: 'HEALTHY' },
    { label: 'Dead Stock', count: riskSummary?.DEAD || 0, color: 'text-text-disabled', bg: 'bg-bg-float', icon: Snowflake, status: 'DEAD' },
  ];

  return (
    <Container>
      {/* Sovereign Intelligence Header */}
      <Card className="p-10 relative overflow-hidden bg-bg-elevated/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[120px] rounded-full"></div>
        <Flex between gap={8} className="relative z-10 lg:flex-row flex-col items-start lg:items-center">
          <div>
            <Flex gap={3} className="mb-4">
               <Badge variant="info">Revenue Intelligence</Badge>
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            </Flex>
            <Text variant="h1">Predictive Cockpit</Text>
            <Text variant="xs" className="mt-2 block opacity-60 flex items-center gap-2 uppercase tracking-widest font-black">
               <Zap size={14} className="text-accent" /> Sovereign Pulse AI · X01 Node
            </Text>
          </div>
          
          <Flex gap={4}>
             <Button variant="sec" onClick={() => refetch()} className="h-16 px-8">
                <RefreshCw className={cn("mr-2", docLoading && "animate-spin")} size={18} /> SYNC PULSE
             </Button>
             <Button className="h-16 px-10 shadow-xl shadow-accent/20">
                <ShoppingCart size={18} className="mr-2" /> GENERATE PO
             </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Risk Profile Grid */}
      <Grid cols={4} gap={6}>
        {stats.map((s) => (
          <button 
            key={s.label}
            onClick={() => setActiveFilter(activeFilter === s.status ? null : s.status)}
            className={cn(
              "p-8 rounded-[2rem] border-2 transition-all duration-300 text-left relative overflow-hidden group",
              activeFilter === s.status 
                ? 'bg-bg-elevated border-accent shadow-2xl scale-105' 
                : 'bg-bg-elevated/40 border-transparent hover:border-border-subtle hover:bg-bg-float/40'
            )}
          >
            <Flex between className="mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", s.bg, s.color)}>
                <s.icon size={24} />
              </div>
              {activeFilter === s.status && <Badge variant="info">Active</Badge>}
            </Flex>
            <div>
              <Text variant="h1" className={cn("text-4xl", s.color)}>{s.count}</Text>
              <Text variant="xs" className="mt-2 block font-black opacity-40">{s.label}</Text>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <s.icon size={80} />
            </div>
          </button>
        ))}
      </Grid>

      <Flex gap={8} className="items-start">
        {/* Main Analysis Engine */}
        <main className="flex-1 flex flex-col gap-6">
          <Card className="p-8 bg-bg-elevated/40 border-border-subtle">
            <Flex between gap={8}>
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                <Input 
                  placeholder="Search SKU or Product Map..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-14 pl-16 font-bold tracking-widest text-sm"
                />
              </div>
              <Flex gap={4}>
                <Badge variant="muted" className="h-14 px-6 flex flex-col items-center justify-center gap-1">
                   <Text variant="xs" className="opacity-40">Records Processed</Text>
                   <Text variant="sm" className="font-mono font-bold">{filteredData.length}</Text>
                </Badge>
                <Button variant="sec" className="h-14 w-14 p-0">
                   <BarChart3 size={20} />
                </Button>
              </Flex>
            </Flex>
          </Card>

          <DataTable<DoCItem>
            data={filteredData}
            loading={docLoading}
            emptyMessage="No Intelligence Records Found"
            columns={[
              {
                header: 'Protocol SKU',
                accessor: (item) => (
                  <Badge variant="muted" className="font-mono text-[10px] h-8 px-4">
                    {item.sku}
                  </Badge>
                )
              },
              {
                header: 'Product DNA',
                accessor: (item) => (
                  <div>
                    <Text variant="sm" className="font-bold uppercase">{item.name}</Text>
                    <Text variant="xs" className="mt-1 block opacity-40">{item.brand} Registry</Text>
                  </div>
                )
              },
              {
                header: 'Inventory',
                align: 'center',
                accessor: (item) => (
                  <Text variant="sm" className="font-mono font-bold">{item.stock}</Text>
                )
              },
              {
                header: 'Velocity (30d)',
                align: 'center',
                accessor: (item) => (
                  <Flex center gap={2} className={item.velocity > 0 ? 'text-status-green' : 'text-text-disabled'}>
                    <Activity size={14} />
                    <Text variant="sm" className="font-mono font-bold">{item.velocity}/day</Text>
                  </Flex>
                )
              },
              {
                header: 'Days of Cover',
                align: 'center',
                accessor: (item) => (
                  <div className="flex flex-col items-center">
                    <Text variant="h3" className={cn(
                      'font-mono',
                      item.doc < 7 ? 'text-status-red' : item.doc < 15 ? 'text-status-amber' : 'text-status-green'
                    )}>
                      {item.doc === 999 ? '∞' : item.doc}
                    </Text>
                    <Text variant="xs" className="opacity-40">DAYS</Text>
                  </div>
                )
              },
              {
                header: 'Sovereign Pulse',
                align: 'right',
                accessor: (item) => (
                  <Badge 
                    variant={
                      item.status === 'CRITICAL' ? 'error' : 
                      item.status === 'WARNING' ? 'warn' : 
                      item.status === 'HEALTHY' ? 'info' : 'muted'
                    }
                  >
                    {item.status}
                  </Badge>
                )
              }
            ]}
          />
        </main>

        {/* Action Intelligence Rail */}
        <aside className="w-96 flex flex-col gap-6 h-full">
           <Card className="p-8 bg-text-primary text-bg-base border-none overflow-hidden relative shadow-2xl">
              <BarChart3 className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10" />
              <Text variant="xs" className="text-bg-base opacity-40 block font-black uppercase tracking-widest mb-10">Stock Health Index</Text>
              <div className="space-y-10 relative z-10">
                 <div>
                    <Text variant="h1" className="text-6xl text-bg-base">
                      {Math.round((docData.filter(i => i.status === 'HEALTHY').length / (docData.length || 1)) * 100)}%
                    </Text>
                    <Text variant="xs" className="text-bg-base opacity-40 mt-3 block font-bold uppercase tracking-widest">Universal Stability Score</Text>
                 </div>
                 <Divider className="bg-bg-base/10" />
                 <div className="space-y-6">
                    <Flex between>
                       <Text variant="xs" className="text-bg-base opacity-40">System Node</Text>
                       <Text variant="sm" className="font-mono font-bold text-bg-base uppercase">Operational-X01</Text>
                    </Flex>
                    <Flex between>
                       <Text variant="xs" className="text-bg-base opacity-40">Last Scan</Text>
                       <Text variant="sm" className="font-mono font-bold text-bg-base">JUST NOW</Text>
                    </Flex>
                 </div>
              </div>
           </Card>

           <Card variant="flat" className="p-8 border-border-subtle bg-bg-elevated/40 space-y-6">
              <Text variant="xs" className="opacity-40 block font-black uppercase tracking-widest mb-4">Quick Protocols</Text>
              <Grid gap={3}>
                 <Button variant="sec" className="h-14 justify-start px-6 gap-4 border-border-subtle">
                    <History size={18} /> History Pulse
                 </Button>
                 <Button variant="sec" className="h-14 justify-start px-6 gap-4 border-border-subtle">
                    <AlertTriangle size={18} /> Alert Settings
                 </Button>
                 <Button className="h-14 justify-start px-6 gap-4 bg-status-amber text-bg-base hover:bg-status-amber/90 border-none shadow-lg shadow-status-amber/20">
                    <Zap size={18} /> Bulk Order Suggest
                 </Button>
              </Grid>
           </Card>
        </aside>
      </Flex>
    </Container>
  );
};

export default IntelligenceCockpit;
