/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Zap, 
  Clock, 
  CreditCard, 
  Banknote, 
  Smartphone,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  Flex,
  Grid,
  Container,
  Divider
} from '../../components/ui/SovereignUI';

interface DayEndModuleProps {
  onClose: () => void;
}

export default function DayEndModule({ onClose }: DayEndModuleProps) {
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.billing.getDayEndSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Sovereign Pulse Failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      await api.billing.finalizeDayEnd();
      setStep(3); 
    } catch (err: any) {
      alert(err.message || 'Day-End Finalization Failed');
    } finally {
      setIsFinalizing(false);
    }
  };

  if (loading) {
    return (
      <Flex center className="p-20 h-full" col gap={6}>
        <RefreshCw className="w-12 h-12 text-accent animate-spin" />
        <Text variant="xs">Aggregating Global Ledger...</Text>
      </Flex>
    );
  }

  if (error || !summary) {
    return (
      <Flex center className="p-20 h-full text-center" col gap={8}>
        <div className="w-20 h-20 bg-status-red/10 text-status-red rounded-full flex items-center justify-center">
           <AlertTriangle size={40} />
        </div>
        <div>
           <Text variant="h2">Connection Lost</Text>
           <Text variant="xs" className="mt-2 block opacity-40">{error || "Failed to retrieve Ledger Summary"}</Text>
        </div>
        <Button onClick={fetchSummary} className="px-10">
           Retry Connection
        </Button>
        <Button variant="ghost" onClick={onClose} className="absolute top-8 right-8">
           <X size={24} />
        </Button>
      </Flex>
    );
  }

  return (
    <Container className="h-full bg-bg-base relative overflow-hidden space-y-0">
      {/* ── PROGRESS BAR ── */}
      <Flex className="h-1.5 w-full bg-bg-float" gap={0}>
        <div className={`h-full transition-all duration-700 ${step >= 1 ? 'bg-accent w-1/3' : 'w-1/3'}`} />
        <div className={`h-full transition-all duration-700 ${step >= 2 ? 'bg-accent w-1/3' : 'w-1/3'}`} />
        <div className={`h-full transition-all duration-700 ${step >= 3 ? 'bg-accent w-1/3' : 'w-1/3'}`} />
      </Flex>

      <div className="p-12 flex flex-col flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <Flex between className="mb-12">
                <div>
                  <Text variant="xs" className="text-accent mb-2 block font-black">Step 01 / Verification Hub</Text>
                  <Text variant="h1">Protocol Initialized</Text>
                </div>
                <Badge variant="muted" className="h-10 px-6 flex items-center gap-2">
                  <Clock size={14} />
                  <span className="font-mono">{summary.date}</span>
                </Badge>
              </Flex>

              <Grid cols={3} gap={8} className="mb-12">
                <Card className="p-10 bg-text-primary text-bg-base border-none shadow-2xl shadow-text-primary/10">
                  <Flex gap={4} className="mb-6">
                    <div className="w-10 h-10 bg-bg-base/10 rounded-xl flex items-center justify-center">
                      <Lock size={18} className="text-accent" />
                    </div>
                    <Text variant="xs" className="text-bg-base/40">Open Tills</Text>
                  </Flex>
                  <Text variant="h1" className="text-5xl text-bg-base">{summary.open_tills_count}</Text>
                  <Text variant="xs" className="text-bg-base/20 mt-4 block">
                    {summary.open_tills_count === 0 ? 'Terminals Secured' : 'Action Required'}
                  </Text>
                </Card>

                <Card variant="flat" className="p-10">
                  <Flex gap={4} className="mb-6">
                    <div className="w-10 h-10 bg-bg-float rounded-xl flex items-center justify-center text-accent">
                      <RefreshCw size={18} />
                    </div>
                    <Text variant="xs">Pending Syncs</Text>
                  </Flex>
                  <Text variant="h1" className="text-5xl">{summary.pending_syncs}</Text>
                  <Text variant="xs" className="opacity-20 mt-4 block">Data packets in transit</Text>
                </Card>

                <Card className="p-10 bg-status-green text-bg-base border-none shadow-2xl shadow-status-green/10">
                  <Flex gap={4} className="mb-6">
                    <div className="w-10 h-10 bg-bg-base/10 rounded-xl flex items-center justify-center">
                      <Zap size={18} />
                    </div>
                    <Text variant="xs" className="text-bg-base/40">Ready State</Text>
                  </Flex>
                  <Text variant="h1" className="text-5xl text-bg-base">{summary.can_close ? 'YES' : 'NO'}</Text>
                  <Text variant="xs" className="text-bg-base/40 mt-4 block">Sovereign checks passed</Text>
                </Card>
              </Grid>

              <Card variant="flat" className="flex-1 p-12 relative bg-bg-float/20">
                <Text variant="xs" className="mb-8 block font-black">Pre-Flight Checklist</Text>
                <div className="space-y-6">
                  <Flex between>
                    <Flex gap={4}>
                      <CheckCircle2 size={24} className={summary.open_tills_count === 0 ? "text-status-green" : "opacity-10"} />
                      <Text variant="h3" className="text-sm">All POS Terminals Secured</Text>
                    </Flex>
                    {summary.open_tills_count > 0 && <Badge variant="error">Counter(s) Open</Badge>}
                  </Flex>
                  <Flex between>
                    <Flex gap={4}>
                      <CheckCircle2 size={24} className={summary.pending_syncs === 0 ? "text-status-green" : "opacity-10"} />
                      <Text variant="h3" className="text-sm">Universal Cloud Sync</Text>
                    </Flex>
                    {summary.pending_syncs > 0 && <Badge variant="warn">Syncing...</Badge>}
                  </Flex>
                </div>
                
                <div className="absolute bottom-10 right-10">
                   <Button 
                     disabled={!summary.can_close}
                     onClick={() => setStep(2)}
                     className="px-12 h-14"
                   >
                     Continue to Summary <ArrowRight size={18} />
                   </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-12">
                <Text variant="xs" className="text-accent mb-2 block font-black">Step 02 / Revenue Audit</Text>
                <Text variant="h1">Consolidated Ledger</Text>
              </div>

              <Grid cols={2} gap={12} className="flex-1 items-start">
                <Card className="p-10 bg-bg-elevated/40">
                  <Text variant="xs" className="mb-10 block opacity-40">Sales Volume by Mode</Text>
                  <div className="space-y-4">
                    {Object.entries(summary.mode_totals).map(([mode, amt]: any) => (
                      <Flex key={mode} between className="py-5 border-b border-border-subtle">
                         <Flex gap={4}>
                           {mode === 'CASH' ? <Banknote size={20} className="text-status-green" /> : 
                            mode === 'CARD' ? <CreditCard size={20} className="text-accent" /> : 
                            <Smartphone size={20} className="text-status-amber" />}
                           <Text variant="sm" className="font-bold">{mode}</Text>
                         </Flex>
                         <Text variant="h3" className="font-mono">{formatCurrency(amt)}</Text>
                      </Flex>
                    ))}
                  </div>
                  <Flex between itemsCenter={false} className="mt-12 pt-8 border-t-2 border-text-primary">
                    <Text variant="xs">Total Net Revenue</Text>
                    <Text variant="h1" className="text-4xl">{formatCurrency(summary.total_sales_paise)}</Text>
                  </Flex>
                </Card>

                <Flex col gap={8} className="h-full">
                  <Card className="p-10 bg-status-amber text-bg-base border-none relative overflow-hidden shadow-2xl shadow-status-amber/10">
                     <AlertTriangle size={160} className="absolute -right-12 -top-12 text-bg-base/10" />
                     <Text variant="xs" className="mb-6 block font-black text-bg-base/60">Institutional Warning</Text>
                     <Text variant="p" className="text-bg-base font-bold leading-relaxed mb-10 block">
                       Executing Day-End will lock the current ledger permanently. Operational registry will advance to the next cycle. Action logged in Sovereign Audit.
                     </Text>
                     <Flex gap={4} className="px-6 py-4 bg-bg-base/10 rounded-2xl border border-bg-base/10 inline-flex">
                        <ShieldCheck size={24} />
                        <Text variant="xs" className="text-bg-base">Sovereign Vault Active</Text>
                     </Flex>
                  </Card>

                  <Flex gap={4} className="mt-auto">
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14">
                      Back
                    </Button>
                    <Button 
                      onClick={handleFinalize}
                      disabled={isFinalizing}
                      className="bg-status-green hover:bg-status-green/90 text-bg-base border-none flex-[2] h-14"
                    >
                      {isFinalizing ? <RefreshCw className="animate-spin mr-2" /> : <Lock size={18} className="mr-2" />}
                      EXECUTE PROTOCOL
                    </Button>
                  </Flex>
                </Flex>
              </Grid>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-20"
            >
              <div className="w-32 h-32 bg-status-green text-bg-base rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl shadow-status-green/20">
                <CheckCircle2 size={64} />
              </div>
              <Text variant="h1" className="text-5xl mb-4">Sovereign Seal Applied</Text>
              <Text variant="xs" className="mb-12 block">
                Operational Day Secured · Ledger Locked · Next Cycle Ready
              </Text>
              
              <Button onClick={onClose} className="px-16 h-14">
                Return to Command Center
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step !== 3 && (
        <Button 
           variant="ghost" 
           size="sm"
           onClick={onClose}
           className="absolute top-10 right-10 w-12 h-12 p-0 rounded-full bg-bg-float/40"
        >
          <X size={24} />
        </Button>
      )}
    </Container>
  );
}




