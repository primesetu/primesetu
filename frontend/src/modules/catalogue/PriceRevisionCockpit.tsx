/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Search, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Filter,
  Save,
  Percent,
  Calendar,
  History,
  RefreshCw
} from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge,
  Flex,
  Grid,
  Container,
  DataTable
} from '../../components/ui/SovereignUI';

interface RevisionItem {
  id: string;
  code: string;
  name: string;
  current_price: number;
  new_price: number;
}

const MOCK_ITEMS: RevisionItem[] = [
  { id: '1', code: 'PUMA-RSX-01', name: 'Puma RS-X Bold', current_price: 8999, new_price: 8999 },
  { id: '2', code: 'PUMA-RSX-02', name: 'Puma RS-X Triple White', current_price: 8499, new_price: 8499 },
  { id: '3', code: 'NIKE-AJ1-01', name: 'Jordan 1 Retro High', current_price: 15999, new_price: 15999 },
];

export default function PriceRevisionCockpit() {
  const [items, setItems] = useState<RevisionItem[]>(MOCK_ITEMS);
  const [search, setSearch] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalAdj, setGlobalAdj] = useState(0);

  const applyAdjustment = (type: 'percent' | 'fixed', value: number) => {
    setItems(prev => prev.map(item => ({
      ...item,
      new_price: type === 'percent' 
        ? Math.round(item.current_price * (1 + value / 100)) 
        : item.current_price + value
    })));
  };

  const handleSave = async () => {
    setIsApplying(true);
    try {
      const revisions = items.filter(i => i.new_price !== i.current_price).map(i => ({
        id: i.id,
        new_price: i.new_price
      }));
      
      if (revisions.length === 0) return;

      await api.catalogue.bulkPriceRevision(revisions);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to apply price revisions');
    } finally {
      setIsApplying(false);
    }
  };

  const affectedCount = items.filter(i => i.new_price !== i.current_price).length;
  const valueDelta = items.reduce((acc, i) => acc + (i.new_price - i.current_price), 0);

  return (
    <Container className="pb-20">
      {/* ── HEADER ── */}
      <Flex between gap={8}>
        <div>
          <Text variant="xs" className="text-accent mb-2 block font-black uppercase tracking-[0.4em]">Pricing Engine</Text>
          <Text variant="h1">Price Revision Cockpit</Text>
        </div>
        
        <Flex gap={4}>
          <Badge variant="muted" className="h-12 px-6 flex items-center gap-2">
            <Calendar size={14} className="opacity-40" />
            <span className="font-bold">EFFECTIVE: IMMEDIATE</span>
          </Badge>
          <Button 
            onClick={handleSave}
            disabled={isApplying || affectedCount === 0}
            className="h-12 px-10 shadow-xl shadow-accent/20"
          >
            {isApplying ? <RefreshCw className="animate-spin" /> : <Save size={18} />}
            Apply Revisions
          </Button>
        </Flex>
      </Flex>

      <Grid cols="12" gap={8} className="flex-1 min-h-0 items-start">
        {/* ── BULK TOOLS ── */}
        <aside className="col-span-3 space-y-6">
          <Card className="p-8 bg-bg-elevated/40">
            <Flex gap={3} className="opacity-40 uppercase tracking-[0.3em] text-[10px] font-black mb-10">
               <Zap size={14} className="text-accent" /> Bulk Control
            </Flex>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <Text variant="xs" className="opacity-60 block font-black">SURGE / MARKDOWN (%)</Text>
                <Flex gap={2}>
                  <Input 
                    type="number"
                    value={globalAdj || ''}
                    onChange={(e) => setGlobalAdj(parseFloat(e.target.value) || 0)}
                    className="h-12 font-mono font-bold"
                    placeholder="0.00"
                  />
                  <Button 
                    variant="sec"
                    onClick={() => applyAdjustment('percent', globalAdj)}
                    className="w-12 h-12 p-0"
                  >
                    <Percent size={14} />
                  </Button>
                </Flex>
              </div>

              <Grid gap={3}>
                <Button 
                  variant="sec"
                  onClick={() => applyAdjustment('percent', 5)}
                  className="h-12 text-status-green border-status-green/10 bg-status-green/5"
                >
                  <TrendingUp size={14} /> +5% Surged
                </Button>
                <Button 
                  variant="sec"
                  onClick={() => applyAdjustment('percent', -10)}
                  className="h-12 text-status-red border-status-red/10 bg-status-red/5"
                >
                  <TrendingDown size={14} /> -10% Clearance
                </Button>
              </Grid>
            </div>
          </Card>

          <Card className="p-8 bg-text-primary text-bg-base border-none overflow-hidden relative shadow-2xl">
            <History className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
            <Text variant="xs" className="text-bg-base opacity-40 block font-black uppercase tracking-widest mb-10">Revision Pulse</Text>
            <div className="space-y-8 relative z-10">
               <div>
                 <Text variant="xs" className="text-bg-base opacity-20 block mb-1">Entities Affected</Text>
                 <Text variant="h1" className="text-bg-base text-4xl">{affectedCount}</Text>
               </div>
               <div>
                 <Text variant="xs" className="text-bg-base opacity-20 block mb-1">Value Drift</Text>
                 <Text variant="h2" className={cn("text-2xl font-mono", valueDelta >= 0 ? "text-status-green" : "text-status-red")}>
                   {valueDelta >= 0 ? '+' : ''}{formatCurrency(valueDelta * 100)}
                 </Text>
               </div>
            </div>
          </Card>
        </aside>

        {/* ── ITEM GRID ── */}
        <main className="col-span-9 flex flex-col gap-6 min-h-0">
          <Card className="flex-1 flex flex-col overflow-hidden bg-bg-elevated/20">
            <Flex between className="p-6 border-b border-border-subtle bg-bg-elevated/40">
              <div className="relative w-96">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled" />
                <Input 
                  placeholder="Filter Registry Grid..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 pl-12 font-bold"
                />
              </div>
              <Flex gap={6}>
                <Text variant="xs" className="opacity-40 font-black">SORTING: VALUE ASC</Text>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                   <Filter size={16} />
                </Button>
              </Flex>
            </Flex>

            <DataTable<RevisionItem>
              data={items}
              columns={[
                {
                  header: 'Protocol Entity',
                  accessor: (item) => (
                    <div>
                      <Text variant="sm" className="font-bold uppercase group-hover:text-accent transition-colors">{item.name}</Text>
                      <Text variant="xs" className="font-mono mt-1 block opacity-40">{item.code}</Text>
                    </div>
                  )
                },
                {
                  header: 'Registry MRP',
                  align: 'center',
                  accessor: (item) => (
                    <Text variant="sm" className="font-mono opacity-40 italic">{formatCurrency(item.current_price * 100)}</Text>
                  )
                },
                {
                  header: 'Proposed MRP',
                  align: 'center',
                  accessor: (item) => (
                    <div className="inline-block relative">
                      <Input 
                        type="number"
                        value={item.new_price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItems(prev => prev.map(p => p.id === item.id ? { ...p, new_price: val } : p));
                        }}
                        className={cn(
                          "w-40 h-11 text-center font-mono font-bold tracking-widest",
                          item.new_price !== item.current_price && "border-accent/40 bg-accent/5 text-accent"
                        )}
                      />
                    </div>
                  )
                },
                {
                  header: 'Variance Threshold',
                  align: 'right',
                  accessor: (item) => (
                    <div className={cn(
                      "inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg",
                      item.new_price === item.current_price ? "text-text-tertiary" : item.new_price > item.current_price ? "bg-status-green/10 text-status-green" : "bg-status-red/10 text-status-red"
                    )}>
                      {item.new_price > item.current_price ? <TrendingUp size={12} /> : item.new_price < item.current_price ? <TrendingDown size={12} /> : null}
                      {item.new_price === item.current_price ? 'STABLE' : `${((item.new_price - item.current_price) / item.current_price * 100).toFixed(1)}%`}
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </main>
      </Grid>

      {/* ── SUCCESS NOTIFICATION ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-status-green text-bg-base px-10 py-5 rounded-3xl shadow-2xl flex items-center gap-4 z-[400] border border-status-green/20"
          >
            <CheckCircle2 size={24} />
            <Text variant="xs" className="font-black uppercase tracking-widest">Sovereign Pricing Pulse Verified</Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}




