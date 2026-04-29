/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React from 'react';

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

  return (
    <div className="overflow-x-auto bg-bg-elevated rounded-2xl border border-border shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-brand-navy text-white text-[10px] font-black uppercase tracking-widest">
            <th className="px-4 py-3 text-left border-r border-border/10">Size \ Colour</th>
            {colours.map(col => (
              <th key={col} className="px-4 py-3 text-center border-r border-border/10">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sizes.map(size => (
            <tr key={size} className="border-b border-border transition-colors hover:bg-brand-gold/5">
              <td className="px-4 py-3 text-[10px] font-black text-text-primary uppercase bg-bg-float border-r border-border">
                {size}
              </td>
              {colours.map(col => {
                const qty = getQty(size, col);
                return (
                  <td key={`${size}-${col}`} className="p-0 border-r border-border">
                    <input 
                      type="number"
                      disabled={readOnly}
                      value={qty || ''}
                      placeholder="0"
                      onChange={(e) => handleQtyChange(size, col, parseInt(e.target.value) || 0)}
                      className={`w-full h-full min-h-[40px] px-3 py-2 text-center text-xs font-mono outline-none transition-all text-text-primary
                        ${qty === 0 ? 'text-text-secondary/20 bg-transparent' : 
                          qty <= 3 ? 'text-amber-500 bg-amber-500/10 font-black' : 
                          'text-emerald-500 bg-emerald-500/10 font-black'}
                        focus:bg-bg-input focus:ring-2 focus:ring-brand-gold focus:z-10
                      `}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {!readOnly && (
        <div className="p-3 bg-bg-float border-t border-border flex items-center justify-between text-[10px] font-bold text-text-secondary/40 uppercase tracking-wider">
          <span>Enter opening stock per size/colour</span>
          <span>Tab to move cell ›</span>
        </div>
      )}
    </div>
  );
};

export default StockMatrix;
