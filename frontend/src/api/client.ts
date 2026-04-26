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

const getBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL
  // Fallback for local development
  return 'http://localhost:8000'
}

const BASE_URL = getBaseUrl()
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
    getPredictive: () => apiClient.get('/inventory/predictive').then(r => r.data),
    getStockPrediction: (id: string) => apiClient.get(`/inventory/predictive/${id}`).then(r => r.data),
    createAuditSession: () => apiClient.post('/inventory-audit/').then(r => r.data),
    listAuditSessions: () => apiClient.get('/inventory-audit/').then(r => r.data),
    getAuditSession: (id: string) => apiClient.get(`/inventory-audit/${id}`).then(r => r.data),
    addAuditEntry: (auditId: string, data: any) => apiClient.post(`/inventory-audit/${auditId}/entries`, data).then(r => r.data),
    submitAudit: (id: string) => apiClient.post(`/inventory-audit/${id}/submit`).then(r => r.data),
  },
  procurement: {
    getSuggestions: () => apiClient.get('/procurement/reorder-suggestions').then(r => r.data),
    createPO: (data: any) => apiClient.post('/procurement/', data).then(r => r.data),
    processGRN: (data: any) => apiClient.post('/procurement/grn', data).then(r => r.data),
    listPOs: () => apiClient.get('/procurement/').then(r => r.data),
  },
  catalogue: {
    getPartners: (type?: string, q?: string) => apiClient.get('/catalogue/partners', { params: { type, q } }).then(r => r.data),
    getLookups: (category?: string) => apiClient.get('/catalogue/lookups', { params: { category } }).then(r => r.data),
    universalSearch: (q: string) => apiClient.get('/catalogue/universal-search', { params: { q } }).then(r => r.data),
    getPartnerMatrix: (id: string) => apiClient.get(`/catalogue/partners/${id}/matrix`).then(r => r.data),
  },
  customers: {
    list: () => apiClient.get('/catalogue/partners?type=CUSTOMER').then(r => r.data),
  },
  vendors: {
    list: () => apiClient.get('/catalogue/partners?type=VENDOR').then(r => r.data),
  },
  billing: {
    finalize: (data: any) => apiClient.post('/billing/finalize', data).then(r => r.data),
    getHistory: () => apiClient.get('/billing/history').then(r => r.data),
    getDayEndSummary: () => apiClient.get('/billing/day-end-summary').then(r => r.data),
    suspend: (data: any) => apiClient.post('/billing/suspend', data).then(r => r.data),
    getSuspended: () => apiClient.get('/billing/suspended').then(r => r.data),
    recallSuspended: (id: string) => apiClient.post(`/billing/suspended/${id}/recall`).then(r => r.data),
    deleteSuspended: (id: string) => apiClient.delete(`/billing/suspended/${id}`).then(r => r.data),
    getDayEnd: () => apiClient.get('/billing/day-end-summary').then(r => r.data),
    getBill: (billNo: string) => apiClient.get(`/billing/search/${billNo}`).then(r => r.data),
    getSlips: () => apiClient.get('/billing/slips').then(r => r.data),
    createSlip: (data: any) => apiClient.post('/billing/slips', data).then(r => r.data),
    deleteSlip: (id: string) => apiClient.delete(`/billing/slips/${id}`).then(r => r.data),
    convertSlip: (id: string) => apiClient.post(`/billing/slips/${id}/convert`).then(r => r.data),
  },
  accounts: {
    issueCreditNote: (data: any) => apiClient.post('/accounts/credit-notes', data).then(r => r.data),
    getCustomerCreditNotes: (customerId: string) => apiClient.get(`/accounts/credit-notes/${customerId}`).then(r => r.data),
    receiveAdvance: (data: any) => apiClient.post('/accounts/advances', data).then(r => r.data),
  },
  integration: {
    exportTally: (start_date?: string, end_date?: string) => apiClient.get('/tally/export', { params: { start_date, end_date } }).then(r => r.data),
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
    getSalesSummary: () => apiClient.get('/reports/sales-summary').then(r => r.data),
    getInventoryValuation: () => apiClient.get('/reports/inventory-valuation').then(r => r.data),
    generateFlexibleReport: (config: any) => apiClient.post('/reports/flexible/', config).then(r => r.data),
  },
  compliance: {
    getGstr1: (month: number, year: number) => apiClient.get('/gstr1/export', { params: { month, year, fmt: 'json' } }).then(r => r.data),
    downloadGstr1Csv: (month: number, year: number) => apiClient.get('/gstr1/export', { params: { month, year, fmt: 'csv' }, responseType: 'blob' }).then(r => r.data),
  },
  tills: {
    list: () => apiClient.get('/tills').then(r => r.data),
    create: (data: any) => apiClient.post('/tills', data).then(r => r.data),
    open: (id: string, data: any) => apiClient.post(`/tills/${id}/open`, data).then(r => r.data),
    close: (id: string) => apiClient.post(`/tills/${id}/close`).then(r => r.data),
    lift: (id: string, data: any) => apiClient.post(`/tills/${id}/lift`, data).then(r => r.data),
  },
  store: {
    getSettings: () => apiClient.get('/store/settings').then(r => r.data),
    updateSettings: (data: any) => apiClient.patch('/store/settings', data).then(r => r.data),
  },
  onboarding: {
    registerStore: (data: any) => apiClient.post('/onboarding/store', data).then(r => r.data),
  },
  users: {
    list: () => apiClient.get('/users/').then(r => r.data),
    create: (data: any) => apiClient.post('/users/', data).then(r => r.data),
    update: (id: string, data: any) => apiClient.put(`/users/${id}`, data).then(r => r.data),
  }
}
