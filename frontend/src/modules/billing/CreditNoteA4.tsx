/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useEffect } from 'react';

export default function CreditNoteA4({ bill, onPrinted }: { bill: any, onPrinted: () => void }) {
  useEffect(() => {
    if (bill) {
      setTimeout(() => {
        window.print();
        onPrinted();
      }, 500);
    }
  }, [bill, onPrinted]);

  if (!bill) return null;

  return (
    <div className="hidden print:block absolute inset-0 bg-white text-black font-sans p-8 w-[210mm] min-h-[297mm] z-[9999]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; padding: 0; margin: 0; }
          #app, .non-print { display: none !important; }
        }
      `}} />

      {/* Header */}
      <div className="flex justify-between border-b-2 border-black pb-6 mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tight">{bill.store_name || 'PrimeSetu Retail'}</h1>
          <p className="text-xs font-bold uppercase text-rose-600">Credit Note (Sales Return)</p>
          <p className="text-xs">{bill.store_address || 'Sovereign Node, India'}</p>
          <p className="text-xs">GSTIN: {bill.store_gstin || 'N/A'} | Ph: {bill.store_phone || 'N/A'}</p>
        </div>
        <div className="text-right">
          <div className="bg-rose-600 text-white px-6 py-2 text-xl font-black uppercase tracking-widest mb-4 inline-block">Credit Note</div>
          <div className="text-sm">
            <div className="flex justify-between gap-4"><strong>Note No:</strong> <span>CN-{bill.bill_number}</span></div>
            <div className="flex justify-between gap-4"><strong>Date:</strong> <span>{new Date().toLocaleDateString()}</span></div>
            <div className="flex justify-between gap-4"><strong>Orig Invoice:</strong> <span>{bill.original_bill_no || bill.bill_number}</span></div>
          </div>
        </div>
      </div>

      {/* Return Context */}
      <div className="border border-black p-4 mb-8 bg-rose-50/50">
        <div className="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-black/10 pb-1 text-rose-400">Return Details</div>
        <div className="grid grid-cols-2 text-xs">
           <div><strong>Customer:</strong> {bill.customer_mobile || 'Walk-in Customer'}</div>
           <div className="text-right"><strong>Reason:</strong> {bill.return_reason || 'Size Mismatch / Quality Issue'}</div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-black mb-8">
        <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest">
          <tr>
            <th className="border border-black p-2 text-center w-12">#</th>
            <th className="border border-black p-2 text-left">Article Returned</th>
            <th className="border border-black p-2 text-center w-16">Qty</th>
            <th className="border border-black p-2 text-right w-24">Orig Rate</th>
            <th className="border border-black p-2 text-right w-32">Return Value</th>
          </tr>
        </thead>
        <tbody className="text-xs font-bold">
          {bill.items?.map((item: any, i: number) => {
            const amount = item.qty * item.unit_price * (1 - item.discount_per / 100)
            return (
              <tr key={i}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">
                   <div className="font-black text-rose-700">{item.product?.name || 'Retail Item'}</div>
                   <div className="text-[9px] opacity-60">Article: {item.product?.code || 'P-001'}</div>
                </td>
                <td className="border border-black p-2 text-center font-black">-{item.qty}</td>
                <td className="border border-black p-2 text-right">{item.unit_price.toLocaleString()}</td>
                <td className="border border-black p-2 text-right font-black">₹{amount.toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-gray-50 text-sm font-black uppercase tracking-widest">
           <tr>
              <td colSpan={4} className="border border-black p-3 text-right">Refundable Amount (Credit)</td>
              <td className="border border-black p-3 text-right text-lg text-rose-600 italic">₹{bill.total.toLocaleString()}</td>
           </tr>
        </tfoot>
      </table>

      {/* Verification & Signature */}
      <div className="grid grid-cols-2 gap-10 mt-20">
         <div className="space-y-4">
            <div className="text-[10px] font-black uppercase mb-1">Important Notice</div>
            <p className="text-[9px] leading-tight">This Credit Note is issued against the return of goods described above. This value can be adjusted against future purchases only. No cash refunds will be provided.</p>
            <div className="mt-8 pt-4 border-t border-black/10">
               <div className="text-[9px] font-bold">Customer Signature</div>
            </div>
         </div>
         <div className="text-center">
            <div className="h-32 border border-black flex flex-col justify-between p-4">
                <div className="text-[10px] font-black uppercase tracking-widest">For CITYWALK SHOES</div>
                <div className="text-[10px] font-black italic underline">Approved for Adjustment</div>
                <div className="text-[9px] font-bold">(Authorised Store Manager)</div>
            </div>
         </div>
      </div>

      <div className="absolute bottom-8 left-8 right-8 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-4 font-mono italic">
        Sovereign Retail OS · Credit Adjustment Protocol · Powered by PrimeSetu
      </div>
    </div>
  );
}
