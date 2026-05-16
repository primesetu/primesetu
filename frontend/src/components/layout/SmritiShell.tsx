import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Truck,
  ArrowLeftRight, BarChart3, CalendarCheck, Palette, Layers,
  Menu as MenuIcon, Building2, ChevronLeft, ChevronRight,
  Search, Bell, User, LogOut, Wifi, WifiOff, ExternalLink, Settings,
  Database, Printer
} from 'lucide-react';
import { apiClient } from '@/api/client';
import { useSovereignStore } from '@/core/stores/useSovereignStore';
import { useWindowStore } from '@/core/stores/useWindowStore';
import { FloatingWindow } from '../sovereign/FloatingWindow';

// Import modules for window rendering
import ItemViewer from '@/pages/ItemViewer';
import CustomerMaster from '@/pages/CustomerMaster';
import POS from '@/pages/POS';
import ItemClassificationWorkbench from '@/modules/catalogue/ItemClassificationWorkbench';
import VendorMaster from '@/pages/VendorMaster';
import ItemMaster from '@/pages/ItemMaster';
import ObjectLookup from '@/pages/ObjectLookup';
import BarcodeDesigner from '@/modules/tools/BarcodeDesigner';
import ConnectionSettings from '@/pages/ConnectionSettings';
import ItemGrouping from '@/modules/catalogue/ItemGrouping';
import BatchBarcodeStudio from '@/modules/inventory/BatchBarcodeStudio';


interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  group?: string;
  required_sysparam?: string; // If provided, visibility depends on this param being true
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard',      label: 'Dashboard',       icon: LayoutDashboard, group: 'OPERATIONS' },
  { id: 'pos',            label: 'POS / Billing',   icon: ShoppingCart,    group: 'OPERATIONS' },
  { id: 'purchase',       label: 'Purchase & GRN',  icon: Truck,           group: 'OPERATIONS' },
  { id: 'stock-transfer', label: 'Stock Transfer',  icon: ArrowLeftRight,  group: 'OPERATIONS' },
  { id: 'item-master',           label: 'Item Master',            icon: Package,         group: 'MASTERS' },
  { id: 'object_lookup',         label: 'Object Lookup',          icon: Database,        group: 'MASTERS' },
  { id: 'item-viewer',           label: 'Item Viewer (Audit)',    icon: Search,          group: 'MASTERS' },
  { id: 'excel-injection',       label: 'Excel Data Injection',   icon: Database,        group: 'MASTERS' },
  { id: 'customer-master',       label: 'Customer Master',        icon: Users,           group: 'MASTERS' },
  { id: 'item-grouping',         label: 'Item Grouping',          icon: Layers,          group: 'MASTERS' },
  { id: 'vendor-master',         label: 'Vendor Manager',         icon: User,            group: 'MASTERS' },
  { id: 'batch-barcode',         label: 'Batch Barcode Studio',   icon: Printer,         group: 'MASTERS' },


  { id: 'reports',        label: 'Reports',         icon: BarChart3,       group: 'ANALYTICS' },
  { id: 'day-end',        label: 'Day End',         icon: CalendarCheck,   group: 'ANALYTICS', required_sysparam: 'EnableDayEnd' },
  { id: 'theme-manager',  label: 'Theme Manager',   icon: Palette,         group: 'ADMIN' },
  { id: 'system-settings', label: 'System Parameters', icon: Settings,        group: 'ADMIN' },
  { id: 'connection-settings', label: 'Connection Settings', icon: Database, group: 'ADMIN' },
  { id: 'barcode-designer', label: 'Barcode Designer',    icon: Settings,        group: 'ADMIN' },
  { id: 'menu-manager',   label: 'Menu Manager',    icon: MenuIcon,        group: 'ADMIN' },
  { id: 'ho-module',      label: 'HO Module',       icon: Building2,       group: 'ADMIN',     required_sysparam: 'IsHeadOffice' },
];

const GROUPS = ['OPERATIONS', 'MASTERS', 'ANALYTICS', 'ADMIN'];

// Pages that need full-bleed layout (manage their own padding/scroll)
const FULL_BLEED_PAGES = ['pos', 'item-master', 'item-viewer', 'customer-master', 'item-grouping', 'vendor-master', 'purchase', 'theme-manager', 'system-settings', 'connection-settings', 'object_lookup', 'barcode-designer', 'batch-barcode'];

interface SmritiShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
}


const SmritiShell: React.FC<SmritiShellProps> = ({ children, activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isFullBleed = FULL_BLEED_PAGES.includes(activeTab);
  const liveDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const { isForcedOffline, toggleForcedOffline, companyName, setCompanyName, setCompanyAddress, setSysParams, sysParams } = useSovereignStore();
  const { windows, activeWindowId, openWindow } = useWindowStore();

  // Sync company name from local Sovereign SysParams
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await apiClient.get('/config/sysparam');
        const params = response.data;
        const nameParam = params.find((p: any) => p.param_code === 'CompanyName');
        const addrParam = params.find((p: any) => p.param_code === 'CompanyAddr1');
        
        if (nameParam?.value_txt) {
          setCompanyName(nameParam.value_txt.toUpperCase());
        }
        if (addrParam?.value_txt) {
          setCompanyAddress(addrParam.value_txt);
        }
        setSysParams(params);
      } catch (err) {
        console.error("Failed to fetch company details from sysparam:", err);
      }
    };

    fetchCompanyDetails();
  }, [setCompanyName, setCompanyAddress, setSysParams]);

  const searchParams = new URLSearchParams(window.location.search);
  const isPopout = searchParams.get('popout') === 'true';

  const renderWindowContent = (type: string) => {
    switch (type) {
      case 'item-viewer':           return <ItemViewer />;
      case 'customer-master':       return <CustomerMaster />;
      case 'item-master':           return <ItemMaster />;
      case 'pos':                   return <POS />;
      case 'classification-master': return <ItemClassificationWorkbench />;
      case 'vendor-master':         return <VendorMaster />;
      case 'object_lookup':         return <ObjectLookup />;
      case 'barcode-designer':      return <BarcodeDesigner />;
      case 'item-grouping':         return <ItemGrouping />;
      case 'batch-barcode':         return <BatchBarcodeStudio />;


      default: return <div className="p-10 text-center uppercase font-black opacity-20">Module: {type}</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      {/* ── Sidebar ── */}
      {!isPopout && (
        <aside className={cn(
          "bg-surface-container-highest border-r border-outline-variant flex flex-col z-20 flex-shrink-0",
          "transition-[width] duration-200 ease-out",
          isCollapsed ? "w-14" : "w-60"
        )}>
          {/* Logo */}
          <div className="h-14 flex items-center justify-between border-b border-outline-variant bg-primary text-white flex-shrink-0 overflow-hidden">
          {!isCollapsed && (
            <div className="flex flex-col pl-4 leading-none">
              <span className="font-black text-base tracking-tighter">SMRITI OS</span>
              <span className="text-[9px] opacity-50 font-mono tracking-widest">v3.0 SOVEREIGN</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(c => !c)} className={cn("flex-shrink-0 p-1 hover:bg-white/10 transition-colors", isCollapsed ? "mx-auto" : "mr-3")}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {GROUPS.map(group => {
            const items = MENU_ITEMS.filter(m => {
              if (m.group !== group) return false;
              if (m.required_sysparam) {
                const param = sysParams.find(p => p.param_code === m.required_sysparam);
                // Assume visibility if param exists and is truthy (e.g., '1', 'true', 'Y')
                const val = param?.value_txt?.toLowerCase();
                if (!val || val === '0' || val === 'false' || val === 'n') return false;
              }
              return true;
            });
            if (items.length === 0) return null;
            return (
              <div key={group}>
                {!isCollapsed && (
                  <div className="px-4 pt-4 pb-1 text-[8px] font-black tracking-[0.3em] text-outline/50 uppercase">{group}</div>
                )}
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "w-full flex items-center h-10 transition-colors relative group overflow-hidden",
                      isCollapsed ? "justify-center px-0" : "px-4",
                      activeTab === item.id
                        ? "bg-primary text-white"
                        : "hover:bg-surface-container-high text-on-surface-variant"
                    )}
                  >
                    {/* Active left border */}
                    {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/40" />}
                    <item.icon size={17} className={cn("flex-shrink-0", !isCollapsed && "mr-3")} />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0 pr-1">
                        <span className="text-[12px] font-semibold truncate">{item.label}</span>
                        <div 
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Logic: Spawn Internal Window
                            openWindow(item.label, item.id);
                          }}
                          className="opacity-30 hover:opacity-100 hover:text-white p-1 transition-all cursor-pointer"
                          title="Open as floating window"
                        >
                          <ExternalLink size={10} />
                        </div>
                      </div>
                    )}

                    {/* Collapsed tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-[#1e293b] text-white text-[11px] font-bold invisible group-hover:visible whitespace-nowrap z-50 shadow-xl border border-white/10">
                        {item.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className={cn("border-t border-outline-variant flex-shrink-0", isCollapsed ? "p-2" : "p-3")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-8 h-8 bg-primary flex items-center justify-center text-white flex-shrink-0">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black truncate">SYSTEM ADMIN</div>
                <div className="text-[9px] text-on-surface-variant truncate">X01 · {companyName}</div>
              </div>
            )}
            {!isCollapsed && (
              <button className="text-outline/30 hover:text-red-500 transition-colors">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
    )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        {!isPopout && (
          <header className="h-14 border-b border-outline-variant bg-surface flex items-center justify-between px-5 z-10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-black tracking-tight uppercase text-on-surface">
                {MENU_ITEMS.find(m => m.id === activeTab)?.label ?? 'Dashboard'}
              </h1>
              {/* Breadcrumb trail */}
              <span className="text-[10px] text-outline font-mono hidden md:block">
                / {MENU_ITEMS.find(m => m.id === activeTab)?.group ?? 'OPERATIONS'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:flex">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  placeholder="Quick Search (F3)..."
                  className="h-9 pl-9 pr-4 bg-surface-container border border-outline-variant text-xs w-52 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                onClick={toggleForcedOffline}
                title={isForcedOffline ? 'FORCED OFFLINE — Click to go Online' : 'ONLINE — Click to force Offline'}
                className={cn(
                  "flex items-center gap-1.5 h-9 px-3 border text-[10px] font-mono font-bold transition-all",
                  isForcedOffline
                    ? "bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20"
                    : "bg-surface-container border-outline-variant text-primary hover:bg-surface-container-high"
                )}
              >
                {isForcedOffline
                  ? <WifiOff size={12} className="text-red-500" />
                  : <Wifi size={12} className="text-emerald-500" />}
                <span className="hidden sm:inline">{isForcedOffline ? 'OFFLINE' : liveDate}</span>
              </button>

              <button className="h-9 w-9 flex items-center justify-center hover:bg-surface-container-high border border-outline-variant transition-colors relative">
                <Bell size={16} />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500"></div>
              </button>
            </div>
          </header>
        )}

        {/* Small Popout Title Bar (Only in Popout mode) */}
        {isPopout && (
          <div className="h-8 bg-surface-container-highest border-b border-outline-variant flex items-center px-4 justify-between flex-shrink-0">
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">
              {MENU_ITEMS.find(m => m.id === activeTab)?.label ?? 'Standalone View'}
            </span>
            <span className="text-[8px] text-outline font-mono">SMRITI SOVEREIGN POPOUT</span>
          </div>
        )}

        {/* ── Content ── route-aware layout */}
        <div className={cn(
          "flex-1 min-h-0 overflow-hidden relative",
          isFullBleed ? "" : "overflow-auto p-5"
        )}>
          {children}

          {/* ── Floating Windows Layer ── */}
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {windows.map(win => (
              <div key={win.id} className="pointer-events-auto">
                <FloatingWindow
                  id={win.id}
                  title={win.title}
                  zIndex={win.zIndex}
                  isActive={activeWindowId === win.id}
                  isMaximized={win.isMaximized}
                  x={win.x}
                  y={win.y}
                  width={win.width}
                  height={win.height}
                >
                  {renderWindowContent(win.type)}
                </FloatingWindow>
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <footer className="h-6 bg-surface-container-highest border-t border-outline-variant px-4 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-outline flex-shrink-0">
          <div className="flex gap-5">
            <span className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5", isForcedOffline ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
              {isForcedOffline ? 'Sync: FORCED OFFLINE' : 'Sync: Online'}
            </span>
            <span>Node: X01-{companyName}</span>
          </div>
          <div className="flex gap-4 hidden sm:flex">
            <span>F1: Help</span><span>F2: Lookup</span><span>F10: Save</span><span>Alt+D: Layout</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SmritiShell;
