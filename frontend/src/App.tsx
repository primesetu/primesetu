import React, { useState, Suspense, lazy } from 'react';
import SmritiShell from '@/components/layout/SmritiShell';
import POS from './pages/POS';
import ConnectionSettings from './pages/ConnectionSettings';
import CustomerMaster from './pages/CustomerMaster';

// ── [R6] LAZY LOADED NON-CRITICAL ROUTES ─────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ItemMaster = lazy(() => import('./pages/ItemMaster'));
const Purchase = lazy(() => import('./pages/Purchase'));
const Reports = lazy(() => import('./pages/Reports'));
const ThemeManager = lazy(() => import('./pages/ThemeManager'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));

const PLACEHOLDER = (label: string) => (
  <div className="h-full flex items-center justify-center bg-surface border border-outline-variant border-dashed">
    <div className="text-center space-y-2">
      <h2 className="text-xl font-bold uppercase tracking-widest text-outline">{label}</h2>
      <p className="text-xs text-outline/50 font-mono uppercase">Smriti OS v3.0 — Module Queued</p>
    </div>
  </div>
);

const ItemClassificationWorkbench = lazy(() => import('./modules/catalogue/ItemClassificationWorkbench'));
const VendorMaster = lazy(() => import('./pages/VendorMaster'));
const ItemViewer = lazy(() => import('./pages/ItemViewer'));
const ObjectLookup = lazy(() => import('./pages/ObjectLookup'));
const BarcodeStudio = lazy(() => import('./modules/inventory/BarcodeStudio'));
const BarcodeDesigner = lazy(() => import('./modules/tools/BarcodeDesigner'));

// ── [R6] SYNCHRONOUS HOOKS & GUARDS ──────────────────────────────────────────
import { useHoPulse } from '@/modules/ho/useHoPulse';
import GovernanceGuard from './modules/ho/GovernanceGuard';

const App: React.FC = () => {
  // ── [SMRITI GOVERNANCE] ───────────────────────────────────────────
  // Periodic node health pulse & remote command retrieval
  useHoPulse();

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':             return <Dashboard />;
      case 'item-master':           return <ItemMaster />;
      case 'item-viewer':           return <ItemViewer />;
      case 'customer-master':       return <CustomerMaster />;
      case 'classification-master': return <ItemClassificationWorkbench />;
      case 'vendor-master':         return <VendorMaster />;
      case 'pos':                   return <POS />;
      case 'purchase':              return <Purchase />;
      case 'reports':               return <Reports />;
      case 'theme-manager':         return <ThemeManager />;
      case 'system-settings':       return <SystemSettings />;
      case 'connection-settings':   return <ConnectionSettings />;
      case 'object_lookup':         return <ObjectLookup />;
      case 'barcode':               return <BarcodeStudio />;
      case 'barcode-designer':      return <BarcodeDesigner />;

      case 'stock-transfer':  return PLACEHOLDER('Stock Transfer');
      case 'day-end':         return PLACEHOLDER('Day End & Shift Close');
      case 'menu-manager':    return PLACEHOLDER('Menu Manager');
      case 'ho-module':       return PLACEHOLDER('Head Office Module');
      default:                return PLACEHOLDER(activeTab.replace(/-/g, ' '));
    }
  };

  return (
    <SmritiShell activeTab={activeTab} onTabChange={setActiveTab}>
      <Suspense fallback={PLACEHOLDER('Loading Module...')}>
        {renderContent()}
      </Suspense>
      <GovernanceGuard />
    </SmritiShell>
  );
};

export default App;
