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

import React, { useMemo } from 'react';
import { DataTable, Text } from '@/components/ui/SovereignUI';
import { Keyboard } from 'lucide-react';

interface MatrixCell {
  size: string;
  colour: string;
  qty_on_hand: number;
}

interface StockMatrixProps {
  sizes: string[];
  colours: string[];
  matrix: MatrixCell[];
  onChange?: (matrix: MatrixCell[]) => void;
  readOnly?: boolean;
}

const StockMatrix: React.FC<StockMatrixProps> = ({ 
  sizes, 
  colours, 
  matrix, 
  onChange, 
  readOnly = false 
}) => {
  
  const getQty = (size: string, colour: string) => {
    return matrix.find(m => m.size === size && m.colour === colour)?.qty_on_hand || 0;
  };

  const handleQtyChange = (size: string, colour: string, newQty: number) => {
    if (readOnly || !onChange) return;
    
    const existingIdx = matrix.findIndex(m => m.size === size && m.colour === colour);
    let newMatrix = [...matrix];
    
    if (existingIdx >= 0) {
      newMatrix[existingIdx] = { ...newMatrix[existingIdx], qty_on_hand: newQty };
    } else {
      newMatrix.push({ size, colour, qty_on_hand: newQty });
    }
    
    onChange(newMatrix);
  };

  // ── TRANSFORM DATA FOR AG GRID ──
  // Each row is a Size, with properties for each Colour
  const rowData = useMemo(() => {
    return sizes.map(size => {
      const row: any = { size };
      colours.forEach(col => {
        row[col] = getQty(size, col);
      });
      return row;
    });
  }, [sizes, colours, matrix]);

  // ── GENERATE COLUMNS DYNAMICALLY ──
  const columns = useMemo(() => {
    const sizeCol = {
      header: "SIZE \\ COLOUR",
      accessor: (item: any) => (
        <span className="text-[10px] font-black text-navy uppercase tracking-widest">{item.size}</span>
      ),
      width: 150,
      pinned: 'left' as const,
      className: 'bg-navy/5'
    };

    const colorCols = colours.map(col => ({
      header: col.toUpperCase(),
      accessor: (item: any) => {
        const qty = item[col] || 0;
        return (
          <input 
            type="number"
            disabled={readOnly}
            value={qty || ''}
            placeholder="0"
            onChange={(e) => handleQtyChange(item.size, col, parseInt(e.target.value) || 0)}
            className={`w-full h-full min-h-[40px] px-3 py-2 text-center text-xs font-mono outline-none transition-all
              ${qty === 0 ? 'text-navy/10 bg-transparent' : 
                qty <= 3 ? 'text-amber-500 bg-amber-500/5 font-black' : 
                'text-emerald-500 bg-emerald-500/5 font-black'}
              focus:bg-brand-gold/10 focus:ring-1 focus:ring-brand-gold
            `}
          />
        );
      },
      width: 100,
      className: 'p-0 text-center border-l border-navy/5'
    }));

    return [sizeCol, ...colorCols];
  }, [colours, readOnly, matrix]);

  return (
    <div className="bg-white rounded-3xl border border-navy/5 shadow-2xl overflow-hidden flex flex-col">
       <div className="h-[400px]">
          <DataTable 
            data={rowData}
            columns={columns}
            singleClickEdit={true}
          />
       </div>
      
      {!readOnly && (
        <div className="p-5 bg-navy text-white/40 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-3">
             <Keyboard size={14} className="text-brand-gold" />
             <span>Enter opening stock per size/colour matrix</span>
          </div>
          <span>Use Arrow Keys / Tab to navigate cells ›</span>
        </div>
      )}
    </div>
  );
};

export default StockMatrix;
