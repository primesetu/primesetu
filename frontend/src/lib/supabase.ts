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
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url  = import.meta.env.VITE_SUPABASE_URL
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('[SMRITI-OS] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local. Running in Sovereign/Local Mode.');
}

export const supabase = (url && key) ? createClient<Database>(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
}) : null as any; // Cast to any to avoid TS errors when offline




