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
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/modules/auth/LoginPage'
import Dashboard from '@/modules/dashboard/Dashboard'
import BillingModule from '@/modules/billing/BillingModule'
import InventoryModule from '@/modules/inventory/InventoryModule'
import SchemesModule from '@/modules/schemes/SchemesModule'
import HODashboard from '@/modules/ho/HODashboard'
import MISModule from '@/modules/mis/MISModule'
import AlertsModule from '@/modules/alerts/AlertsModule'
import SettingsModule from '@/modules/settings/SettingsModule'

export default function App() {
  const { session, loading } = useSession()

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-navy font-serif text-xl">Loading PrimeSetu...</div>
    </div>
  )

  if (!session) return <LoginPage />

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/billing"    element={<BillingModule />} />
          <Route path="/inventory"  element={<InventoryModule />} />
          <Route path="/schemes"    element={<SchemesModule />} />
          <Route path="/ho"         element={<HODashboard />} />
          <Route path="/mis"        element={<MISModule />} />
          <Route path="/alerts"     element={<AlertsModule />} />
          <Route path="/settings"   element={<SettingsModule />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
