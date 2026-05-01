/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Package, Users, Truck, Layers, Zap,
  Filter, MoreVertical, Plus, 
  ShieldCheck, Smartphone, Info, Settings2, Globe, X, History as HistoryIcon,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { useMenu } from '../../hooks/useMenu';
import { ICON_MAP } from '../../lib/ModuleRegistry';
import { usePermission } from '../../hooks/usePermission';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge,
  Flex,
  Grid,
  Container,
  Divider,
  DataTable,
  cn
} from '../../components/ui/SovereignUI';
import { formatCurrency } from '@/utils/currency';

type RegistryType = 'ITEMS' | 'CUSTOMERS' | 'VENDORS' | 'PERSONNEL' | 'TAXES' | 'CLASSIFICATION';

interface RegistryEntity {
  id: string;
  name?: string;
  full_name?: string;
  code?: string;
  mobile?: string;
  email?: string;
  category?: string;
  stock?: number;
  price?: number;
  hsn?: string;
  size_group?: string;
  loyalty_tier?: string;
  points?: number;
  tax_type?: 'LOCAL' | 'CENTRAL';
  dob?: string;
  class_1?: string;
  class_2?: string;
  tax_behavior?: 'INCLUSIVE' | 'EXCLUSIVE';
  partial_supply?: boolean;
  terms?: string;
}

const MasterRegistry: React.FC = () => {
  const { menu, findModule } = useMenu();
  const { hasPermission } = usePermission();
  
  const registries = useMemo(() => {
    const registryModule = findModule('registry');
    if (!registryModule || !registryModule.children) {
      return [
        { id: 'ITEMS', icon: Package, label: 'Items' },
        { id: 'CUSTOMERS', icon: Users, label: 'Customers' },
        { id: 'VENDORS', icon: Truck, label: 'Vendors' },
        { id: 'PERSONNEL', icon: ShieldCheck, label: 'Personnel' }
      ];
    }
    return registryModule.children.map(child => ({
      id: child.id.toUpperCase() as RegistryType,
      icon: ICON_MAP[child.id] || Package,
      label: child.label,
      count: 0 
    }));
  }, [menu]);

  const [activeRegistry, setActiveRegistry] = useState<RegistryType>('ITEMS');
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<RegistryEntity | null>(null);

  if (!hasPermission('catalog.view')) {
    return (
      <Flex center className="h-[60vh]" col gap={6}>
        <div className="w-20 h-20 bg-status-red/10 text-status-red rounded-full flex items-center justify-center">
           <ShieldAlert size={40} />
        </div>
        <div>
           <Text variant="h2">Access Denied</Text>
           <Text variant="xs" className="mt-2 block opacity-40 uppercase tracking-widest">Insufficient permissions to view Master Registry</Text>
        </div>
      </Flex>
    );
  }

  const { 
    data: registryData = [], 
    loading, 
    isOfflineData 
  } = useOfflineFallback(
    `registry_${activeRegistry}_${search}`,
    async () => {
      let data: any[] = [];
      if (activeRegistry === 'ITEMS') data = await api.inventory.list();
      else if (activeRegistry === 'CUSTOMERS') data = await api.customers.list();
      else if (activeRegistry === 'VENDORS') data = await api.vendors.list();
      else if (activeRegistry === 'PERSONNEL') data = await api.users.list();
      return data;
    },
    []
  );

  const filteredData = registryData.filter(item => 
    (item.name || item.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    item.code?.toLowerCase().includes(search.toLowerCase()) ||
    item.mobile?.includes(search) ||
    item.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      {/* Sovereign Command Header */}
      <Card className="p-10 relative overflow-hidden bg-bg-elevated/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[120px] rounded-full"></div>
        <Flex between gap={8} className="relative z-10 lg:flex-row flex-col items-start lg:items-center">
          <div>
            <Flex gap={3} className="mb-4">
               <Badge variant="info">Master Catalogue</Badge>
               <div className="w-2 h-2 rounded-full bg-status-green animate-pulse"></div>
               {isOfflineData && <Badge variant="warn">Offline Buffer</Badge>}
            </Flex>
            <Text variant="h1">Sovereign Registry</Text>
            <Text variant="xs" className="mt-2 block opacity-60 flex items-center gap-2">
               <Globe size={14} className="text-status-green" /> Shoper 9 Deep Mapping Protocol
            </Text>
          </div>
          
          <Flex className="flex-1 max-w-2xl w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-disabled group-hover:text-accent transition-colors" size={20} />
            <Input 
              placeholder={`Deep search in ${activeRegistry.toLowerCase()} registry...`}
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="h-16 pl-16 pr-6 text-sm font-bold tracking-widest" 
            />
          </Flex>

          {hasPermission('catalog.edit') && (
            <Button className="h-16 px-10">
              <Plus size={20} /> CREATE MASTER
            </Button>
          )}
        </Flex>
      </Card>

      <Flex gap={8} className="h-[calc(100vh-320px)] items-start">
        {/* Registry Selection Rail */}
        <aside className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 h-full">
          {registries.map((reg) => (
            <button key={reg.id} onClick={() => { setActiveRegistry(reg.id as RegistryType); setSelectedEntity(null); }}
              className={cn(
                "p-6 rounded-3xl flex flex-col gap-4 transition-all duration-500 text-left border-2",
                activeRegistry === reg.id ? 'bg-bg-elevated border-accent shadow-2xl scale-105' : 'bg-bg-float/40 border-transparent text-text-tertiary hover:border-border-subtle hover:bg-bg-float'
              )}>
              <Flex between>
                <div className={cn("p-4 rounded-2xl", activeRegistry === reg.id ? 'bg-accent/10 text-accent' : 'bg-bg-base/40 text-text-tertiary')}>
                   {React.createElement(reg.icon, { size: 24 })}
                </div>
                {reg.count > 0 && <Badge variant={activeRegistry === reg.id ? 'info' : 'muted'}>{reg.count}</Badge>}
              </Flex>
              <div>
                <Text variant="h3" className={activeRegistry === reg.id ? 'text-accent' : ''}>{reg.label}</Text>
                <Text variant="xs" className="mt-1 block opacity-40">Shoper Protocol Registry</Text>
              </div>
            </button>
          ))}
        </aside>

        {/* Dynamic Registry Table */}
        <main className="flex-1 flex flex-col overflow-hidden h-full">
           <DataTable<RegistryEntity>
              data={filteredData}
              loading={loading}
              onRowClick={(item) => setSelectedEntity(item)}
              columns={[
                {
                  header: 'Protocol ID',
                  accessor: (item) => (
                    <Badge variant="muted" className="font-mono text-[10px] h-8 px-4">
                      {item.code || item.mobile || item.id.slice(0, 8)}
                    </Badge>
                  )
                },
                {
                  header: 'Master Name',
                  accessor: (item) => (
                    <div>
                      <Text variant="sm" className="font-bold uppercase group-hover:text-accent transition-colors">
                        {item.name || item.full_name}
                      </Text>
                      <Text variant="xs" className="mt-1 block opacity-40">
                        {item.category || item.loyalty_tier || item.tax_behavior || (item.full_name ? 'PERSONNEL' : 'Standard')} Registry
                      </Text>
                    </div>
                  )
                },
                {
                  header: 'DNA Map',
                  align: 'right',
                  accessor: (item) => (
                    <div>
                      <Text variant="sm" className="font-mono font-bold">
                        {item.price ? formatCurrency(item.price * 100) : item.points ? `${item.points} Pts` : item.email || item.terms}
                      </Text>
                      <Text variant="xs" className="mt-1 block opacity-40">
                        {item.stock !== undefined ? `In-Stock: ${item.stock}` : item.mobile || item.tax_type || item.category || 'Standard Value'}
                      </Text>
                    </div>
                  )
                },
                {
                  header: 'Protocol Status',
                  align: 'center',
                  accessor: () => (
                    <Flex center gap={2}>
                      <ShieldCheck size={14} className="text-status-green" />
                      <Text variant="xs" className="text-status-green font-bold">VERIFIED</Text>
                    </Flex>
                  )
                },
                {
                  header: '',
                  align: 'right',
                  accessor: () => (
                    <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-text-tertiary">
                      <MoreVertical size={18} />
                    </Button>
                  )
                }
              ]}
           />
        </main>

        {/* Sovereign Relationship Matrix (Side Panel) */}
        <AnimatePresence>
          {selectedEntity && (
            <motion.aside initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
              className="w-[450px] flex flex-col overflow-hidden h-full">
              <Card className="flex-1 flex flex-col overflow-hidden border-border-subtle shadow-2xl bg-bg-elevated/40">
                
                <div className="bg-accent p-10 text-bg-base relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Zap size={160} /></div>
                   <Button variant="ghost" onClick={() => setSelectedEntity(null)} className="absolute top-8 right-8 w-10 h-10 p-0 rounded-full bg-bg-base/10 hover:bg-bg-base/20 text-bg-base">
                      <X size={20} />
                   </Button>
                   
                   <div className="p-4 bg-bg-base text-accent rounded-2xl w-14 h-14 flex items-center justify-center mb-6 shadow-2xl shadow-bg-base/20">
                      <Zap size={28} />
                   </div>
                   <Text variant="h1" className="text-bg-base leading-tight">{selectedEntity.name || selectedEntity.full_name}</Text>
                   <Text variant="xs" className="text-bg-base opacity-60 mt-3 block font-black">Sovereign Matrix Mapping</Text>
                </div>

                <div className="flex-1 overflow-auto p-10 space-y-10 no-scrollbar">
                   {/* Identity DNA */}
                   <section className="space-y-6">
                      <Flex gap={3} className="opacity-40 uppercase tracking-widest text-[10px] font-black">
                         <ShieldCheck size={14} /> Identity DNA
                      </Flex>
                      <Grid cols={2} gap={4}>
                         {[
                           { label: 'Code', value: selectedEntity.code || 'N/A', icon: Info },
                           { label: 'Category', value: selectedEntity.category || activeRegistry, icon: Layers },
                           { label: 'Contact', value: selectedEntity.mobile || selectedEntity.email || 'Private', icon: Smartphone },
                           { label: 'Tax Map', value: selectedEntity.tax_type || selectedEntity.tax_behavior || 'Local-Incl', icon: Globe },
                         ].map(dna => (
                           <Card key={dna.label} variant="flat" className="p-5 border-border-subtle group hover:border-accent/30 transition-all">
                              <Flex gap={3} className="mb-2 opacity-40">
                                 <dna.icon size={12} />
                                 <Text variant="xs" className="uppercase font-black scale-90 origin-left">{dna.label}</Text>
                              </Flex>
                              <Text variant="sm" className="font-bold truncate font-mono">{dna.value}</Text>
                           </Card>
                         ))}
                      </Grid>
                   </section>

                   {/* Shoper 9 Deep Mapping */}
                   <section className="space-y-6">
                      <Flex gap={3} className="opacity-40 uppercase tracking-widest text-[10px] font-black">
                         <Zap size={14} /> Protocol Rules
                      </Flex>
                      <Card variant="flat" className="p-6 space-y-6">
                         {activeRegistry === 'CUSTOMERS' && (
                           <Flex between className="pb-4 border-b border-border-subtle/50">
                              <Text variant="xs" className="font-bold">Birthday / Anniversary</Text>
                              <Badge variant="warn" className="font-mono">{selectedEntity.dob || 'NOT SET'}</Badge>
                           </Flex>
                         )}
                         {activeRegistry === 'ITEMS' && (
                           <Flex between className="pb-4 border-b border-border-subtle/50">
                              <Text variant="xs" className="font-bold">HSN / SAC Code</Text>
                              <Badge variant="info" className="font-mono">{selectedEntity.hsn || 'PENDING'}</Badge>
                           </Flex>
                         )}
                      </Card>
                   </section>

                   {/* Action Intelligence */}
                   <Flex gap={4} className="pt-8 border-t border-border-subtle">
                        <Button variant="sec" className="flex-1 flex flex-col h-auto p-6 gap-3 group border-border-subtle">
                           <HistoryIcon size={24} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                           <span className="text-[9px] font-black uppercase tracking-widest">History Log</span>
                        </Button>
                      {hasPermission('catalog.edit') && (
                        <Button className="flex-1 flex flex-col h-auto p-6 gap-3">
                          <Settings2 size={24} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Modify Entity</span>
                        </Button>
                      )}
                   </Flex>
                </div>
              </Card>
            </motion.aside>
          )}
        </AnimatePresence>
      </Flex>
    </Container>
  );
};

export default MasterRegistry;




