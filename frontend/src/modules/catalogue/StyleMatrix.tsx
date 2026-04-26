/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * StyleMatrix: High-Fidelity Size/Color Grid (Tesla Style)
 * ============================================================ */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Layers, ArrowLeft, Save, Plus, Trash2, Camera, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Mock data based on Shoper 9 logic
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
  const [data, setData] = useState(MOCK_MATRIX);
  const [hoveredCell, setHoveredCell] = useState<{c: string, s: string} | null>(null);

  return (
    <div className="flex flex-col h-full bg-navy/5 p-8 gap-8 overflow-hidden">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <div>
            <div className="text-[10px] font-black text-saffron uppercase tracking-[0.3em] mb-1">Catalogue / Style Matrix</div>
            <h1 className="text-4xl font-black text-navy tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>
              {data.name} <span className="text-navy/20">({data.style_code})</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="tesla-button bg-white text-navy border-navy/10 hover:bg-navy/5">
            <Plus className="w-5 h-5" /> Add Variant
          </button>
          <button className="tesla-button">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        {/* ── PREVIEW CARD (Tesla Left Panel) ── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="tesla-card bg-white h-fit">
            <div className="aspect-square rounded-3xl bg-navy/5 flex items-center justify-center relative overflow-hidden group">
              <img 
                src="https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/372715/01/sv01/fnd/IND/fmt/png/RS-X-Bold-Sneakers" 
                alt="Product"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <button className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-white/80 backdrop-blur shadow-xl flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-2">Primary Info</label>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between py-2 border-b border-navy/5">
                    <span className="text-xs font-bold text-navy/60">Brand</span>
                    <span className="text-xs font-black text-navy">PUMA</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-navy/5">
                    <span className="text-xs font-bold text-navy/60">Category</span>
                    <span className="text-xs font-black text-navy">MEN FOOTWEAR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── THE MATRIX (Tesla Control Center) ── */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="tesla-card bg-white flex-1 flex flex-col min-h-0 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-20 bg-white p-6 border-b-2 border-navy/5 text-left min-w-[200px]">
                    <div className="flex items-center gap-3 text-navy/20 font-black italic">
                      <Layers className="w-5 h-5" /> Color \ Size
                    </div>
                  </th>
                  {data.sizes.map(size => (
                    <th key={size} className="sticky top-0 z-10 bg-white p-6 border-b-2 border-navy/5 text-center min-w-[120px]">
                      <div className="text-sm font-black text-navy uppercase tracking-widest">{size}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.colors.map(color => (
                  <tr key={color} className="group hover:bg-navy/[0.01] transition-colors">
                    <td className="sticky left-0 bg-white group-hover:bg-navy/[0.01] p-6 border-b border-navy/5 font-black text-navy uppercase text-xs tracking-wider z-10">
                      {color}
                    </td>
                    {data.sizes.map(size => {
                      const cell = data.matrix[color as keyof typeof data.matrix]?.[size as any];
                      return (
                        <td 
                          key={size} 
                          className="p-3 border-b border-navy/5 text-center transition-all duration-300"
                          onMouseEnter={() => setHoveredCell({c: color, s: size})}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {cell ? (
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className={cn(
                                "relative rounded-2xl p-4 transition-all border-2 flex flex-col items-center justify-center gap-1",
                                cell.stock <= 5 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                              )}
                            >
                              <span className="text-xl font-black tracking-tighter leading-none">{cell.stock}</span>
                              <span className="text-[9px] font-bold uppercase opacity-60">In Stock</span>
                              <div className="mt-2 text-[10px] font-black bg-white px-2 py-0.5 rounded shadow-sm text-navy">
                                ₹{cell.price.toLocaleString()}
                              </div>
                            </motion.div>
                          ) : (
                            <div className="opacity-10 hover:opacity-100 transition-opacity">
                              <button className="w-10 h-10 rounded-full border-2 border-dashed border-navy/20 flex items-center justify-center hover:bg-navy hover:text-white transition-all">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── FOOTER ANALYTICS ── */}
          <div className="flex items-center gap-6">
            <div className="flex-1 tesla-glass rounded-3xl p-6 flex items-center justify-around border-navy/5">
              <div className="text-center">
                <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Total Stock</div>
                <div className="text-2xl font-black text-navy">47 <span className="text-xs text-navy/20">Units</span></div>
              </div>
              <div className="w-px h-8 bg-navy/10" />
              <div className="text-center">
                <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Avg Price</div>
                <div className="text-2xl font-black text-navy">₹8,744</div>
              </div>
              <div className="w-px h-8 bg-navy/10" />
              <div className="text-center">
                <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Sell Through</div>
                <div className="text-2xl font-black text-emerald-500">64%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
