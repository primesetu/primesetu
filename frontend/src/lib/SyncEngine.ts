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
import { supabase } from './supabase'

export interface SyncPacket {
  id: string
  type: 'BILL' | 'RETURNS' | 'STOCK_ADJUST' | 'PO'
  payload: any
  timestamp: string
  status: 'PENDING' | 'SYNCED' | 'FAILED'
}

class SyncEngine {
  private queueKey = 'primesetu_sync_queue'

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue())
    }
  }

  /**
   * Sovereign Persistence: Save transaction to local queue first.
   */
  async queueTransaction(type: SyncPacket['type'], payload: any) {
    const packet: SyncPacket = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      type,
      payload,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    }

    const queue = this.getQueue()
    queue.push(packet)
    this.saveQueue(queue)

    // Attempt immediate sync if online
    if (navigator.onLine) {
      await this.processQueue()
    }

    return packet.id
  }

  private getQueue(): SyncPacket[] {
    const data = localStorage.getItem(this.queueKey)
    return data ? JSON.parse(data) : []
  }

  private saveQueue(queue: SyncPacket[]) {
    localStorage.setItem(this.queueKey, JSON.stringify(queue))
  }

  /**
   * Pulse Sync: Push all pending packets to the Sovereign Integration Server (SIS).
   */
  async processQueue() {
    if (!navigator.onLine) return

    const queue = this.getQueue()
    const pending = queue.filter(p => p.status !== 'SYNCED')

    if (pending.length === 0) return

    console.log(`[SyncEngine] Pulsing ${pending.length} packets to SIS...`)

    for (const packet of pending) {
      try {
        // In a real sovereign setup, this would hit the SIS Edge Function or local API
        const { error } = await (supabase.from('sync_log') as any)
          .insert({
            packet_id: packet.id,
            packet_type: packet.type,
            payload: packet.payload,
            store_id: packet.payload.store_id || 'X01'
          })

        if (!error) {
          packet.status = 'SYNCED'
        } else {
          console.error(`[SyncEngine] Packet ${packet.id} failed:`, error)
          packet.status = 'FAILED'
        }
      } catch (err) {
        console.error(`[SyncEngine] Critical Sync Error:`, err)
        packet.status = 'FAILED'
      }
    }

    this.saveQueue(queue)
  }

  getPendingCount() {
    return this.getQueue().filter(p => p.status !== 'SYNCED').length
  }
}

export const syncEngine = new SyncEngine()
