/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { MapPin, Box, ArrowRightLeft, Loader2, AlertCircle } from 'lucide-react';

interface NetworkStock {
  store_name: string;
  store_code: string;
  on_hand: number;
  doc: number;
  tier: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  distance_km: number;
}

interface Props {
  sku: string;
  onClose: () => void;
}

export const NetworkInventoryDialog: React.FC<Props> = ({ sku, onClose }) => {
  const [data, setData] = useState<NetworkStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    api.inventory.getNetworkStock(sku)
      .then(setData)
      .finally(() => setLoading(false));
  }, [sku]);

  const handleRequestIST = async (storeCode: string, qty: number) => {
    setRequestingId(storeCode);
    try {
      await api.inventory.createISTRequest({
        sku,
        from_store_id: storeCode,
        qty: Math.min(qty, 5) // Requesting a small chunk for demo
      });
      alert(`IST Request sent to ${storeCode}`);
      onClose();
    } catch (err) {
      alert('Failed to send IST request');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-surface-container p-4 border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 text-primary">
              <Box size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Network Inventory Lookup</h3>
              <p className="text-[10px] font-mono text-outline uppercase">SKU: {sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">✕</button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs font-mono text-outline uppercase tracking-widest">Querying Sister Nodes via HQ...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {data.map((item) => (
                  <div key={item.store_code} className="bg-surface-container-low border border-outline-variant p-4 flex items-center justify-between group hover:border-primary transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-outline group-hover:text-primary">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold">{item.store_name}</h4>
                          <span className="text-[10px] font-mono bg-outline-variant px-1.5 py-0.5 rounded uppercase">
                            {item.store_code}
                          </span>
                        </div>
                        <p className="text-xs text-outline font-mono mt-0.5">
                          {item.distance_km.toFixed(1)} km away
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-outline uppercase">Stock On Hand</p>
                        <p className="text-lg font-mono font-black">{item.on_hand}</p>
                      </div>
                      
                      <div className="text-right w-24">
                        <p className="text-[10px] font-bold text-outline uppercase">Forecast (DoC)</p>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 ${
                          item.tier === 'HEALTHY' ? 'text-green-600' : 
                          item.tier === 'WARNING' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {item.doc} Days
                        </span>
                      </div>

                      {item.tier === 'HEALTHY' && item.on_hand > 5 ? (
                        <button 
                          disabled={requestingId === item.store_code}
                          onClick={() => handleRequestIST(item.store_code, item.on_hand)}
                          className="bg-primary text-on-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                        >
                          {requestingId === item.store_code ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                          {requestingId === item.store_code ? 'Sending...' : 'Request IST'}
                        </button>
                      ) : (
                        <div className="w-[100px] flex justify-center text-outline/30">
                          <AlertCircle size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface-container-high p-4 flex justify-between items-center">
          <p className="text-[10px] text-outline font-mono italic">
            * Data accuracy depends on last pulse from remote nodes.
          </p>
          <button onClick={onClose} className="border border-outline px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
