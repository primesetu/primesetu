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
import { QrCode, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export default function TaxInvoiceA4({ bill, onPrinted }: { bill: any, onPrinted: () => void }) {
  const { data: store } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => api.store.getSettings()
  });

  useEffect(() => {
    if (bill) {
      setTimeout(() => {
        window.print();
        onPrinted();
      }, 500);
    }
  }, [bill, onPrinted]);

  if (!bill) return null;

  // HSN-wise Summary Calculation
  const hsnSummary = (bill.items || []).reduce((acc: any, item: any) => {
    const hsn = item.product?.hsn || '6403';
    const taxable = item.qty * item.unit_price * (1 - item.discount_per / 100);
    const taxAmt = taxable - (taxable / (1 + item.tax_per / 100));
    
    if (!acc[hsn]) {
      acc[hsn] = { hsn, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    }
    acc[hsn].taxable += taxable - taxAmt;
    acc[hsn].cgst += taxAmt / 2;
    acc[hsn].sgst += taxAmt / 2;
    acc[hsn].totalTax += taxAmt;
    return acc;
  }, {});

  return (
    <div className="hidden print:block absolute inset-0 bg-white text-black font-sans p-8 w-[210mm] min-h-[297mm] z-[9999]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; padding: 0; margin: 0; }
          #app, .non-print { display: none !important; }
        }
      `}} />

      {/* Corporate Header */}
      <div className="flex justify-between border-b-2 border-black pb-6 mb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">{store?.name || 'PrimeSetu Retail'}</h1>
          <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Premium Retail Sovereign Unit</p>
          <div className="mt-4 space-y-0.5 text-xs">
            <p>{store?.address || 'Sovereign Node, India'}</p>
            <p><strong>GSTIN:</strong> {store?.gstin || 'N/A'} | <strong>Ph:</strong> {store?.phone || 'N/A'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-black text-white px-8 py-3 text-2xl font-black uppercase tracking-[0.3em] inline-block">Tax Invoice</div>
          <div className="flex items-center gap-4 mt-2">
             <div className="text-right">
                <div className="text-[10px] font-black uppercase text-gray-400">Invoice Reference</div>
                <div className="text-sm font-black">{bill.bill_number}</div>
                <div className="text-[10px] font-bold">{new Date(bill.created_at).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>
             </div>
             <div className="w-16 h-16 border-2 border-black p-1 flex items-center justify-center">
                <QrCode size={54} strokeWidth={1.5} />
             </div>
          </div>
        </div>
      </div>

      {/* Customer & Party Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
         <div className="border border-black p-4 bg-gray-50/30">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-gray-400 border-b border-black/10 pb-1">Billed To / Recipient</div>
            <div className="text-sm font-black uppercase">{bill.customer_name || 'Walk-in Customer'}</div>
            <div className="text-xs font-bold mt-1 text-gray-600">Mobile: {bill.customer_mobile || 'Not Provided'}</div>
            <div className="text-xs mt-2 italic">{bill.customer_address || 'Counter Sale Transaction'}</div>
         </div>
         <div className="grid grid-cols-2 border border-black divide-x divide-black">
            <div className="p-4">
               <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-gray-400">Place of Supply</div>
               <div className="text-xs font-black">DELHI (07)</div>
            </div>
            <div className="p-4">
               <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-gray-400">Payment Mode</div>
               <div className="text-xs font-black uppercase">{bill.payments?.[0]?.mode || 'CASH'}</div>
            </div>
         </div>
      </div>

      {/* Line Items */}
      <table className="w-full border-collapse border border-black mb-4">
        <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest text-center">
          <tr>
            <th className="border border-black p-2 w-10">#</th>
            <th className="border border-black p-2 text-left">Description of Goods</th>
            <th className="border border-black p-2 w-20">HSN</th>
            <th className="border border-black p-2 w-12">Qty</th>
            <th className="border border-black p-2 w-24 text-right">Rate</th>
            <th className="border border-black p-2 w-16">Disc%</th>
            <th className="border border-black p-2 w-16">GST%</th>
            <th className="border border-black p-2 w-28 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-xs font-bold">
          {bill.items?.map((item: any, i: number) => {
            const amount = item.qty * item.unit_price * (1 - item.discount_per / 100)
            return (
              <tr key={i}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">
                   <div className="font-black">{item.product?.name || 'Retail Product'}</div>
                   <div className="text-[8px] opacity-50 font-mono tracking-widest">{item.product?.code} | SIZE: {item.size || 'N/A'}</div>
                </td>
                <td className="border border-black p-2 text-center font-mono">{item.product?.hsn || '6403'}</td>
                <td className="border border-black p-2 text-center font-black">{item.qty}</td>
                <td className="border border-black p-2 text-right">{item.unit_price.toLocaleString()}</td>
                <td className="border border-black p-2 text-center">{item.discount_per}%</td>
                <td className="border border-black p-2 text-center">{item.tax_per}%</td>
                <td className="border border-black p-2 text-right font-black">{amount.toLocaleString()}</td>
              </tr>
            )
          })}
          {/* Fillers */}
          {[...Array(Math.max(0, 10 - (bill.items?.length || 0)))].map((_, i) => (
            <tr key={`f-${i}`} className="h-8">
              <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
              <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 text-[11px] font-black uppercase">
           <tr className="border-t-2 border-black">
              <td colSpan={3} className="border border-black p-3 text-right">Grand Total (Incl Tax)</td>
              <td className="border border-black p-3 text-center">{bill.items?.reduce((a:any,i:any)=>a+i.qty,0)}</td>
              <td colSpan={3} className="border border-black p-3"></td>
              <td className="border border-black p-3 text-right text-lg">₹{bill.total.toLocaleString()}</td>
           </tr>
        </tfoot>
      </table>

      {/* HSN Wise Summary (Mandatory for Compliance) */}
      <div className="mb-8">
         <div className="text-[9px] font-black uppercase tracking-widest mb-2">HSN / SAC Tax Summary</div>
         <table className="w-full border-collapse border border-black text-[9px] font-bold text-center">
            <thead className="bg-gray-50 uppercase">
               <tr>
                  <th className="border border-black p-1">HSN/SAC</th>
                  <th className="border border-black p-1">Taxable Value</th>
                  <th className="border border-black p-1">CGST</th>
                  <th className="border border-black p-1">SGST</th>
                  <th className="border border-black p-1">Total Tax</th>
               </tr>
            </thead>
            <tbody>
               {Object.values(hsnSummary).map((s: any) => (
                 <tr key={s.hsn}>
                    <td className="border border-black p-1">{s.hsn}</td>
                    <td className="border border-black p-1">₹{s.taxable.toLocaleString()}</td>
                    <td className="border border-black p-1">₹{s.cgst.toLocaleString()}</td>
                    <td className="border border-black p-1">₹{s.sgst.toLocaleString()}</td>
                    <td className="border border-black p-1 font-black">₹{s.totalTax.toLocaleString()}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Footer & Terms */}
      <div className="grid grid-cols-2 gap-10">
         <div className="space-y-4">
            <div className="border border-black p-4 bg-gray-50/30">
               <div className="text-[9px] font-black uppercase mb-1 opacity-50">Total Amount in Words</div>
               <div className="text-xs font-black uppercase italic underline leading-tight">
                  Rupees {(() => {
                    const numberToWords = (numIn: number) => {
                      const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
                      const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
                      const numStr = numIn.toString();
                      if (numStr.length > 9) return 'overflow';
                      let n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                      if (!n) return ''; 
                      let str = '';
                      str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
                      str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
                      str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
                      str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
                      str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Only ' : 'Only';
                      return str;
                    }
                    return numberToWords(Math.floor(bill.total))
                  })()}
               </div>
            </div>
            <div className="border border-black p-4">
               <div className="text-[9px] font-black uppercase mb-1 opacity-50">Bank Details</div>
               <div className="text-[10px] font-bold">
                  <p>Bank Name: HDFC BANK LTD</p>
                  <p>A/c No: 50200012345678 | IFSC: HDFC0001234</p>
                  <p>Branch: Connaught Place, New Delhi</p>
               </div>
            </div>
         </div>
         <div className="space-y-4">
            <div className="text-[9px] font-medium leading-relaxed italic opacity-70">
               <p><strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
               <p className="mt-2"><strong>Terms:</strong> 1. Goods once sold will not be taken back. 2. Interest @ 18% p.a. will be charged if payment is not made within 30 days.</p>
            </div>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 h-32 relative group">
                <ShieldCheck className="text-gray-100 group-hover:text-emerald-500/20 transition-all absolute" size={60} />
                <div className="text-[10px] font-black uppercase tracking-widest text-navy relative z-10">{store?.name || 'PrimeSetu Retail'}</div>
                <div className="mt-8 text-[9px] font-bold opacity-60 relative z-10">(Authorised Signatory)</div>
                <div className="absolute bottom-2 right-2 text-[8px] font-mono opacity-20">PrimeSetu Digitally Signed</div>
            </div>
         </div>
      </div>

      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end border-t border-gray-100 pt-4">
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Institutional Retail Protocol X-2026</div>
        <div className="text-[8px] font-bold text-gray-300">Generated via PrimeSetu Sovereign Node · No Internet Reconciliation Required</div>
      </div>
    </div>
  );
}
