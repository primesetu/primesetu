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
import React, { lazy } from "react";
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
  Box,
  Database,
  BookOpen,
  ArrowRightLeft,
  PackagePlus,
  Home,
} from "lucide-react";

// Module Lazy/Dynamic Imports
const TillManagement = lazy(() => import("../modules/billing/TillManagement"));
const PriceManagement = lazy(() => import("../modules/billing/PriceManagement"));
const ComingSoon = lazy(() => import("../components/ComingSoon"));
const ManagementDashboard = lazy(() => import("../modules/dashboard/ManagementDashboard"));
const BillingModule = lazy(() => import("../modules/billing/BillingModule"));
const MasterRegistry = lazy(() => import("../modules/catalogue/CatalogRegistry"));
const ItemMasterModule = lazy(() => import("../modules/inventory/ItemMasterModule"));
const InventoryModule = lazy(() => import("../modules/inventory/InventoryModule"));
const AnalyticsModule = lazy(() => import("../modules/analytics/AnalyticsModule"));
const ConfigModule = lazy(() => import("../modules/settings/ConfigModule"));
const HOSyncModule = lazy(() => import("../modules/ho/HOSyncModule"));
const ProcurementModule = lazy(() => import("../modules/inventory/ProcurementModule"));
const TransactionsModule = lazy(() => import("../modules/billing/TransactionsModule"));
const DayEndModule = lazy(() => import("../modules/billing/DayEndModule"));
const ReturnsDashboard = lazy(() => import("../modules/billing/ReturnsDashboard"));
const CustomerMaster = lazy(() => import("../modules/catalogue/CustomerMaster"));
const BarcodeStudio = lazy(() => import("../modules/inventory/BarcodeStudio"));
const SchemesModule = lazy(() => import("../modules/schemes/SchemesModule"));
const DailySalesBook = lazy(() => import("../modules/analytics/DailySalesBook"));
const VendorMaster = lazy(() => import("../modules/catalogue/VendorMaster"));
const PersonnelMaster = lazy(() => import("../modules/catalogue/PersonnelMaster"));
const LoyaltyModule = lazy(() => import("../modules/catalogue/LoyaltyModule"));
const StockReports = lazy(() => import("../modules/analytics/StockReports"));
const TaxRegister = lazy(() => import("../modules/analytics/TaxRegister"));
const AlertsModule = lazy(() => import("../modules/alerts/AlertsModule"));
const SecurityModule = lazy(() => import("../modules/settings/SecurityModule"));
const HousekeepingModule = lazy(() => import("../modules/settings/HousekeepingModule"));
const StockMovement = lazy(() => import("../modules/inventory/StockMovement"));
const HSNManager = lazy(() => import("../modules/catalogue/HSNManager"));
const PrintTemplateCenter = lazy(() => import("../modules/settings/PrintTemplateCenter"));
const StoreOnboarding = lazy(() => import("../modules/onboarding/StoreOnboarding"));
const CompliancePanel = lazy(() => import("../modules/compliance/CompliancePanel"));
const PriceGroups = lazy(() => import("../modules/catalogue/PriceGroups"));
const InventoryAudit = lazy(() => import("../modules/inventory/InventoryAudit"));
const GRNProcessor = lazy(() => import("../modules/inventory/GRNProcessor"));
const FinanceHub = lazy(() => import("../modules/accounts/FinanceHub"));
const SalesDrilldownModule = lazy(() => import("../modules/analytics/SalesDrilldownModule"));
const WarehouseDashboard = lazy(() => import("../modules/inventory/WarehouseDashboard"));
const StockTransfer = lazy(() => import("../modules/inventory/StockTransfer"));
const IntelligenceCockpit = lazy(() => import("../modules/intelligence/IntelligenceCockpit"));
const LegacyExplorer = lazy(() => import("../modules/intelligence/LegacyExplorer"));
const TableViewerModule = lazy(() => import("../modules/settings/TableViewerModule"));
const SystemParameters = lazy(() => import("../modules/setup/SystemParameters"));
const PurchaseJournal = lazy(() => import("../modules/transactions/PurchaseJournal"));
const SalesJournal = lazy(() => import("../modules/transactions/SalesJournal"));
const StockLedgerJournal = lazy(() => import("../modules/transactions/StockLedgerJournal"));
const HybridStorageManager = lazy(() => import("../modules/settings/HybridStorageManager"));
const PurchaseEntry = lazy(() => import("../modules/transactions/PurchaseEntry"));
const ArchitectControlCenter = lazy(() => import("../modules/settings/ArchitectControlCenter"));

export interface ModuleDefinition {
  id: string;
  label: string;
  icon: any;
  component: React.ReactNode;
  roles: ("OWNER" | "MANAGER" | "CASHIER")[];
  shortcut?: string;
  showInSidebar: boolean;
  description?: string;
  category: "POS" | "WAREHOUSE" | "CATALOGUE" | "FINANCE" | "HO" | "SYSTEM" | "TRANSACTIONS";
}

export const MODULES: ModuleDefinition[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    component: <ManagementDashboard />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "POS",
  },
  {
    id: "sales",
    label: "Billing (POS)",
    icon: ShoppingCart,
    component: <BillingModule />,
    roles: ["OWNER", "MANAGER", "CASHIER"],
    shortcut: "F1",
    showInSidebar: true,
    category: "POS",
  },
  {
    id: "architect_config",
    label: "SMRITI Config",
    icon: ShieldCheck,
    component: <ArchitectControlCenter />,
    roles: ["OWNER"],
    showInSidebar: true,
    category: "SYSTEM",
  },
  {
    id: "hybrid_storage",
    label: "Hybrid Storage",
    icon: Database,
    component: <HybridStorageManager />,
    roles: ["OWNER"],
    showInSidebar: false,
    category: "SYSTEM",
  },
  {
    id: "intelligence",
    label: "Stock Intelligence",
    icon: BarChart3,
    component: <IntelligenceCockpit />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "POS",
  },
  {
    id: "grn",
    label: "Inward (GRN)",
    icon: Truck,
    component: <GRNProcessor />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "WAREHOUSE",
  },
  {
    id: "returns",
    label: "Outward (Returns)",
    icon: RotateCcw,
    component: <ReturnsDashboard />,
    roles: ["OWNER", "MANAGER", "CASHIER"],
    showInSidebar: true,
    category: "POS",
  },
  {
    id: "item_master",
    label: "Item Master",
    icon: Package,
    component: <ItemMasterModule />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "CATALOGUE",
  },
  {
    id: "reconcile",
    label: "Audit / Reconcile",
    icon: History,
    component: <InventoryAudit />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "WAREHOUSE",
  },
  {
    id: "warehouse_os",
    label: "Warehouse OS",
    icon: Box,
    component: <WarehouseDashboard />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "WAREHOUSE",
  },
  {
    id: "ho",
    label: "Sync (HO)",
    icon: Globe,
    component: <HOSyncModule />,
    roles: ["OWNER"],
    showInSidebar: true,
    category: "HO",
  },
  {
    id: "schemes",
    label: "Promotions",
    icon: Trophy,
    component: <SchemesModule />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "CATALOGUE",
  },
  {
    id: "finance",
    label: "Finance Hub",
    icon: DollarSign,
    component: <FinanceHub />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "FINANCE",
  },
  {
    id: "settings",
    label: "System Config",
    icon: Settings,
    component: <ConfigModule />,
    roles: ["OWNER"],
    showInSidebar: true,
    category: "SYSTEM",
  },
  {
    id: "legacy_explorer",
    label: "Legacy Explorer",
    icon: Database,
    component: <LegacyExplorer />,
    roles: ["OWNER"],
    showInSidebar: true,
    category: "SYSTEM",
  },
  {
    id: "table_viewer",
    label: "DB Explorer",
    icon: Database,
    component: <TableViewerModule />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: false,
    category: "SYSTEM",
  },
  {
    id: "sysparams",
    label: "System Parameters",
    icon: Settings,
    component: <SystemParameters />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "SYSTEM",
  },
  {
    id: "purchase_journal",
    label: "Purchase Journal",
    icon: BookOpen,
    component: <PurchaseJournal />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "TRANSACTIONS",
  },
  {
    id: "sales_journal",
    label: "Sales Journal",
    icon: BookOpen,
    component: <SalesJournal />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "TRANSACTIONS",
  },
  {
    id: "stock_ledger",
    label: "Stock Ledger",
    icon: ArrowRightLeft,
    component: <StockLedgerJournal />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "TRANSACTIONS",
  },
  {
    id: "purchase_entry",
    label: "Purchase Entry",
    icon: PackagePlus,
    component: <PurchaseEntry />,
    roles: ["OWNER", "MANAGER"],
    showInSidebar: true,
    category: "TRANSACTIONS",
  },
];

export const COMPONENT_MAP: Record<string, React.ReactNode> = {
  dashboard: <ManagementDashboard />,
  sales: <BillingModule />,
  returns: <ReturnsDashboard />,
  inventory: <InventoryModule />,
  procurement: <ProcurementModule />,
  movement: <StockMovement />,
  dayend: <DayEndModule />,
  tills: <TillManagement />,
  price: <PriceManagement />,
  registry: <MasterRegistry />,
  ho: <HOSyncModule />,
  analytics: <AnalyticsModule />,
  intelligence: <IntelligenceCockpit />,
  settings: <ConfigModule />,
  item_master: <ItemMasterModule />,
  customers: <CustomerMaster />,
  vendors: <VendorMaster />,
  personnel: <PersonnelMaster />,
  loyalty: <LoyaltyModule />,
  barcode: <BarcodeStudio />,
  schemes: <SchemesModule />,
  salesrep: <SalesDrilldownModule />,
  stockrep: <StockReports />,
  taxrep: <TaxRegister />,
  alerts: <AlertsModule />,
  security: <SecurityModule />,
  housekeep: <HousekeepingModule />,
  hsn: <HSNManager />,
  grn: <GRNProcessor />,
  transfer: <StockMovement />,
  vouchers: <FinanceHub />,
  reconcile: <InventoryAudit />,
  tally: <FinanceHub />,
  print: <PrintTemplateCenter />,
  onboarding: <StoreOnboarding />,
  gstr1: <FinanceHub />,
  pricegroups: <PriceGroups />,
  warehouse_os: <WarehouseDashboard />,
  stock_transfer: <StockTransfer />,
  legacy_explorer: <LegacyExplorer />,
  table_viewer: <TableViewerModule />,
  sysparams: <SystemParameters />,
  purchase_journal: <PurchaseJournal />,
  sales_journal: <SalesJournal />,
  stock_ledger: <StockLedgerJournal />,
  purchase_entry: <PurchaseEntry />,
  hybrid_storage: <HybridStorageManager />,
  architect_config: <ArchitectControlCenter />,
};

export const ICON_MAP: Record<string, any> = {
  dashboard: LayoutDashboard,
  sales: ShoppingCart,
  returns: RotateCcw,
  inventory: Package,
  procurement: ShoppingBag,
  movement: History,
  dayend: Lock,
  tills: Monitor,
  price: DollarSign,
  registry: Package,
  ho: Globe,
  analytics: BarChart3,
  intelligence: BarChart3,
  settings: Settings,
  item_master: Package,
  customers: UserSquare2,
  vendors: Truck,
  personnel: UserSquare2,
  loyalty: Trophy,
  barcode: Package,
  schemes: Tag,
  salesrep: BarChart,
  stockrep: BarChart3,
  taxrep: FileText,
  alerts: AlertCircle,
  security: ShieldCheck,
  housekeep: Construction,
  hsn: Tag,
  grn: Truck,
  transfer: History,
  vouchers: FileText,
  promotions: Trophy,
  reconcile: History,
  tally: DollarSign,
  print: Printer,
  onboarding: Store,
  gstr1: FileText,
  pricegroups: DollarSign,
  warehouse_os: Box,
  stock_transfer: Truck,
  table_viewer: Database,
  sysparams: Settings,
  purchase_journal: BookOpen,
  sales_journal: BookOpen,
  stock_ledger: ArrowRightLeft,
  purchase_entry: PackagePlus,
  architect_config: ShieldCheck,
};
