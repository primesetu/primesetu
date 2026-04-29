import { useState } from 'react'
import { Scale, Plus, Save, Info } from 'lucide-react'
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge, 
  Modal 
} from '../../components/ui/SovereignUI';

interface TaxSlab {
  min: number
  max: number
  rate: number
}

interface TaxRate {
  id: string
  name: string
  hsn: string
  slabs: TaxSlab[]
}

export default function TaxMaster({ onClose }: { onClose: () => void }) {
  const [taxes, setTaxes] = useState<TaxRate[]>([
    { id: '1', name: 'GST Footwear', hsn: '6403', slabs: [{ min: 0, max: 999, rate: 5 }, { min: 1000, max: 99999, rate: 12 }] },
    { id: '2', name: 'GST Apparel', hsn: '6203', slabs: [{ min: 0, max: 999, rate: 5 }, { min: 1000, max: 99999, rate: 12 }] },
    { id: '3', name: 'Standard GST', hsn: '0000', slabs: [{ min: 0, max: 999999, rate: 18 }] },
  ])

  const addSlab = (taxId: string) => {
    setTaxes(taxes.map(t => t.id === taxId ? { ...t, slabs: [...t.slabs, { min: 0, max: 0, rate: 0 }] } : t))
  }

  const updateSlab = (taxId: string, idx: number, field: keyof TaxSlab, value: number) => {
    setTaxes(taxes.map(t => {
      if (t.id === taxId) {
        const newSlabs = [...t.slabs]
        newSlabs[idx] = { ...newSlabs[idx], [field]: value }
        return { ...t, slabs: newSlabs }
      }
      return t
    }))
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Tax Master"
      subtitle="GST Slab Configuration · Shoper 9 Compliance"
      icon={<Scale size={24} />}
      footer={
        <>
          <div className="flex items-center gap-3 text-status-amber">
            <Info size={18} />
            <Text variant="xs" className="font-bold">Pricing-based slabs are processed during real-time checkout.</Text>
          </div>
          <Button onClick={onClose} className="px-10">
            <Save size={18} /> SAVE TAX CONFIGURATION
          </Button>
        </>
      }
    >
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <Text variant="h2">Active Tax Groups</Text>
          <Button variant="sec" size="sm">
            <Plus size={16} /> ADD NEW TAX GROUP
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {taxes.map(tax => (
            <Card key={tax.id} className="overflow-hidden border-border-subtle group hover:border-accent/30 transition-all">
              <div className="p-6 bg-bg-float/40 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <Text variant="h3">{tax.name}</Text>
                    <Badge variant="muted" className="font-mono">HSN: {tax.hsn}</Badge>
                  </div>
                  <Text variant="xs" className="mt-1">Multi-Slab Pricing Logic Enabled</Text>
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="text-status-red hover:text-status-red hover:bg-status-red/10">Delete</Button>
                  <Button variant="ghost" size="sm">Edit Layout</Button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-6 mb-4 px-4">
                  <Text variant="xs">Price Range (Min)</Text>
                  <Text variant="xs">Price Range (Max)</Text>
                  <Text variant="xs" className="text-center">Tax Rate (%)</Text>
                </div>
                <div className="space-y-3">
                  {tax.slabs.map((slab, i) => (
                    <div key={i} className="grid grid-cols-3 gap-6 bg-bg-float/20 p-4 rounded-xl border border-transparent hover:border-border-subtle transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-text-tertiary">₹</span>
                        <Input 
                          type="number" 
                          value={slab.min} 
                          onChange={(e) => updateSlab(tax.id, i, 'min', Number(e.target.value))}
                          className="h-10 text-center font-mono font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-text-tertiary">₹</span>
                        <Input 
                          type="number" 
                          value={slab.max} 
                          onChange={(e) => updateSlab(tax.id, i, 'max', Number(e.target.value))}
                          className="h-10 text-center font-mono font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <Input 
                          type="number" 
                          value={slab.rate} 
                          onChange={(e) => updateSlab(tax.id, i, 'rate', Number(e.target.value))}
                          className="w-20 h-10 text-center font-mono font-bold text-accent"
                        />
                        <span className="text-xs font-black text-text-tertiary">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => addSlab(tax.id)}
                  className="mt-6 text-accent"
                >
                  <Plus size={14} /> Add Price Slab
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Modal>
  )
}
