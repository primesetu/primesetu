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
import axios from 'axios'
import { supabase } from '@/lib/supabase'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api/v1`

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Inject Sovereign JWT into every request pulse
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export const api = {
  dashboard: {
    getStats: () => apiClient.get('/dashboard/stats').then(r => r.data),
  },
  inventory: {
    list: () => apiClient.get('/inventory').then(r => r.data),
    create: (data: any) => apiClient.post('/products', data).then(r => r.data),
    update: (id: string, data: any) => apiClient.patch(`/products/${id}`, data).then(r => r.data),
    delete: (id: string) => apiClient.delete(`/products/${id}`).then(r => r.data),
    bulkCreate: (data: any[]) => apiClient.post('/products/bulk', data).then(r => r.data),
    search: (q: string) => apiClient.get(`/inventory/search?q=${q}`).then(r => r.data),
    getAlerts: () => apiClient.get('/inventory/alerts').then(r => r.data),
    getPredictiveStats: () => apiClient.get('/inventory/predictive/aggregate').then(r => r.data),
    getStockPrediction: (id: string) => apiClient.get(`/inventory/predictive/${id}`).then(r => r.data),
  },
  catalogue: {
    getPartners: (type?: string, q?: string) => apiClient.get('/catalogue/partners', { params: { type, q } }).then(r => r.data),
    getLookups: (category?: string) => apiClient.get('/catalogue/lookups', { params: { category } }).then(r => r.data),
    universalSearch: (q: string) => apiClient.get('/catalogue/universal-search', { params: { q } }).then(r => r.data),
    getPartnerMatrix: (id: string) => apiClient.get(`/catalogue/partners/${id}/matrix`).then(r => r.data),
  },
  billing: {
    finalize: (data: any) => apiClient.post('/bills/finalize', data).then(r => r.data),
    suspend: (data: any) => apiClient.post('/bills/suspend', data).then(r => r.data),
    getSuspended: () => apiClient.get('/bills/suspended').then(r => r.data),
    recallSuspended: (id: string) => apiClient.post(`/bills/suspended/${id}/recall`).then(r => r.data),
    deleteSuspended: (id: string) => apiClient.delete(`/bills/suspended/${id}`).then(r => r.data),
    getDayEnd: () => apiClient.get('/bills/day-end-summary').then(r => r.data),
    getBill: (billNo: string) => apiClient.get(`/bills/search/${billNo}`).then(r => r.data),
  },
  accounts: {
    issueCreditNote: (data: any) => apiClient.post('/accounts/credit-notes', data).then(r => r.data),
    getCustomerCreditNotes: (customerId: string) => apiClient.get(`/accounts/credit-notes/${customerId}`).then(r => r.data),
    receiveAdvance: (data: any) => apiClient.post('/accounts/advances', data).then(r => r.data),
  },
  integration: {
    exportTally: (start_date?: string, end_date?: string) => apiClient.get('/integration/tally-export', { params: { start_date, end_date } }).then(r => r.data),
    importPDT: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return apiClient.post('/integration/pdt-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(r => r.data)
    }
  },
  schemes: {
    list: () => apiClient.get('/schemes').then(r => r.data),
    create: (data: any) => apiClient.post('/schemes', data).then(r => r.data),
  },
  ho: {
    getStatus: () => apiClient.get('/ho/status').then(r => r.data),
    triggerSync: () => apiClient.post('/ho/sync').then(r => r.data),
  },
  reports: {
    getSalesByAttribute: (attr: string) => apiClient.get(`/reports/sales-by-attribute?attribute=${attr}`).then(r => r.data),
  }
}
