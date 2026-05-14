/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './hooks/useLanguage'
import { F2SearchProvider, GlobalF2SearchOverlay } from './contexts/F2SearchContext'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import App from './App'
import './index.css'

// AG Grid Global Module Registration (Industrial Protocol)
import { ModuleRegistry } from 'ag-grid-community'
import { 
  ClientSideRowModelModule, 
  ColumnAutoSizeModule, 
  ValidationModule, 
  PaginationModule,
  CellStyleModule,
  TextEditorModule,
  RowSelectionModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule
} from 'ag-grid-community'

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  ValidationModule,
  PaginationModule,
  CellStyleModule,
  TextEditorModule,
  RowSelectionModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule
])

// Initialize i18n
import './lib/i18n'

// ── PWA Advanced Initialization ──
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('[SMRITI-OS UPDATE]\n\nA new institutional update is available.\nReload the terminal now?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('[SMRITI-OS] Enterprise PWA installed and ready for resilient operations.')
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

import { ConnectivityGuard } from './components/common/ConnectivityGuard'
import LocalAuthGuard from './components/auth/LocalAuthGuard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeProvider>
            <F2SearchProvider>
              {/* [R1-D] LocalAuthGuard enforces login in LOCAL_POSTGRES mode */}
              <LocalAuthGuard>
                <ConnectivityGuard>
                  <App />
                </ConnectivityGuard>
                <GlobalF2SearchOverlay />
              </LocalAuthGuard>
            </F2SearchProvider>
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
