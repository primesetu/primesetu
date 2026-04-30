/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RotateCcw, 
  PackageX, 
  Ticket, 
  Search, 
  CheckCircle2,
  Receipt,
  Download,
  Trash2,
  CreditCard,
  History as HistoryIcon
} from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge,
  DataTable
} from '../../components/ui/SovereignUI';

export default function TransactionsModule() {
  const [activeTab, setActiveTab] = useState<'SALES_RETURN' | 'PURCHASE_RETURN' | 'CREDIT_NOTES'>('SALES_RETURN')
  const [searchInvoice, setSearchInvoice] = useState('')
  const [isFound, setIsFound] = useState(false)

  const tabs = [
    { id: 'SALES_RETURN', label: 'Sales Return', icon: RotateCcw },
    { id: 'PURCHASE_RETURN', label: 'Purchase Return', icon: PackageX },
    { id: 'CREDIT_NOTES', label: 'Credit Notes', icon: Ticket }
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <Text variant="h1">Returns & Credits</Text>
          <Text variant="xs" className="mt-2 block">Node: X01 | Sovereign Reversal Engine</Text>
        </div>
        
        <Card variant="flat" className="p-1.5 flex gap-1.5 bg-bg-float/40 border-border-subtle">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsFound(false) }}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-bg-elevated text-accent shadow-lg' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </Card>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'SALES_RETURN' && (
          <motion.div key="sr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
            {/* Search Invoice */}
            <Card className="p-16 text-center relative overflow-hidden flex flex-col items-center bg-bg-elevated/40 border-border-subtle">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><RotateCcw size={200} /></div>
               <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-accent/20">
                  <Search size={32} />
               </div>
               <Text variant="h1" className="mb-4">Invoice Search</Text>
               <Text variant="p" className="max-w-md mb-12 uppercase tracking-tighter font-bold opacity-60">Scan the barcode from the customer's bill or enter the invoice ID to initiate the return protocol.</Text>
               
               <div className="w-full max-w-xl flex gap-4">
                  <Input 
                    type="text" 
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                    placeholder="INV NO / MOBILE NO..."
                    className="flex-1 h-16 px-10 text-xl font-mono font-bold tracking-widest"
                  />
                  <Button 
                    onClick={() => setIsFound(true)}
                    className="h-16 px-12"
                  >
                    Fetch Bill
                  </Button>
               </div>
            </Card>

            {/* Found Invoice Preview */}
            {isFound && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <Card className="overflow-hidden border-border-subtle shadow-2xl">
                  <div className="bg-status-green/10 p-8 border-b border-border-subtle flex justify-between items-center">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-status-green/20 text-status-green rounded-2xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
                        <div>
                          <Text variant="h3">Invoice RET-10245 Verified</Text>
                          <div className="flex items-center gap-2 mt-1">
                             <Badge variant="success">Authentic</Badge>
                             <Text variant="xs">Customer: J.R.M. | Date: 2026-04-24</Text>
                          </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <Text variant="xs" className="opacity-60 block mb-1">Original Bill Value</Text>
                        <Text variant="h1" className="text-status-green">{formatCurrency(450000)}</Text>
                     </div>
                  </div>

                  <div className="p-0">
                    <DataTable
                      data={[
                        { name: 'Puma RS-X Bold', size: '10', price: 249900 },
                        { name: 'Nexus Cotton Tee', size: 'L', price: 99900 }
                      ]}
                      columns={[
                        { 
                          header: 'Item Entity', 
                          accessor: (item: any) => (
                            <div className="py-2">
                              <Text variant="sm" className="font-bold uppercase">{item.name}</Text>
                              <Text variant="xs" className="font-mono mt-1 block">Size: {item.size} | MRP: {formatCurrency(item.price)}</Text>
                            </div>
                          ),
                          className: 'px-10'
                        },
                        { header: 'Original Qty', accessor: () => '1', align: 'center', className: 'font-mono font-bold text-text-tertiary' },
                        { 
                          header: 'Return Volume', 
                          accessor: () => (
                            <div className="inline-flex items-center bg-bg-input rounded-xl border border-border-subtle px-4 py-1">
                              <Input type="number" defaultValue="1" className="w-12 h-6 p-0 border-none bg-transparent text-center font-black" />
                            </div>
                          ),
                          align: 'center'
                        },
                        { header: 'Refund Value', accessor: (item: any) => formatCurrency(item.price), align: 'right', className: 'font-mono font-black text-text-primary' },
                        { 
                          header: 'Registry Action', 
                          accessor: () => (
                            <Button variant="ghost" size="sm" className="text-status-red hover:bg-status-red/10">
                              <Trash2 size={14} />
                            </Button>
                          ),
                          align: 'center',
                          className: 'px-10'
                        }
                      ]}
                    />
                  </div>

                  <div className="p-8 bg-bg-float/20 border-t border-border-subtle flex items-center justify-between">
                     <div className="flex gap-16">
                        <div>
                          <Text variant="xs" className="mb-1 block opacity-60">Return Entities</Text>
                          <Text variant="h2">2 Units</Text>
                        </div>
                        <div>
                          <Text variant="xs" className="mb-1 block opacity-60">Net Refund Payable</Text>
                          <Text variant="h2" className="text-status-green">{formatCurrency(349800)}</Text>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <Button variant="sec" className="h-12 px-8">
                           CASH REFUND
                        </Button>
                        <Button className="h-12 px-8">
                          <Ticket size={18} /> ISSUE CREDIT NOTE
                        </Button>
                     </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'CREDIT_NOTES' && (
          <motion.div key="cn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Active Registry Notes', value: '42', color: 'text-accent', icon: Ticket },
                  { label: 'Total Liability', value: formatCurrency(12400000), color: 'text-status-red', icon: CreditCard },
                  { label: 'Expired (Last 30d)', value: '12', color: 'text-text-tertiary', icon: HistoryIcon }
                ].map((stat, i) => (
                  <Card key={i} className="p-8 bg-bg-elevated/40 border-border-subtle">
                    <div className="flex items-center gap-3 mb-4 opacity-60 uppercase tracking-[0.2em] font-black text-[9px]">
                       <stat.icon size={12} /> {stat.label}
                    </div>
                    <Text variant="h1" className={stat.color}>{stat.value}</Text>
                  </Card>
                ))}
             </div>

             <Card className="overflow-hidden border-border-subtle shadow-2xl">
                <div className="p-8 bg-bg-elevated/40 border-b border-border-subtle flex items-center justify-between">
                   <Text variant="h3">Credit Note Register</Text>
                   <Button variant="sec" size="sm">
                      <Download size={16} /> Audit Log
                   </Button>
                </div>
                <div className="overflow-x-auto">
                   <DataTable
                      data={[
                        { no: 'CN-2026-001', cust: 'A.K. Sharma', date: '2026-04-01', exp: '2026-07-01', val: 120000, status: 'ACTIVE' },
                        { no: 'CN-2026-002', cust: 'Mehul Jani', date: '2026-04-12', exp: '2026-07-12', val: 45000, status: 'EXPIRED' }
                      ]}
                      columns={[
                        { header: 'Protocol ID', accessor: 'no', className: 'px-10 font-mono font-bold text-accent' },
                        { header: 'Customer Entity', accessor: 'cust', className: 'px-6 font-bold uppercase text-text-secondary' },
                        { header: 'Issue Timestamp', accessor: (item: any) => <span className="opacity-60">{item.date}</span>, className: 'px-6 font-mono text-xs' },
                        { header: 'Expiry Threshold', accessor: (item: any) => <span className="text-status-red/60">{item.exp}</span>, className: 'px-6 font-mono text-xs' },
                        { header: 'Registry Balance', accessor: (item: any) => <Text variant="h3" className="font-mono text-text-primary">{formatCurrency(item.val)}</Text>, align: 'right', className: 'px-6' },
                        { 
                          header: 'Status', 
                          accessor: (item: any) => (
                            <Badge variant={item.status === 'ACTIVE' ? 'success' : 'error'}>
                              {item.status}
                            </Badge>
                          ),
                          align: 'center',
                          className: 'px-10'
                        }
                      ]}
                   />
                </div>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}




