/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { 
  Monitor, 
  Lock, 
  Unlock, 
  TrendingUp, 
  User, 
  Clock, 
  ShieldCheck, 
  ArrowUpCircle,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/utils/currency'
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge, 
  Modal,
  Label 
} from '../../components/ui/SovereignUI';

interface Till {
  id: string
  name: string
  code: string
  status: 'Open' | 'Closed' | 'Locked' | 'Idle'
  cash_collected: number 
  current_cashier_id?: string
  last_opening_at?: string
}

export default function TillManagement() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newTill, setNewTill] = useState({ name: '', code: '' })

  const { data: tills, isLoading } = useQuery<Till[]>({
    queryKey: ['tills'],
    queryFn: () => api.tills.list()
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.tills.create({ ...data, store_id: 'X01' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tills'] })
      setIsAdding(false)
      setNewTill({ name: '', code: '' })
    }
  })

  const statusActionMutation = useMutation({
    mutationFn: ({ id, action, data }: { id: string, action: string, data?: any }) => {
      if (action === 'open') return api.tills.open(id, data)
      if (action === 'close') return api.tills.close(id)
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tills'] })
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <Text variant="h1">Till Status Board</Text>
          <Text variant="xs" className="mt-2 block">Sovereign Point-of-Sale Monitoring · Node X01</Text>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="sec"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tills'] })}
            className="w-12 h-12 p-0"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </Button>
          <Button 
            onClick={() => setIsAdding(true)}
            className="h-12 px-8"
          >
            <Plus size={18} /> Add New Till
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-64 bg-bg-float/20 animate-pulse border-border-subtle" />
          ))
        ) : tills?.length === 0 ? (
          <Card className="col-span-full py-20 text-center border-dashed border-border-subtle bg-bg-float/10">
             <Monitor size={64} className="opacity-10 mx-auto mb-6" />
             <Text variant="h3" className="opacity-40">No active tills registered for this showroom.</Text>
          </Card>
        ) : tills?.map((till) => (
          <motion.div 
            layout
            key={till.id} 
            className="group"
          >
            <Card className="p-8 h-full border-border-subtle hover:border-accent/40 transition-all shadow-xl bg-bg-elevated/40">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <Text variant="h3" className="text-sm leading-tight block">{till.name}</Text>
                    <Text variant="xs" className="opacity-60">{till.code}</Text>
                  </div>
                </div>
                <Badge variant={till.status === 'Open' ? 'success' : till.status === 'Locked' ? 'warn' : 'muted'}>
                  {till.status}
                </Badge>
              </div>

              <div className="space-y-4 mb-8">
                <Card variant="flat" className="flex justify-between items-center p-4 bg-bg-float/40 border-border-subtle">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-text-tertiary" />
                    <Text variant="xs">Cash Volume</Text>
                  </div>
                  <Text variant="h2" className="text-lg">{formatCurrency(till.cash_collected)}</Text>
                </Card>
                
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-text-tertiary" />
                    <Text variant="xs" className="opacity-60">{till.current_cashier_id || 'Unassigned'}</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-text-tertiary" />
                    <Text variant="xs" className="opacity-60 font-mono">
                      {till.last_opening_at ? new Date(till.last_opening_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-border-subtle">
                {till.status === 'Closed' ? (
                  <Button 
                    variant="sec"
                    onClick={() => statusActionMutation.mutate({ id: till.id, action: 'open', data: { cashier_id: 'CASHIER-01' } })}
                    className="col-span-2 h-10 text-status-green border-status-green/10"
                  >
                    <Unlock size={14} /> Open Counter
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="sec"
                      size="sm"
                      onClick={() => statusActionMutation.mutate({ id: till.id, action: 'close' })}
                      className="h-10 text-status-red border-status-red/10"
                    >
                      <Lock size={14} /> Close
                    </Button>
                    <Button variant="sec" size="sm" className="h-10 text-status-amber border-status-amber/10">
                      <ArrowUpCircle size={14} /> Lift
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="Initialize New Till"
        subtitle="Hardware Register Node Assignment"
        maxWidth="max-w-md"
        icon={<Plus size={24} />}
      >
        <div className="space-y-6">
           <div className="space-y-2">
              <Label>Till Identifier Name</Label>
              <Input 
                placeholder="e.g. Counter 04 - Mens Dept"
                value={newTill.name}
                onChange={e => setNewTill({...newTill, name: e.target.value})}
              />
           </div>
           <div className="space-y-2">
              <Label>System Code</Label>
              <Input 
                placeholder="e.g. T04"
                value={newTill.code}
                onChange={e => setNewTill({...newTill, code: e.target.value})}
                className="font-mono"
              />
           </div>
           
           <div className="pt-6 flex gap-4">
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="flex-1">
                 Cancel
              </Button>
              <Button 
                onClick={() => createMutation.mutate(newTill)}
                disabled={!newTill.name || !newTill.code || createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Registering...' : 'Confirm'}
              </Button>
           </div>
        </div>
      </Modal>

      <Card variant="flat" className="p-8 border-l-4 border-l-status-amber bg-bg-elevated/40 flex items-center gap-8">
        <div className="w-16 h-16 rounded-3xl bg-status-amber/10 flex items-center justify-center text-status-amber shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div>
          <Text variant="h3" className="text-status-amber">Sovereign Compliance Guard</Text>
          <Text variant="p" className="mt-2 block opacity-80">
            All till operations (lifts, closures, session handovers) are cryptographically signed and logged for institutional audit. 
            Discrepancies exceeding {formatCurrency(10000)} will trigger an automatic Sovereign Alert to the HO Management.
          </Text>
        </div>
      </Card>
    </div>
  )
}
