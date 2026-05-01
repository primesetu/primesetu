/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { Save, X, Package, Ruler, Tag, Truck, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';

import { apiClient } from '../../api/client';
import StockMatrix from './StockMatrix';
import { 
  Button, 
  Input, 
  Select, 
  Label, 
  Card, 
  Text,
  KPI
} from '../../components/ui/SovereignUI';

interface ItemFormProps {
  onClose: () => void;
  editId?: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface SizeGroup {
  id: string;
  name: string;
  sizes: string[];
}

interface Partner {
  id: string;
  name: string;
  type: string;
}

interface StockMatrixEntry {
  size: string;
  colour: string;
  qty_on_hand: number;
}

const ItemForm: React.FC<ItemFormProps> = ({ onClose, editId }) => {
  const queryClient = useQueryClient();
  
  // 1. Master Data Queries — via FastAPI (JWT auto-injected by apiClient)
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get<Department[]>('/catalogue/departments/');
      return res.data;
    }
  });

  const { data: sizeGroups = [] } = useQuery<SizeGroup[]>({
    queryKey: ['size-groups'],
    queryFn: async () => {
      const res = await apiClient.get<SizeGroup[]>('/catalogue/size-groups/');
      return res.data;
    }
  });

  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ['partners', 'vendor'],
    queryFn: async () => {
      const res = await apiClient.get<Partner[]>('/customer/search?type=vendor&q=');
      return res.data;
    }
  });

  // 2. Local State
  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    department_id: '',
    brand: '',
    supplier_id: '',
    size_group_id: '',
    colour: '',
    colour_code: '',
    mrp_rupees: 0,
    cost_rupees: 0,
    gst_rate: 12,
    hsn_code: '',
    subclass1: '',
    subclass2: '',
    stock_matrix: [] as StockMatrixEntry[]
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // 3. Size Group Selection Effect
  useEffect(() => {
    if (formData.size_group_id) {
      const group = sizeGroups.find(g => g.id === formData.size_group_id);
      if (group) setSelectedSizes(group.sizes);
    }
  }, [formData.size_group_id, sizeGroups]);

  // 4. Hotkeys
  useHotkeys('f10', (e) => { e.preventDefault(); handleSave(); }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => { e.preventDefault(); onClose(); }, { enableOnFormTags: true });

  // 5. Create Mutation — JWT injected by apiClient interceptor
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        item_code: data.item_code,
        item_name: data.item_name,
        department_id: data.department_id,
        brand: data.brand || null,
        supplier_id: data.supplier_id || null,
        size_group_id: data.size_group_id || null,
        colour: data.colour || null,
        colour_code: data.colour_code || null,
        mrp_paise: Math.round(data.mrp_rupees * 100),
        cost_paise: data.cost_rupees ? Math.round(data.cost_rupees * 100) : null,
        gst_rate: data.gst_rate,
        hsn_code: data.hsn_code,
        anal_codes: {
          subclass1: data.subclass1,
          subclass2: data.subclass2
        },
        stock_matrix: data.stock_matrix.filter(m => m.qty_on_hand > 0)
      };
      const res = await apiClient.post('/items/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      onClose();
    }
  });

  const handleSave = () => {
    if (!formData.item_code || !formData.item_name || !formData.department_id) return;
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-end">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-bg-base w-full max-w-4xl h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="bg-brand-navy p-10 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-gold rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-brand-navy" size={28} />
            </div>
            <div>
              <Text variant="h1" className="text-white">Item Master Entry</Text>
              <Text variant="hint" className="text-brand-gold uppercase tracking-[0.3em] mt-3">Sovereign Registry › Atomic Sync Protocol</Text>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-4 rounded-full transition-all">
            <X size={28} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          
          {/* Section: Basic Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <Text variant="label" className="flex items-center gap-3">
                <Tag size={16} /> Basic Identity
              </Text>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Protocol Code *</Label>
                  <Input 
                    type="text" 
                    maxLength={20}
                    value={formData.item_code}
                    onChange={(e) => setFormData({...formData, item_code: e.target.value.toUpperCase()})}
                    placeholder="SKU-..."
                    className="font-mono"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Department *</Label>
                  <Select 
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  >
                    <option value="">-- SELECT --</option>
                    {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Description Identity *</Label>
                <Input 
                  type="text" 
                  maxLength={40}
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  placeholder="ITEM DESCRIPTION..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <Text variant="label" className="flex items-center gap-3">
                <Truck size={16} /> Supply Registry
              </Text>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Brand Label</Label>
                  <Input 
                    type="text" 
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="BRAND NAME..."
                  />
                </div>
                <div className="space-y-3">
                  <Label>Partner Supplier</Label>
                  <Select 
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  >
                    <option value="">-- SELECT --</option>
                    {Array.isArray(partners) && partners.filter(p => p.type !== 'customer').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Colour DNA</Label>
                  <Input 
                    type="text" 
                    value={formData.colour}
                    onChange={(e) => setFormData({...formData, colour: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label>HEX / Code</Label>
                  <Input 
                    type="text" 
                    className="font-mono"
                    value={formData.colour_code}
                    onChange={(e) => setFormData({...formData, colour_code: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div className="space-y-3">
                  <Label>Sub-Class 1</Label>
                  <Input 
                    type="text" 
                    value={formData.subclass1}
                    onChange={(e) => setFormData({...formData, subclass1: e.target.value})}
                    placeholder="e.g. CASUAL"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Sub-Class 2</Label>
                  <Input 
                    type="text" 
                    value={formData.subclass2}
                    onChange={(e) => setFormData({...formData, subclass2: e.target.value})}
                    placeholder="e.g. COTTON"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Pricing & Tax */}
          <Card className="rounded-[40px] p-10 space-y-8 shadow-sm">
            <Text variant="label" className="text-brand-gold flex items-center gap-3">
              <Tag size={16} /> Pricing Protocol & Compliance
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <Label>MRP (Paise-Calc) *</Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary/30 text-xs font-black">₹</span>
                  <Input 
                    type="number" 
                    className="pl-10 font-mono"
                    value={formData.mrp_rupees}
                    onChange={(e) => setFormData({...formData, mrp_rupees: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Sovereign Cost</Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary/30 text-xs font-black">₹</span>
                  <Input 
                    type="number" 
                    className="pl-10 font-mono"
                    value={formData.cost_rupees}
                    onChange={(e) => setFormData({...formData, cost_rupees: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>GST Matrix % *</Label>
                <Select 
                  value={formData.gst_rate}
                  onChange={(e) => setFormData({...formData, gst_rate: parseInt(e.target.value)})}
                >
                  {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}% GST</option>)}
                </Select>
              </div>
              <div className="space-y-3">
                <Label>HSN Protocol *</Label>
                <Input 
                  type="text" 
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({...formData, hsn_code: e.target.value})}
                  placeholder="HSN CODE..."
                  className="font-mono"
                />
              </div>
            </div>
          </Card>

          {/* Section: Stock Matrix */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <Text variant="label" className="flex items-center gap-3">
                <Ruler size={16} /> Dimensional Stock Matrix
              </Text>
              <Select 
                className="bg-brand-gold/10 text-brand-gold h-10 w-auto"
                value={formData.size_group_id}
                onChange={(e) => setFormData({...formData, size_group_id: e.target.value})}
              >
                <option value="">SELECT SIZE GROUP</option>
                {Array.isArray(sizeGroups) && sizeGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select>
            </div>

            {formData.size_group_id ? (
              <StockMatrix 
                sizes={selectedSizes}
                colours={[formData.colour || 'Standard']}
                matrix={formData.stock_matrix}
                onChange={(m) => setFormData({...formData, stock_matrix: m})}
              />
            ) : (
              <div className="h-40 border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center text-text-secondary/10 gap-3 bg-bg-elevated/30">
                <Ruler size={32} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Establish size group to enable grid</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 bg-bg-elevated border-t border-border flex gap-6 shrink-0 shadow-2xl">
          <Button 
            variant="sec"
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl"
          >
            Discard Session [Esc]
          </Button>
          <Button 
            variant="primary"
            disabled={saveMutation.isPending || !formData.item_code || !formData.item_name || !formData.department_id}
            onClick={handleSave}
            className="flex-[2] h-14 bg-brand-navy text-brand-gold rounded-2xl tracking-[0.3em]"
          >
            {saveMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {saveMutation.isPending ? 'Establishing SKU...' : 'Establish Registry [F10]'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;




