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
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './hooks/useLanguage'
import { F2SearchProvider, GlobalF2SearchOverlay } from './contexts/F2SearchContext'
import App from './App'
import './index.css'

// Unregister all stale Service Workers (PWA removed — POS requires live connectivity)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
      console.log('[PrimeSetu] Stale SW unregistered:', registration.scope)
    }
  })
}

// Safety guard: React DOM scheduler uses new MessageChannel() internally.
// Ensure it is a valid constructor in this browser context.
if (typeof MessageChannel === 'undefined' || typeof MessageChannel !== 'function') {
  (window as any).MessageChannel = class MessageChannel {
    port1: any; port2: any
    constructor() {
      const ch = new BroadcastChannel('__mc_polyfill__')
      this.port1 = { onmessage: null, postMessage: (d: any) => ch.dispatchEvent(new MessageEvent('message', { data: d })) }
      this.port2 = { onmessage: null, postMessage: (d: any) => ch.dispatchEvent(new MessageEvent('message', { data: d })) }
    }
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <F2SearchProvider>
          <App />
          <GlobalF2SearchOverlay />
        </F2SearchProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
)
