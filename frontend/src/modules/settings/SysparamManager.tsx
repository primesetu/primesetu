import React, { useState, useEffect } from 'react';
import { apiClient as api } from '@/api/client';
import { Card, Text, Badge, Button, Input, Select, Switch as Toggle, Label } from '@/components/ui/SovereignUI';
import { Settings2, Save, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Category {
  category: string;
  catdescr: string;
}

interface LookupOption {
  code: string;
  descr: string;
}

interface Parameter {
  paramcode: string;
  descr: string;
  opt: string;
  value: any;
  fixed: string;
  valuelist: number;
  lookup_options: LookupOption[];
}

export const SysparamManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ITEM');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchParameters(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/legacy-sysparam/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !selectedCategory) {
        setSelectedCategory(res.data[0].category);
      }
    } catch (e: any) {
      toast.error('Failed to load categories');
    }
  };

  const fetchParameters = async (cat: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/legacy-sysparam/parameters/${cat}`);
      setParameters(res.data);
    } catch (e: any) {
      toast.error('Failed to load parameters');
    } finally {
      setLoading(false);
    }
  };

  const updateParameter = async (paramcode: string, newValue: any) => {
    setSaving(paramcode);
    try {
      await api.patch(`/legacy-sysparam/parameters/${paramcode}`, { value: newValue });
      toast.success('Parameter updated successfully');
      setParameters(prev => prev.map(p => p.paramcode === paramcode ? { ...p, value: newValue } : p));
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Update failed');
      // Revert optimism if needed by refetching, but let's just refetch entirely
      fetchParameters(selectedCategory);
    } finally {
      setSaving(null);
    }
  };

  const filteredParams = parameters.filter(p => 
    p.descr.toLowerCase().includes(search.toLowerCase()) || 
    p.paramcode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-bg-base text-text-primary p-6 gap-6">
      
      {/* Sidebar: Categories */}
      <Card className="w-80 flex flex-col overflow-hidden bg-bg-elevated/40 border-border-subtle shadow-xl">
        <div className="p-6 border-b border-border-subtle bg-bg-float/20">
          <div className="flex items-center gap-3 text-accent mb-2">
            <Settings2 size={24} />
            <Text variant="h3">Sysparam Matrix</Text>
          </div>
          <Text variant="xs" className="text-text-tertiary">SMRITI Core Configuration Engine</Text>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex flex-col gap-1
                ${selectedCategory === cat.category 
                  ? 'bg-accent/10 border border-accent/20 text-accent shadow-[inset_4px_0_0_0_#38bdf8]' 
                  : 'text-text-secondary hover:bg-bg-float hover:text-text-primary'}`}
            >
              <span className="font-bold tracking-widest text-[11px] uppercase">{cat.category}</span>
              <span className="text-xs opacity-70 truncate">{cat.catdescr || 'System Parameters'}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content: Parameters */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-bg-elevated/20 border-border-subtle shadow-2xl relative">
        <div className="p-6 border-b border-border-subtle bg-bg-float/40 flex justify-between items-center z-10 backdrop-blur-md">
          <div>
            <Text variant="h2" className="text-text-primary">{selectedCategory} Configuration</Text>
            <Text variant="sm" className="text-text-tertiary mt-1">Live mapping to s9.sysparam (Audit-bypassed)</Text>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
              <Input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search parameters..." 
                className="pl-10 h-10 bg-bg-base border-border-subtle"
              />
            </div>
            <Button onClick={() => fetchParameters(selectedCategory)} variant="sec" className="h-10 px-4">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-transparent to-bg-float/10 relative custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : filteredParams.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-text-disabled gap-4">
              <AlertCircle size={48} className="opacity-20" />
              <Text variant="sm">No variable parameters found in this category.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredParams.map(p => (
                <div key={p.paramcode} className="bg-bg-float/30 border border-border-subtle rounded-xl p-5 hover:border-accent/30 transition-all group shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="muted" className="font-mono text-[9px] uppercase tracking-wider">{p.paramcode}</Badge>
                      <Badge variant={p.fixed === 'Variable' ? 'success' : 'warn'} className="scale-75 origin-top-right">{p.fixed}</Badge>
                    </div>
                    <Label className="text-sm font-medium text-text-primary mb-4 block leading-snug h-10 line-clamp-2">
                      {p.descr}
                    </Label>
                  </div>
                  
                  <div className="mt-2 relative">
                    {p.lookup_options && p.lookup_options.length > 0 ? (
                      <Select 
                        value={p.value?.toString() || ''} 
                        onChange={(e) => updateParameter(p.paramcode, e.target.value)}
                        disabled={saving === p.paramcode}
                        className="w-full bg-bg-base border-border-subtle focus:border-accent"
                      >
                        {p.lookup_options.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.descr} ({opt.code})</option>
                        ))}
                      </Select>
                    ) : p.opt === 'B' ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-bg-base border border-border-subtle">
                        <span className="text-xs font-mono text-text-secondary">{p.value ? 'ENABLED' : 'DISABLED'}</span>
                        <Toggle 
                          checked={!!p.value} 
                          onCheckedChange={(val) => updateParameter(p.paramcode, val)}
                          disabled={saving === p.paramcode}
                        />
                      </div>
                    ) : p.opt === 'I' || p.opt === 'S' || p.opt === 'C' ? (
                      <Input 
                        type="number" 
                        defaultValue={p.value}
                        onBlur={(e) => {
                          if (e.target.value !== p.value?.toString()) {
                            updateParameter(p.paramcode, e.target.value);
                          }
                        }}
                        disabled={saving === p.paramcode}
                        className="w-full bg-bg-base font-mono text-lg"
                        placeholder="0"
                      />
                    ) : (
                      <Input 
                        type="text" 
                        defaultValue={p.value || ''}
                        onBlur={(e) => {
                          if (e.target.value !== p.value) {
                            updateParameter(p.paramcode, e.target.value);
                          }
                        }}
                        disabled={saving === p.paramcode}
                        className="w-full bg-bg-base"
                        placeholder="Enter value..."
                      />
                    )}
                    
                    {saving === p.paramcode && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <RefreshCw size={14} className="animate-spin text-accent" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SysparamManager;
