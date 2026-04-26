/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useEffect } from 'react'

export default function ThermalReceipt({ bill, onPrinted, autoPrint = true }: { bill: any, onPrinted: () => void, autoPrint?: boolean }) {
  useEffect(() => {
    if (bill && autoPrint) {
      setTimeout(() => {
        window.print()
        onPrinted()
      }, 500)
    }
  }, [bill, onPrinted, autoPrint])

  if (!bill) return null

  // A component heavily styled for 80mm ESC/POS Thermal Printers
  return (
    <div className="hidden print:block absolute inset-0 bg-white text-black font-mono text-[12px] w-[80mm] leading-tight p-0 m-0 z-[9999]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { -webkit-print-color-adjust: exact; padding: 2mm; margin: 0; }
          #app, .non-print { display: none !important; }
        }
      `}} />
      
      <div className="text-center mb-4">
        <h2 className="text-lg font-black uppercase mb-1">{bill.store_name || 'PrimeSetu Retail'}</h2>
        <p className="text-[10px]">{bill.store_site || 'Verified Sovereign Node'}</p>
        <p className="text-[10px]">{bill.store_address || 'Sovereign Network PST'}</p>
        <p className="text-[10px]">GSTIN: {bill.store_gstin || '07AABCU9603R1Z2'}</p>
        <p className="text-[10px] mt-1 font-bold">Ph: {bill.store_phone || '+91 0000000000'}</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-2 relative">
        {bill.is_duplicate && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-2 border-black/20 text-black/20 text-[20px] font-black px-4 py-1 z-0 pointer-events-none uppercase">
            Duplicate
          </div>
        )}
        <div className="flex justify-between relative z-10">
          <span>Bill: {bill.bill_number}</span>
          <span>Date: {new Date(bill.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between relative z-10">
          <span>Cashier: {bill.created_by || 'ADMIN'}</span>
          <span>Time: {new Date(bill.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      <table className="w-full text-left mb-2">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1">Item</th>
            <th className="py-1 text-center">Qty</th>
            <th className="py-1 text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {bill.items?.map((item: any, i: number) => {
            const amount = item.qty * item.unit_price * (1 - item.discount_per / 100)
            return (
              <tr key={i}>
                <td className="py-1 break-words pr-2 max-w-[40mm]">
                  {item.product?.name || 'Product'}
                  {item.discount_per > 0 && <div className="text-[9px]">Disc: {item.discount_per}%</div>}
                </td>
                <td className="py-1 text-center align-top">{item.qty}</td>
                <td className="py-1 text-right align-top">{amount.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="border-t border-black pt-2 mb-4">
        <div className="flex justify-between font-bold text-[14px]">
          <span>Net Payable</span>
          <span>Rs. {bill.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] mt-1">
          <span>Total Items</span>
          <span>{bill.items?.reduce((a:any, i:any) => a + i.qty, 0) || 0}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Taxable Value</span>
          <span>Rs. {(bill.items?.reduce((a:any, i:any) => {
            const net = i.unit_price * i.qty * (1 - (i.discount_per||0)/100);
            const rate = (i.tax_per||0)/100;
            return a + (net / (1 + rate));
          }, 0)).toFixed(2)}</span>
        </div>
        {bill.items?.reduce((a:any, i:any) => a + (i.unit_price * i.qty * (i.discount_per||0)/100), 0) > 0 && (
          <div className="bg-black text-white px-2 py-1 mt-2 text-center text-[11px] font-black uppercase tracking-widest">
            *** YOU SAVED RS. {(bill.items?.reduce((a:any, i:any) => a + (i.unit_price * i.qty * (i.discount_per||0)/100), 0)).toFixed(2)} ***
          </div>
        )}
      </div>

      <div className="text-center text-[10px] mt-6 border-t border-black border-dashed pt-2">
        <p className="font-bold">Thank you for visiting!</p>
        <p className="mt-1">Exchange within 14 days.</p>
        <p>No refund on sale items.</p>
        <p className="mt-4 font-black">*** POWERED BY PRIMESETU ***</p>
      </div>
    </div>
  )
}
