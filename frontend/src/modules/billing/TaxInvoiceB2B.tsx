/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useEffect, useState } from 'react';
import { QrCode, ShieldCheck, Printer } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

interface B2BInvoiceProps {
  bill: any;
  onPrinted: () => void;
}

type CopyType = 'Original for Recipient' | 'Duplicate for Transporter' | 'Triplicate for Supplier';

export default function TaxInvoiceB2B({ bill, onPrinted }: B2BInvoiceProps) {
  const { data: store } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => api.store.getSettings()
  });

  const [copy, setCopy] = useState<CopyType>('Original for Recipient');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (bill && isPrinting) {
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
        onPrinted();
      }, 500);
    }
  }, [bill, isPrinting, onPrinted]);

  if (!bill) return null;

  // Logic to determine if IGST applies (Simplified: if state codes differ)
  const isInterState = bill.store_state_code !== bill.customer_state_code && bill.customer_state_code;

  // HSN-wise Summary Calculation
  const hsnSummary = (bill.items || []).reduce((acc: any, item: any) => {
    const hsn = item.product?.hsn || '6403';
    const taxableAmount = item.qty * (item.unit_price - (item.discount_per ? (item.unit_price * item.discount_per / 100) : 0));
    const taxRate = item.tax_per || 18;
    
    // Reverse calculation from tax-inclusive price (Shoper9 standard)
    const taxableValue = taxableAmount / (1 + taxRate / 100);
    const taxAmt = taxableAmount - taxableValue;
    
    if (!acc[hsn]) {
      acc[hsn] = { hsn, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, taxRate };
    }
    
    acc[hsn].taxableValue += taxableValue;
    if (isInterState) {
      acc[hsn].igst += taxAmt;
    } else {
      acc[hsn].cgst += taxAmt / 2;
      acc[hsn].sgst += taxAmt / 2;
    }
    return acc;
  }, {});

  return (
    <>
      {/* Printer Controls (Only visible on screen) */}
      <div className="fixed top-20 right-8 z-[1000] flex flex-col gap-2 non-print animate-in slide-in-from-right duration-500">
        {(['Original for Recipient', 'Duplicate for Transporter', 'Triplicate for Supplier'] as CopyType[]).map(type => (
          <button 
            key={type}
            onClick={() => { setCopy(type); setIsPrinting(true); }}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all ${copy === type ? 'bg-navy text-gold' : 'bg-white text-navy hover:bg-cream'}`}
          >
            <Printer size={14} /> {type.split(' ')[0]} Copy
          </button>
        ))}
      </div>

      <div className="hidden print:block absolute inset-0 bg-white text-black font-sans p-10 w-[210mm] min-h-[297mm] z-[9999]">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; padding: 0; margin: 0; }
            #app, .non-print { display: none !important; }
          }
        `}} />

        {/* Copy Header */}
        <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-black pb-2 italic">
          {copy}
        </div>

        {/* Main Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{store?.name || 'PrimeSetu Global'}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Institutional Retail OS Node</p>
            <div className="mt-6 space-y-1 text-[11px] leading-relaxed">
              <p className="font-bold">{store?.address || 'Central Sovereign Unit, India'}</p>
              <p><strong>GSTIN:</strong> {store?.gstin || '27AAACP0000A1Z5'} | <strong>State:</strong> {store?.state_code || 'MAHARASHTRA'} (27)</p>
              <p><strong>Email:</strong> {store?.email || 'nodes@primesetu.os'} | <strong>Ph:</strong> {store?.phone || '+91 0000000000'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-black text-white px-10 py-4 text-3xl font-black uppercase tracking-[0.2em]">Tax Invoice</div>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-right">
              <span className="text-[10px] font-black uppercase text-gray-400">Invoice No</span>
              <span className="text-sm font-black">{bill.bill_number}</span>
              <span className="text-[10px] font-black uppercase text-gray-400">Date</span>
              <span className="text-sm font-black">{new Date(bill.created_at).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</span>
              <span className="text-[10px] font-black uppercase text-gray-400">Place of Supply</span>
              <span className="text-sm font-black uppercase">{bill.customer_state || 'DELHI'}</span>
            </div>
          </div>
        </div>

        {/* Parties Section */}
        <div className="grid grid-cols-2 border border-black divide-x divide-black mb-8">
          <div className="p-4">
            <div className="text-[9px] font-black uppercase tracking-widest mb-3 text-gray-400">Billed To (Recipient)</div>
            <div className="text-sm font-black uppercase">{bill.customer_company || bill.customer_name || 'Counter Party'}</div>
            <div className="text-[11px] mt-2 space-y-0.5">
              <p>{bill.customer_address || 'Billing Address Not Provided'}</p>
              <p><strong>GSTIN:</strong> {bill.customer_gstin || 'NOT REGISTERED'}</p>
              <p><strong>State:</strong> {bill.customer_state || 'N/A'} ({bill.customer_state_code || '--'})</p>
            </div>
          </div>
          <div className="p-4">
            <div className="text-[9px] font-black uppercase tracking-widest mb-3 text-gray-400">Shipped To</div>
            <div className="text-sm font-black uppercase">{bill.customer_company || bill.customer_name || 'Counter Party'}</div>
            <div className="text-[11px] mt-2 space-y-0.5">
              <p>{bill.customer_shipping_address || bill.customer_address || 'Same as Billing'}</p>
              <p><strong>GSTIN:</strong> {bill.customer_gstin || 'NOT REGISTERED'}</p>
              <p><strong>State:</strong> {bill.customer_state || 'N/A'} ({bill.customer_state_code || '--'})</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-black mb-6">
          <thead className="bg-gray-100 text-[9px] font-black uppercase tracking-widest text-center border-b border-black">
            <tr>
              <th className="border border-black p-2 w-8">#</th>
              <th className="border border-black p-2 text-left">Product / Description</th>
              <th className="border border-black p-2 w-20">HSN/SAC</th>
              <th className="border border-black p-2 w-10">Qty</th>
              <th className="border border-black p-2 w-24 text-right">Rate</th>
              <th className="border border-black p-2 w-16">Disc %</th>
              <th className="border border-black p-2 w-28 text-right">Taxable Value</th>
              <th className="border border-black p-2 w-28 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-[10px] font-bold">
            {bill.items?.map((item: any, i: number) => {
              const taxableAmount = item.qty * (item.unit_price - (item.discount_per ? (item.unit_price * item.discount_per / 100) : 0));
              const taxableValue = taxableAmount / (1 + (item.tax_per || 18) / 100);
              return (
                <tr key={i} className="border-b border-black/10 h-10">
                  <td className="border border-black p-2 text-center">{i + 1}</td>
                  <td className="border border-black p-2 uppercase">
                    <div className="font-black text-[11px]">{item.product?.name}</div>
                    <div className="text-[8px] opacity-40">Code: {item.product?.code}</div>
                  </td>
                  <td className="border border-black p-2 text-center font-mono">{item.product?.hsn || '6403'}</td>
                  <td className="border border-black p-2 text-center">{item.qty}</td>
                  <td className="border border-black p-2 text-right">{item.unit_price.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{item.discount_per || 0}%</td>
                  <td className="border border-black p-2 text-right font-black">{taxableValue.toFixed(2)}</td>
                  <td className="border border-black p-2 text-right font-black">{taxableAmount.toFixed(2)}</td>
                </tr>
              )
            })}
            {/* Fillers to maintain height */}
            {[...Array(Math.max(0, 12 - (bill.items?.length || 0)))].map((_, i) => (
              <tr key={`f-${i}`} className="h-10 border-b border-black/10">
                <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
                <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 uppercase text-[10px] font-black">
            <tr className="border-t border-black">
              <td colSpan={3} className="border border-black p-3 text-right">Subtotal / Gross Qty</td>
              <td className="border border-black p-3 text-center">{bill.items?.reduce((a:any, i:any) => a + i.qty, 0)}</td>
              <td colSpan={3} className="border border-black p-3 text-right">Invoice Total (Incl. GST)</td>
              <td className="border border-black p-3 text-right text-lg">₹{(bill.total as number).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* GST Breakup Section (HSN Summary) */}
        <div className="grid grid-cols-5 gap-0 border border-black mb-10">
          <div className="col-span-5 bg-gray-100 p-2 text-[9px] font-black uppercase tracking-widest border-b border-black">GST Breakup Summary (HSN/SAC Wise)</div>
          <div className="contents text-[8px] font-black uppercase tracking-tight text-center bg-gray-50">
            <div className="border-b border-r border-black p-2">HSN / SAC</div>
            <div className="border-b border-r border-black p-2">Taxable Value</div>
            <div className="border-b border-r border-black p-2">{isInterState ? 'IGST' : 'CGST'}</div>
            <div className="border-b border-r border-black p-2">{isInterState ? '--' : 'SGST'}</div>
            <div className="border-b border-black p-2">Total Tax</div>
          </div>
          {Object.values(hsnSummary).map((s: any) => (
            <div key={s.hsn} className="contents text-[9px] font-bold text-center">
              <div className="border-b border-r border-black p-2 font-mono">{s.hsn} ({s.taxRate}%)</div>
              <div className="border-b border-r border-black p-2">{s.taxableValue.toFixed(2)}</div>
              <div className="border-b border-r border-black p-2">{isInterState ? s.igst.toFixed(2) : s.cgst.toFixed(2)}</div>
              <div className="border-b border-r border-black p-2">{isInterState ? '0.00' : s.sgst.toFixed(2)}</div>
              <div className="border-b border-black p-2 font-black">{(s.cgst + s.sgst + s.igst).toFixed(2)}</div>
            </div>
          ))}
          <div className="contents text-[10px] font-black bg-gray-50 text-center">
            <div className="border-r border-black p-3">TOTAL</div>
            <div className="border-r border-black p-3">{(Object.values(hsnSummary).reduce((a:any,s:any)=>a+s.taxableValue,0) as number).toFixed(2)}</div>
            <div className="border-r border-black p-3">{(Object.values(hsnSummary).reduce((a:any,s:any)=>a+(isInterState?s.igst:s.cgst),0) as number).toFixed(2)}</div>
            <div className="border-r border-black p-3">{(Object.values(hsnSummary).reduce((a:any,s:any)=>a+(isInterState?0:s.sgst),0) as number).toFixed(2)}</div>
            <div className="p-3 bg-black text-white">{(Object.values(hsnSummary).reduce((a:any,s:any)=>a+s.cgst+s.sgst+s.igst,0) as number).toFixed(2)}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-7 space-y-4">
             <div className="border border-black p-4 bg-gray-50/20">
                <div className="text-[8px] font-black uppercase text-gray-400 mb-1">Amount in Words</div>
                <div className="text-[10px] font-black uppercase italic leading-tight">
                  Rupees {bill.total_words || 'Only'}
                </div>
             </div>
             <div className="text-[8px] font-medium leading-relaxed italic pr-10">
                <p><strong>Declaration:</strong> Certified that all particulars in this invoice are true and correct, and the amount indicated is as per actuals.</p>
                <p className="mt-2 text-navy not-italic font-black uppercase">** DIGITAL SIGNATURE VERIFIED BY PRIMESETU SOVEREIGN NODE **</p>
             </div>
          </div>
          <div className="col-span-5 flex flex-col gap-6">
             <div className="border-2 border-black p-4 flex flex-col items-center justify-center h-28 relative">
                <ShieldCheck size={40} className="absolute opacity-10" />
                <div className="text-[10px] font-black uppercase tracking-widest">{store?.name}</div>
                <div className="mt-6 text-[8px] font-black">(Authorised Signatory)</div>
                <div className="absolute top-2 right-2 flex gap-1">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
             </div>
             <div className="flex items-center gap-4 border border-black p-3">
                <QrCode size={40} strokeWidth={1} />
                <div className="text-[8px] font-bold">
                   <p className="uppercase opacity-50">E-Invoice QR Verification</p>
                   <p className="font-mono mt-1 italic tracking-tighter truncate w-32">{bill.id}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end text-[7px] font-black uppercase text-gray-300 tracking-[0.3em]">
           <span>Institutional Standard X-2026</span>
           <span>Powered by PrimeSetu Sovereign Retail OS · Memory Not Code</span>
        </div>
      </div>
    </>
  );
}
