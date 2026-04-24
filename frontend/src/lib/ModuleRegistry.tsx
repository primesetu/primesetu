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
  Trophy
} from 'lucide-react'

// Module Lazy/Dynamic Imports (Simplified for now)
import ComingSoon from '../components/ComingSoon'
import ManagementDashboard from '../modules/dashboard/ManagementDashboard'
import BillingModule from '../modules/billing/BillingModule'
import MasterRegistry from '../modules/catalogue/MasterRegistry'
import ItemMaster from '../modules/inventory/ItemMaster'
import InventoryModule from '../modules/inventory/InventoryModule'
import AnalyticsModule from '../modules/analytics/AnalyticsModule'
import ConfigModule from '../modules/settings/ConfigModule'
import HOSyncModule from '../modules/ho/HOSyncModule'
import ProcurementModule from '../modules/inventory/ProcurementModule'
import TransactionsModule from '../modules/billing/TransactionsModule'
import DayEndModule from '../modules/billing/DayEndModule'
import CustomerMaster from '../modules/catalogue/CustomerMaster'
import BarcodeStudio from '../modules/inventory/BarcodeStudio'
import SchemesModule from '../modules/schemes/SchemesModule'
import DailySalesBook from '../modules/analytics/DailySalesBook'
import VendorMaster from '../modules/catalogue/VendorMaster'
import PersonnelMaster from '../modules/catalogue/PersonnelMaster'
import LoyaltyModule from '../modules/catalogue/LoyaltyModule'

export interface ModuleDefinition {
  id: string
  label: string
  icon: any
  component: React.ReactNode
  roles: ('OWNER' | 'MANAGER' | 'CASHIER')[]
  shortcut?: string
  showInSidebar: boolean
  description?: string
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: <ManagementDashboard />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    description: 'Real-time operational awareness'
  },
  {
    id: 'sales',
    label: 'Billing (POS)',
    icon: ShoppingCart,
    component: <BillingModule />,
    roles: ['OWNER', 'MANAGER', 'CASHIER'],
    shortcut: 'F1',
    showInSidebar: true,
    description: 'High-speed terminal mode billing'
  },
  {
    id: 'returns',
    label: 'Returns & Credits',
    icon: RotateCcw,
    component: <TransactionsModule />,
    roles: ['OWNER', 'MANAGER', 'CASHIER'],
    shortcut: 'F4',
    showInSidebar: true,
    description: 'Sales returns and credit note management'
  },
  {
    id: 'inventory',
    label: 'Stock Audit (PST)',
    icon: Package,
    component: <InventoryModule />,
    roles: ['OWNER', 'MANAGER'],
    shortcut: 'F9',
    showInSidebar: true,
    description: 'Physical stock verification and audits'
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: ShoppingBag,
    component: <ProcurementModule />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    description: 'Purchase orders and vendor management'
  },
  {
    id: 'dayend',
    label: 'Shift Closure',
    icon: Lock,
    component: <DayEndModule onClose={() => {}} />,
    roles: ['OWNER', 'MANAGER', 'CASHIER'],
    shortcut: 'F12',
    showInSidebar: true,
    description: 'Day-end reconciliation and HO sync'
  },
  {
    id: 'registry',
    label: 'Item Master',
    icon: Package,
    component: <ItemMaster />,
    roles: ['OWNER', 'MANAGER'],
    shortcut: 'F2',
    showInSidebar: true,
    description: 'Catalogue and SKU management'
  },
  {
    id: 'ho',
    label: 'Corporate Sync',
    icon: Globe,
    component: <HOSyncModule />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: true,
    description: 'Bi-directional Head Office synchronization'
  },
  {
    id: 'analytics',
    label: 'MIS Reports',
    icon: BarChart3,
    component: <AnalyticsModule />,
    roles: ['OWNER'],
    shortcut: 'F3',
    showInSidebar: true,
    description: 'Daily sales book and margin analysis'
  },
  {
    id: 'settings',
    label: 'System Config',
    icon: Settings,
    component: <ConfigModule />,
    roles: ['OWNER'],
    shortcut: 'F10',
    showInSidebar: true,
    description: 'Terminal and store-level parameters'
  },
  {
    id: 'customers',
    label: 'Customer Registry',
    icon: Package,
    component: <CustomerMaster />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'vendors',
    label: 'Vendor Network',
    icon: Truck,
    component: <VendorMaster />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'personnel',
    label: 'Sales Personnel',
    icon: UserSquare2,
    component: <PersonnelMaster />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'loyalty',
    label: 'Loyalty Programs',
    icon: Trophy,
    component: <LoyaltyModule />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'barcode',
    label: 'Barcode & Labels',
    icon: Package,
    component: <BarcodeStudio />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'schemes',
    label: 'Sales Promotions',
    icon: Package,
    component: <SchemesModule />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'salesrep',
    label: 'Daily Sales Book',
    icon: BarChart3,
    component: <DailySalesBook />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'stockrep',
    label: 'Stock Reports',
    icon: BarChart3,
    component: <ComingSoon moduleName="Stock Reports" />,
    roles: ['OWNER', 'MANAGER'],
    showInSidebar: false,
  },
  {
    id: 'taxrep',
    label: 'Tax Register',
    icon: BarChart3,
    component: <ComingSoon moduleName="Tax Register" />,
    roles: ['OWNER'],
    showInSidebar: false,
  },
  {
    id: 'alerts',
    label: 'Chain Store Intel',
    icon: Globe,
    component: <ComingSoon moduleName="Chain Store Intel" />,
    roles: ['OWNER'],
    showInSidebar: false,
  },
  {
    id: 'security',
    label: 'Security & Users',
    icon: Settings,
    component: <ComingSoon moduleName="Security & Users" />,
    roles: ['OWNER'],
    showInSidebar: false,
  },
  {
    id: 'housekeep',
    label: 'Housekeeping',
    icon: Settings,
    component: <ComingSoon moduleName="Housekeeping" />,
    roles: ['OWNER'],
    showInSidebar: false,
  }
]
