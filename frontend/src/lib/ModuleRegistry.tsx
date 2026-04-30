/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation     :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Globe, 
  RotateCcw, 
  ShoppingBag,
  Lock,
  Truck,
  UserSquare2,
  Construction,
  Trophy,
  History,
  Monitor,
  DollarSign,
  Printer,
  FileText,
  Store,
  ShieldCheck,
  Zap,
  BarChart,
  Tag,
  AlertCircle,
  Box
} from 'lucide-react'

// Module Lazy/Dynamic Imports
import TillManagement from '../modules/billing/TillManagement'
import PriceManagement from '../modules/billing/PriceManagement'
import ComingSoon from '../components/ComingSoon'
import ManagementDashboard from '../modules/dashboard/ManagementDashboard'
import BillingModule from '../modules/billing/BillingModule'
import MasterRegistry from '../modules/catalogue/CatalogRegistry'
import ItemMaster from '../modules/catalogue/ItemMaster'
import InventoryModule from '../modules/inventory/InventoryModule'
import AnalyticsModule from '../modules/analytics/AnalyticsModule'
import ConfigModule from '../modules/settings/ConfigModule'
import HOSyncModule from '../modules/ho/HOSyncModule'
import ProcurementModule from '../modules/inventory/ProcurementModule'
import TransactionsModule from '../modules/billing/TransactionsModule'
import DayEndModule from '../modules/billing/DayEndModule'
import ReturnsDashboard from '../modules/billing/ReturnsDashboard'
import CustomerMaster from '../modules/catalogue/CustomerMaster'
import BarcodeStudio from '../modules/inventory/BarcodeStudio'
import SchemesModule from '../modules/schemes/SchemesModule'
import DailySalesBook from '../modules/analytics/DailySalesBook'
import VendorMaster from '../modules/catalogue/VendorMaster'
import PersonnelMaster from '../modules/catalogue/PersonnelMaster'
import LoyaltyModule from '../modules/catalogue/LoyaltyModule'
import StockReports from '../modules/analytics/StockReports'
import TaxRegister from '../modules/analytics/TaxRegister'
import AlertsModule from '../modules/alerts/AlertsModule'
import SecurityModule from '../modules/settings/SecurityModule'
import HousekeepingModule from '../modules/settings/HousekeepingModule'
import StockMovement from '../modules/inventory/StockMovement'
import HSNManager from '../modules/catalogue/HSNManager'
import PrintTemplateCenter from '../modules/settings/PrintTemplateCenter'
import StoreOnboarding from '../modules/onboarding/StoreOnboarding'
import CompliancePanel from '../modules/compliance/CompliancePanel'
import PriceGroups from '../modules/catalogue/PriceGroups'
import InventoryAudit from '../modules/inventory/InventoryAudit'
import GRNProcessor from '../modules/inventory/GRNProcessor'
import FinanceHub from '../modules/accounts/FinanceHub'
import SalesDrilldownModule from '../modules/analytics/SalesDrilldownModule'
import WarehouseDashboard from '../modules/inventory/WarehouseDashboard'
import StockTransfer from '../modules/inventory/StockTransfer'

import IntelligenceCockpit from '../modules/intelligence/IntelligenceCockpit'

export interface ModuleDefinition {
  id: string
  label: string
  icon: any
  component: React.ReactNode
  roles: ('OWNER' | 'MANAGER' | 'CASHIER')[]
  shortcut?: string
  showInSidebar: boolean
  description?: string
  category: 'POS' | 'WAREHOUSE' | 'CATALOGUE' | 'FINANCE' | 'HO' | 'SYSTEM'
}

export const MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: <ManagementDashboard />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'POS'
  },
  {
    id: 'sales',
    label: 'Billing (POS)',
    icon: ShoppingCart,
    component: <BillingModule />,
    roles: ['OWNER', 'MANAGER', 'CASHIER'],
    shortcut: 'F1',
    showInSidebar: true,
    category: 'POS'
  },
  {
    id: 'intelligence',
    label: 'Stock Intelligence',
    icon: BarChart3,
    component: <IntelligenceCockpit />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'POS'
  },
  {
    id: 'grn',
    label: 'Inward (GRN)',
    icon: Truck,
    component: <GRNProcessor />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'WAREHOUSE'
  },
  {
    id: 'returns',
    label: 'Outward (Returns)',
    icon: RotateCcw,
    component: <ReturnsDashboard />,
    roles: ['OWNER', 'MANAGER', 'CASHIER'],
    showInSidebar: true,
    category: 'POS'
  },
  {
    id: 'item_master',
    label: 'Item Master',
    icon: Package,
    component: <ItemMaster />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'CATALOGUE'
  },
  {
    id: 'reconcile',
    label: 'Audit / Reconcile',
    icon: History,
    component: <InventoryAudit />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'WAREHOUSE'
  },
  {
    id: 'warehouse_os',
    label: 'Warehouse OS',
    icon: Box,
    component: <WarehouseDashboard />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'WAREHOUSE'
  },
  {
    id: 'ho',
    label: 'Sync (HO)',
    icon: Globe,
    component: <HOSyncModule />,
    roles: ['OWNER'],
    showInSidebar: true,
    category: 'HO'
  },
  {
    id: 'schemes',
    label: 'Promotions',
    icon: Trophy,
    component: <SchemesModule />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'CATALOGUE'
  },
  {
    id: 'finance',
    label: 'Finance Hub',
    icon: DollarSign,
    component: <FinanceHub />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    category: 'FINANCE'
  },
  {
    id: 'settings',
    label: 'System Config',
    icon: Settings,
    component: <ConfigModule />,
    roles: ['OWNER'],
    showInSidebar: true,
    category: 'SYSTEM'
  }
];

export const COMPONENT_MAP: Record<string, React.ReactNode> = {
  'dashboard': <ManagementDashboard />,
  'sales': <BillingModule />,
  'returns': <ReturnsDashboard />,
  'inventory': <InventoryModule />,
  'procurement': <ProcurementModule />,
  'movement': <StockMovement />,
  'dayend': <DayEndModule onClose={() => {}} />,
  'tills': <TillManagement />,
  'price': <PriceManagement />,
  'registry': <MasterRegistry />,
  'ho': <HOSyncModule />,
  'analytics': <AnalyticsModule />,
  'intelligence': <IntelligenceCockpit />,
  'settings': <ConfigModule />,
  'item_master': <ItemMaster />,
  'customers': <CustomerMaster />,
  'vendors': <VendorMaster />,
  'personnel': <PersonnelMaster />,
  'loyalty': <LoyaltyModule />,
  'barcode': <BarcodeStudio onClose={() => {}} />,
  'schemes': <SchemesModule />,
  'salesrep': <SalesDrilldownModule />,
  'stockrep': <StockReports />,
  'taxrep': <TaxRegister />,
  'alerts': <AlertsModule />,
  'security': <SecurityModule />,
  'housekeep': <HousekeepingModule />,
  'hsn': <HSNManager />,
  'grn': <GRNProcessor />,
  'transfer': <StockMovement />,
  'vouchers': <FinanceHub />,
  'reconcile': <InventoryAudit />,
  'tally': <FinanceHub />,
  'print': <PrintTemplateCenter />,
  'onboarding': <StoreOnboarding />,
  'gstr1': <FinanceHub />,
  'pricegroups': <PriceGroups />,
  'warehouse_os': <WarehouseDashboard />,
  'stock_transfer': <StockTransfer />,
};

export const ICON_MAP: Record<string, any> = {
  'dashboard': LayoutDashboard,
  'sales': ShoppingCart,
  'returns': RotateCcw,
  'inventory': Package,
  'procurement': ShoppingBag,
  'movement': History,
  'dayend': Lock,
  'tills': Monitor,
  'price': DollarSign,
  'registry': Package,
  'ho': Globe,
  'analytics': BarChart3,
  'intelligence': BarChart3,
  'settings': Settings,
  'item_master': Package,
  'customers': UserSquare2,
  'vendors': Truck,
  'personnel': UserSquare2,
  'loyalty': Trophy,
  'barcode': Package,
  'schemes': Tag,
  'salesrep': BarChart,
  'stockrep': BarChart3,
  'taxrep': FileText,
  'alerts': AlertCircle,
  'security': ShieldCheck,
  'housekeep': Construction,
  'hsn': Tag,
  'grn': Truck,
  'transfer': History,
  'vouchers': FileText,
  'promotions': Trophy,
  'reconcile': History,
  'tally': DollarSign,
  'print': Printer,
  'onboarding': Store,
  'gstr1': FileText,
  'pricegroups': DollarSign,
  'warehouse_os': Box,
  'stock_transfer': Truck,
};




