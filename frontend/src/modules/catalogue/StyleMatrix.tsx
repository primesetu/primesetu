/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Box, Layers, ArrowLeft, Save, Plus, Trash2, Camera, Info, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Button, 
  Card, 
  Text, 
  DataTable 
} from '@/components/ui/SovereignUI';

interface MatrixCell {
  id: string;
  stock: number;
  price: number;
  code: string;
}

interface StyleMatrixProps {
  styleCode: string;
  onBack: () => void;
}

const MOCK_MATRIX = {
  style_code: 'PUMA-RSX-01',
  name: 'Puma RS-X Bold Sneakers',
  colors: ['Black/Gold', 'Triple White', 'Navy/Red'],
  sizes: ['UK-7', 'UK-8', 'UK-9', 'UK-10', 'UK-11'],
  matrix: {
    'Black/Gold': {
      'UK-7': { id: '1', stock: 12, price: 8999, code: '890123' },
      'UK-8': { id: '2', stock: 5, price: 8999, code: '890124' },
      'UK-9': { id: '3', stock: 8, price: 8999, code: '890125' },
    },
    'Triple White': {
      'UK-8': { id: '4', stock: 20, price: 8499, code: '890224' },
      'UK-10': { id: '5', stock: 2, price: 8499, code: '890226' },
    }
  }
};

export default function StyleMatrix({ styleCode, onBack }: StyleMatrixProps) {
  const [data] = useState(MOCK_MATRIX);

  // ── TRANSFORM DATA FOR AG GRID ──
  const rowData = useMemo(() => {
    return data.colors.map(color => {
      const row: any = { color };
      data.sizes.forEach(size => {
        row[size] = (data.matrix as any)[color]?.[size];
      });
      return row;
    });
  }, [data]);

  // ── GRID COLUMNS ──
  const columns = useMemo(() => {
    const colorCol = {
      header: "COLOR \\ SIZE",
      accessor: (item: any) => (
        <span className="font-black text-navy uppercase text-xs tracking-wider">{item.color}</span>
      ),
      width: 220,
      pinned: 'left' as const,
      className: 'bg-navy/2'
    };

    const sizeCols = data.sizes.map(size => ({
      header: size.toUpperCase(),
      accessor: (item: any) => {
        const cell = item[size];
        if (!cell) {
          return (
             <div className="opacity-0 hover:opacity-100 flex justify-center">
                <Button variant="sec" size="sm" className="h-9 w-9 p-0 border-dashed rounded-full"><Plus size={14}/></Button>
             </div>
          )
        }
        return (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={cn(
              "relative rounded-2xl p-4 transition-all border-2 flex flex-col items-center justify-center gap-1",
              cell.stock <= 5 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
            )}
          >
            <span className="text-xl font-black tracking-tighter leading-none">{cell.stock}</span>
            <span className="text-[9px] font-black uppercase opacity-60">In Stock</span>
            <div className="mt-2 text-[10px] font-black bg-white px-2 py-0.5 rounded shadow-sm text-navy">
              ₹{cell.price.toLocaleString()}
            </div>
          </motion.div>
        );
      },
      width: 140,
      className: 'p-2'
    }));

    return [colorCol, ...sizeCols];
  }, [data]);

  return (
    <div className="flex flex-col h-full bg-navy/2 p-8 gap-8 overflow-hidden animate-in fade-in duration-1000">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Button variant="sec" onClick={onBack} className="h-14 w-14 p-0 rounded-full shadow-2xl bg-white border-none">
            <ArrowLeft className="w-6 h-6 text-navy" />
          </Button>
          <div>
            <Text variant="xs" className="font-black text-indigo-500 uppercase tracking-[0.4em] mb-1">Catalogue / Style Matrix</Text>
            <Text variant="h1" className="text-5xl font-black text-navy tracking-tighter uppercase leading-none">
              {data.name} <span className="text-navy/10 ml-4">({data.style_code})</span>
            </Text>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="sec" className="px-8 h-14 rounded-2xl bg-white shadow-xl text-navy border-navy/5 font-black uppercase text-[10px] tracking-widest gap-2">
            <Plus className="w-5 h-5" /> Add Variant
          </Button>
          <Button className="px-10 h-14 rounded-2xl bg-navy text-white shadow-2xl font-black uppercase text-[10px] tracking-widest gap-2">
            <Save className="w-5 h-5 text-brand-gold" /> Save Protocol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10 flex-1 min-h-0">
        {/* Left Panel */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">
           <Card className="p-8 bg-white rounded-[3rem] border-none shadow-2xl">
              <div className="aspect-square rounded-[2rem] bg-navy/5 flex items-center justify-center relative overflow-hidden group shadow-inner">
                <img 
                  src="https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/372715/01/sv01/fnd/IND/fmt/png/RS-X-Bold-Sneakers" 
                  alt="Product"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <Button className="absolute bottom-6 right-6 h-12 w-12 rounded-2xl bg-white/90 backdrop-blur shadow-2xl text-navy p-0 border-none">
                  <Camera className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mt-10 space-y-8">
                <div>
                  <Text variant="xs" className="font-black text-navy/20 uppercase tracking-[0.2em] mb-6 block">Primary Info</Text>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center py-4 border-b border-navy/5">
                      <Text variant="xs" className="font-black text-navy/40 uppercase tracking-widest">Brand</Text>
                      <Text variant="sm" className="font-black text-navy">PUMA</Text>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-navy/5">
                      <Text variant="xs" className="font-black text-navy/40 uppercase tracking-widest">Category</Text>
                      <Text variant="sm" className="font-black text-navy uppercase">Men Footwear</Text>
                    </div>
                  </div>
                </div>
              </div>
           </Card>
        </div>

        {/* Matrix Grid */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8 overflow-hidden">
           <Card className="bg-white rounded-[4rem] flex-1 flex flex-col min-h-0 overflow-hidden shadow-2xl border-none">
              <div className="flex-1 overflow-hidden">
                 <DataTable 
                   data={rowData}
                   columns={columns}
                   headerHeight={80}
                   rowHeight={120}
                 />
              </div>
           </Card>

           {/* Analytics Bar */}
           <div className="flex items-center gap-8 bg-navy p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 rotate-12 -translate-y-4">
                 <Layers size={200} />
              </div>
              <div className="flex-1 flex items-center justify-around relative z-10">
                 <div className="text-center">
                   <Text variant="xs" className="font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total Stock</Text>
                   <Text variant="h1" className="text-4xl font-black">47 <span className="text-xs text-white/20">Units</span></Text>
                 </div>
                 <div className="w-px h-12 bg-white/10" />
                 <div className="text-center">
                   <Text variant="xs" className="font-black text-white/40 uppercase tracking-[0.2em] mb-2">Avg Protocol Price</Text>
                   <Text variant="h1" className="text-4xl font-black">₹8,744</Text>
                 </div>
                 <div className="w-px h-12 bg-white/10" />
                 <div className="text-center">
                   <Text variant="xs" className="font-black text-white/40 uppercase tracking-[0.2em] mb-2">Sell Through</Text>
                   <Text variant="h1" className="text-4xl font-black text-brand-gold">64%</Text>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
