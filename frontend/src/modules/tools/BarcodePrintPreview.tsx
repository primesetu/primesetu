import React, { useRef } from 'react';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { Printer, X } from 'lucide-react';

interface BarcodePrintPreviewProps {
  template: any; // The JSON template from BarcodeDesigner
  items: any[]; // Array of ItemMaster objects
  copiesPerItem?: number;
  onClose: () => void;
}

export default function BarcodePrintPreview({ template, items, copiesPerItem = 1, onClose }: BarcodePrintPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Barcode_Labels_${new Date().getTime()}`,
  });

  if (!template) return null;

  // Generate an array of items based on copies
  const printItems = [];
  for (const item of items) {
    for (let i = 0; i < copiesPerItem; i++) {
      printItems.push(item);
    }
  }

  // Calculate layout parameters. 
  // Assuming standard A4 size (210x297mm) and sticker sheets.
  // The layout engine assumes continuous flow of labels if printer_type is STANDARD.
  // For standard thermal printers, it's just a single column roll.
  const isThermal = template.printer_type === 'THERMAL';
  
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 text-white font-sans">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Print Engine Preview</h2>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">{template.name} ({template.printer_type})</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Printer size={16} /> Print {printItems.length} Labels
          </button>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto p-10 flex justify-center items-start bg-zinc-900">
        <div 
          className="bg-white text-black shadow-2xl relative print-container"
          ref={componentRef}
          style={isThermal ? {
            width: `${template.width_mm}mm`,
            // Thermal paper is continuous, height is defined per label
          } : {
            width: '210mm', // A4
            minHeight: '297mm', // A4
            padding: '5mm',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            gap: '2mm'
          }}
        >
          {printItems.map((item, index) => (
            <div 
              key={index}
              className="relative overflow-hidden"
              style={{
                width: `${template.width_mm}mm`,
                height: `${template.height_mm}mm`,
                border: isThermal ? 'none' : '1px dashed #ccc', // Optional cut lines for A4 sheets
                pageBreakInside: 'avoid',
                marginBottom: isThermal ? '2mm' : '0'
              }}
            >
              {template.layout_json.map((node: any, nIdx: number) => {
                const value = node.dataField ? (item[node.dataField] ?? '') : (node.content ?? '');
                
                if (node.type === 'text') {
                  return (
                    <div 
                      key={nIdx}
                      className="absolute font-sans leading-none whitespace-nowrap overflow-hidden"
                      style={{
                        left: `${node.x}mm`,
                        top: `${node.y}mm`,
                        fontSize: `${node.fontSize}px`, // Map px to pt roughly
                        fontWeight: 'bold',
                      }}
                    >
                      {value}
                    </div>
                  );
                }
                
                if (node.type === 'barcode') {
                  // Some symbologies like Code39 need uppercase
                  const bVal = node.symbology === 'code39' ? String(value).toUpperCase() : String(value);
                  return (
                    <div 
                      key={nIdx}
                      className="absolute flex flex-col items-center justify-center"
                      style={{
                        left: `${node.x}mm`,
                        top: `${node.y}mm`,
                      }}
                    >
                      <Barcode 
                        value={bVal || '1234567890'} 
                        format={node.symbology === 'code128' ? 'CODE128' : 'CODE39'} // basic mapping
                        width={1.2} 
                        height={30} 
                        displayValue={true} 
                        fontSize={10} 
                        margin={0}
                        background="transparent"
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Print Styles injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
          @page {
            size: ${isThermal ? `${template.width_mm}mm ${template.height_mm}mm` : 'A4'};
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
