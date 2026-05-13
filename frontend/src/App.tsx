import React, { useState } from 'react';
import SmritiShell from './components/layouts/SmritiShell';
import Dashboard from './pages/Dashboard';
import ItemMaster from './pages/ItemMaster';
import CustomerMaster from './pages/CustomerMaster';
import POS from './pages/POS';
import Purchase from './pages/Purchase';
import Reports from './pages/Reports';
import ThemeManager from './pages/ThemeManager';
import SystemSettings from './pages/SystemSettings';

const PLACEHOLDER = (label: string) => (
  <div className="h-full flex items-center justify-center bg-surface border border-outline-variant border-dashed">
    <div className="text-center space-y-2">
      <h2 className="text-xl font-bold uppercase tracking-widest text-outline">{label}</h2>
      <p className="text-xs text-outline/50 font-mono uppercase">Smriti OS v3.0 — Module Queued</p>
    </div>
  </div>
);

import ClassificationMaster from './pages/ClassificationMaster';
import VendorMaster from './pages/VendorMaster';
import ItemViewer from './pages/ItemViewer';
import ObjectLookup from './pages/ObjectLookup';

const App: React.FC = () => {
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
      case 'classification-master': return <ClassificationMaster />;
      case 'vendor-master':         return <VendorMaster />;
      case 'pos':                   return <POS />;
      case 'purchase':              return <Purchase />;
      case 'reports':               return <Reports />;
      case 'theme-manager':         return <ThemeManager />;
      case 'system-settings':       return <SystemSettings />;
      case 'object_lookup':         return <ObjectLookup />;
      case 'stock-transfer':  return PLACEHOLDER('Stock Transfer');
      case 'day-end':         return PLACEHOLDER('Day End & Shift Close');
      case 'menu-manager':    return PLACEHOLDER('Menu Manager');
      case 'ho-module':       return PLACEHOLDER('Head Office Module');
      default:                return PLACEHOLDER(activeTab.replace(/-/g, ' '));
    }
  };

  return (
    <SmritiShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </SmritiShell>
  );
};

export default App;
