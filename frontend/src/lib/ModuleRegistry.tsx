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
  Trophy,
  History,
  Monitor,
  DollarSign
} from 'lucide-react'

// Module Lazy/Dynamic Imports (Simplified for now)
import TillManagement from '../modules/billing/TillManagement'
import PriceManagement from '../modules/billing/PriceManagement'
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
import StockReports from '../modules/analytics/StockReports'
import TaxRegister from '../modules/analytics/TaxRegister'
import AlertsModule from '../modules/alerts/AlertsModule'
import SecurityModule from '../modules/settings/SecurityModule'
import HousekeepingModule from '../modules/settings/HousekeepingModule'
import StockMovement from '../modules/inventory/StockMovement'
import HSNManager from '../modules/catalogue/HSNManager'

export interface ModuleDefinition {
  id: string
  label: string
  icon: any
  component: React.ReactNode
  roles: ('OWNER' | 'MANAGER' | 'CASHIER')[]
  shortcut?: string
  showInSidebar: boolean
  description?: string
  category: 'POS' | 'WAREHOUSE' | 'FINANCE' | 'HO' | 'SYSTEM'
}

/**
 * COMPONENT_MAP
 * Maps dynamic module IDs to their respective React components.
 */
export const COMPONENT_MAP: Record<string, React.ReactNode> = {
  'dashboard': <ManagementDashboard />,
  'sales': <BillingModule />,
  'returns': <ComingSoon />,
  'inventory': <InventoryModule />,
  'procurement': <ComingSoon />,
  'movement': <ComingSoon />,
  'dayend': <DayEndModule onClose={() => {}} />,
  'tills': <ComingSoon />,
  'price': <ComingSoon />,
  'registry': <ItemMaster />,
  'ho': <HOSyncModule />,
  'analytics': <AnalyticsModule />,
  'settings': <ConfigModule />,
  'customers': <ComingSoon />,
  'vendors': <ComingSoon />,
  'personnel': <ComingSoon />,
  'loyalty': <ComingSoon />,
  'barcode': <ComingSoon />,
  'schemes': <SchemesModule />,
  'salesrep': <ComingSoon />,
  'stockrep': <ComingSoon />,
  'taxrep': <ComingSoon />,
  'alerts': <AlertsModule />,
  'security': <ComingSoon />,
  'housekeep': <ComingSoon />,
  'hsn': <ComingSoon />,
};

/**
 * ICON_MAP
 * Maps dynamic module IDs to their respective Lucide icons.
 */
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
  'settings': Settings,
  'customers': Package,
  'vendors': Truck,
  'personnel': UserSquare2,
  'loyalty': Trophy,
  'barcode': Package,
  'schemes': Package,
  'salesrep': BarChart3,
  'stockrep': BarChart3,
  'taxrep': BarChart3,
  'alerts': Globe,
  'security': Settings,
  'housekeep': Settings,
  'hsn': LayoutDashboard,
};

