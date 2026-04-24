/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Users, 
  Truck, 
  UserSquare2, 
  Layers, 
  Zap,
  ArrowRight,
  Filter,
  MoreVertical,
  Plus,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';

type RegistryType = 'ITEMS' | 'CUSTOMERS' | 'VENDORS' | 'PERSONNEL' | 'SYSTEM';

interface RegistryEntity {
  id: string;
  name: string;
  code?: string;
  mobile?: string;
  category?: string;
  stock?: number;
  price?: number;
  velocity?: string;
  points?: number;
  status?: string;
  pending_po?: number;
  terms?: string;
  target?: string;
  achieved?: string;
  values?: string;
}

interface MatrixData {
  insights: Array<{ label: string; value: string; trend: 'up' | 'down' | 'stable' | 'none' }>;
  associations: Array<{ label: string; value: string }>;
}

const MasterRegistry: React.FC = () => {
  const [activeRegistry, setActiveRegistry] = useState<RegistryType>('ITEMS');
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<RegistryEntity | null>(null);
  const [matrix, setMatrix] = useState<MatrixData | null>(null);

  useEffect(() => {
    fetchItems();
  }, [activeRegistry]);

  const fetchItems = async () => {
    if (activeRegistry !== 'ITEMS') return;
    setLoading(true);
    try {
      const data = await api.inventory.list();
      setItems(data);
    } catch (error) {
      console.error('[PrimeSetu] Registry fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!selectedEntity || activeRegistry !== 'ITEMS') return;
      
      try {
        const pred = await api.inventory.getStockPrediction(selectedEntity.id);
        setMatrix({
          insights: [
            { label: 'Days of Cover', value: `${pred.days_of_cover} Days`, trend: pred.status === 'CRITICAL' ? 'down' : 'stable' },
            { label: 'Avg Daily Sales', value: `${pred.avg_daily_sales} Pcs`, trend: 'none' }
          ],
          associations: [
            { label: 'Suggested Reorder', value: `${pred.suggested_reorder} Units` },
            { label: 'Current Inventory', value: `${pred.current_stock} Units` },
            { label: 'Forecast Status', value: pred.status }
          ]
        });
      } catch (error) {
        // Fallback for demo
        setMatrix({
          insights: [
            { label: 'Days of Cover', value: '14.2 Days', trend: 'stable' },
            { label: 'Avg Daily Sales', value: '4.2 Pcs', trend: 'none' }
          ],
          associations: [
            { label: 'Suggested Reorder', value: '140 Units' },
            { label: 'Current Inventory', value: '132 Units' },
            { label: 'Forecast Status', value: 'HEALTHY' }
          ]
        });
      }
    };

    if (selectedEntity && activeRegistry === 'CUSTOMERS') {
      setMatrix({
        insights: [
          { label: 'Purchase Frequency', value: '82%', trend: 'up' },
          { label: 'Confidence Score', value: '98%', trend: 'stable' }
        ],
        associations: [
          { label: 'Preferred Category', value: 'Footwear' },
          { label: 'Brand Affinity', value: 'Nike' },
          { label: 'Last Visited', value: '2 days ago' }
        ]
      });
    } else if (selectedEntity && activeRegistry === 'ITEMS') {
      fetchPrediction();
    } else {
      setMatrix(null);
    }
  }, [selectedEntity, activeRegistry]);

  const registries = [
    { id: 'ITEMS', icon: Package, label: 'Items & Matrix', count: 1240 },
    { id: 'CUSTOMERS', icon: Users, label: 'Customer Base', count: 8420 },
    { id: 'VENDORS', icon: Truck, label: 'Vendor Network', count: 124 },
    { id: 'PERSONNEL', icon: UserSquare2, label: 'Sales Personnel', count: 42 },
    { id: 'SYSTEM', icon: Layers, label: 'System Lookups', count: 15 },
  ];

  // Dummy data for other registries
  const displayData = {
    ITEMS: items.length > 0 ? items : [
      { id: '1', code: 'NEX-SH-001', name: 'Puma RS-X Gradient', stock: 132, price: 7999, velocity: 'High' },
      { id: '2', code: 'NEX-SH-042', name: 'Nike Air Max 270', stock: 54, price: 12999, velocity: 'Medium' },
    ],
    CUSTOMERS: [
      { id: 'c1', name: 'Amit Sharma', mobile: '9845012345', points: 1240, status: 'Elite' },
      { id: 'c2', name: 'Priya Verma', mobile: '9123456789', points: 450, status: 'Regular' },
    ],
    VENDORS: [
      { id: 'v1', name: 'Puma India', code: 'VEN-001', pending_po: 3, terms: 'Net-30' },
    ],
    PERSONNEL: [
      { id: 's1', name: 'Rajesh Kumar', code: 'SP-01', target: '₹2.5L', achieved: '₹1.8L' },
    ],
    SYSTEM: [
      { id: 'l1', name: 'Size Group: Footwear (UK)', category: 'Sizes', values: '6, 7, 8, 9, 10, 11' },
      { id: 'l2', name: 'Tax: GST 18%', category: 'Tax', values: 'SGST 9%, CGST 9%' },
    ]
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Smart Command Header */}
      <div className="glass p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-serif font-black text-navy">Master Registry</h1>
            <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-1">Unified Sovereign Catalogue Engine</p>
          </div>
          
          <div className="flex-1 max-w-2xl w-full relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50" />
            <input 
              type="text" 
              placeholder={`Search ${activeRegistry.toLowerCase()} or use commands (e.g. "new item", "tax config")...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-cream/30 border border-border/50 rounded-2xl pl-16 pr-6 py-5 text-sm font-bold focus:border-gold focus:bg-white outline-none transition-all shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              <kbd className="px-2 py-1 bg-navy/5 rounded-md text-[10px] font-black text-navy/40">CTRL</kbd>
              <kbd className="px-2 py-1 bg-navy/5 rounded-md text-[10px] font-black text-navy/40">K</kbd>
            </div>
          </div>

          <button className="bg-navy text-white px-8 py-5 rounded-2xl font-black text-xs tracking-widest hover:bg-navy/90 transition-all shadow-xl flex items-center gap-3">
            <Plus className="w-4 h-4 text-gold" />
            ADD NEW
          </button>
        </div>
      </div>

      <div className="flex gap-8 h-[calc(100vh-280px)]">
        {/* Registry Sidebar */}
        <aside className="w-72 flex flex-col gap-3">
          {registries.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setActiveRegistry(reg.id as RegistryType)}
              className={`p-6 rounded-[2rem] flex flex-col gap-4 transition-all duration-500 text-left border ${
                activeRegistry === reg.id 
                ? 'bg-navy text-white shadow-2xl shadow-navy/20 border-navy' 
                : 'bg-white border-border/50 hover:border-gold/50 group'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${activeRegistry === reg.id ? 'bg-gold/10' : 'bg-cream'}`}>
                  <reg.icon className={`w-6 h-6 ${activeRegistry === reg.id ? 'text-gold' : 'text-navy group-hover:text-gold transition-colors'}`} />
                </div>
                <span className={`text-[10px] font-black tracking-widest ${activeRegistry === reg.id ? 'text-gold' : 'text-muted'}`}>
                  {reg.count}
                </span>
              </div>
              <div>
                <h3 className="font-serif font-black text-lg">{reg.label}</h3>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${activeRegistry === reg.id ? 'text-white/40' : 'text-muted'}`}>
                  Manage Registry Data
                </p>
              </div>
            </button>
          ))}

          <div className="mt-auto glass p-6 rounded-[2rem] bg-gold/5 border-gold/10">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-4 h-4 text-gold fill-gold" />
              <span className="text-[10px] font-black text-navy uppercase tracking-widest">AI Audit</span>
            </div>
            <p className="text-[10px] text-navy/60 font-medium leading-relaxed">
              Detected 12 duplicate customers and 4 missing HSN codes.
            </p>
            <button className="mt-4 text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              Clean Registry <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* Registry Content Area */}
        <main className="flex-1 glass rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-navy px-10 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
              <h2 className="text-white font-serif font-black text-xl">{registries.find(r => r.id === activeRegistry)?.label}</h2>
            </div>
            <div className="flex gap-4">
              <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-white/60 transition-all">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-white/60 transition-all">
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2">
            <table className="w-full">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-md text-[10px] uppercase font-black tracking-widest text-muted border-b border-border/50 z-10">
                <tr>
                  <th className="pl-10 py-6 text-left">Code / Identifier</th>
                  <th className="px-6 py-6 text-left">Name / Description</th>
                  <th className="px-6 py-6 text-right">Primary Attribute</th>
                  <th className="px-6 py-6 text-center">Status</th>
                  <th className="pr-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {displayData[activeRegistry].map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedEntity(item as RegistryEntity)}
                    className={`group cursor-pointer transition-all ${selectedEntity?.id === item.id ? 'bg-gold/5' : 'hover:bg-cream/30'}`}
                  >
                    <td className="pl-10 py-8">
                      <span className="text-[10px] font-black text-muted uppercase tracking-tighter bg-cream px-3 py-1.5 rounded-lg">
                        {item.code || item.mobile || item.category}
                      </span>
                    </td>
                    <td className="px-6 py-8">
                      <div className="font-black text-navy text-lg group-hover:text-gold transition-colors">{item.name}</div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Updated 2 days ago</div>
                    </td>
                    <td className="px-6 py-8 text-right">
                      <div className="font-black text-navy">
                        {item.price ? `₹${item.price}` : item.points ? `${item.points} Pts` : item.values || item.achieved}
                      </div>
                      <div className="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">
                        {item.stock ? `Stock: ${item.stock}` : item.status ? `Tier: ${item.status}` : 'Current Value'}
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.velocity === 'High' || item.status === 'Elite' ? 'bg-emerald-50 text-emerald-600' : 'bg-gold/10 text-gold'
                      }`}>
                        {item.velocity || item.status || item.terms || 'Active'}
                      </span>
                    </td>
                    <td className="pr-10 py-8 text-right">
                      <button className="p-2 rounded-lg hover:bg-navy/5 text-muted opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Smart Relationship Matrix */}
        <AnimatePresence>
          {selectedEntity && (
            <motion.aside 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-96 glass rounded-[3rem] shadow-2xl p-8 border-l border-gold/10 bg-white/80"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-navy rounded-2xl">
                  <Zap className="w-6 h-6 text-gold" />
                </div>
                <button 
                  onClick={() => setSelectedEntity(null)}
                  className="text-[10px] font-black text-muted uppercase tracking-widest hover:text-navy transition-colors"
                >
                  Close
                </button>
              </div>

              <h2 className="text-2xl font-serif font-black text-navy mb-1">{selectedEntity.name}</h2>
              <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-10">Relationship Matrix</p>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Key Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrix?.insights.map((insight: any, i: number) => (
                      <div key={i} className="bg-cream p-4 rounded-2xl border border-border/50">
                        <div className="text-xs font-black text-navy mb-1">{insight.value}</div>
                        <div className="text-[9px] text-muted font-bold uppercase">{insight.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Associations</h3>
                  <div className="space-y-3">
                    {matrix?.associations.map((assoc: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-navy group-hover:text-gold transition-colors">{assoc.label}</div>
                          <div className="text-[9px] text-muted">{assoc.value}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <button className="w-full bg-navy text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-navy/90 transition-all flex items-center justify-center gap-3">
                    VIEW FULL PROFILE
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MasterRegistry;
