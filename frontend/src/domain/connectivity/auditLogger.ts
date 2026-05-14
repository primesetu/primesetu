import { NodeSwitchAuditLog } from './types';

/**
 * Enterprise Audit Logger for Connectivity Events.
 * Centralizes observability for node transitions.
 * 
 * Destination Policy:
 * 1. Console: Immediate developer visibility (info/error).
 * 2. LocalStorage: Resilient trace for local debugging (last 100 events).
 * 3. TODO: Remote Endpoint: Ship to HQ audit ledger for institutional compliance.
 */
export const connectivityAudit = {
  logSwitch: (log: NodeSwitchAuditLog) => {
    const prefix = `[SMRITI-AUDIT][${log.correlationId}]`;
    const message = `NODE_SWITCH: ${log.fromUrl || 'INITIAL'} -> ${log.toUrl} | Risk: ${log.riskLevel} | Reason: ${log.reason}`;
    
    // 1. Console Out
    console.info(`${prefix} ${message}`);
    
    // 2. Local Persistence (Abstracted)
    persistAudit(log);
  },

  logFailure: (correlationId: string, url: string, error: string) => {
    console.error(`[SMRITI-AUDIT][${correlationId}] NODE_VALIDATION_FAILURE: ${url} | Error: ${error}`);
  }
};

/**
 * Persists audit logs to local storage.
 * @private
 */
function persistAudit(log: NodeSwitchAuditLog) {
  try {
    const key = 'smriti_connectivity_audit_v1';
    const raw = localStorage.getItem(key);
    const history: NodeSwitchAuditLog[] = raw ? JSON.parse(raw) : [];
    
    history.push(log);
    
    // Keep a sliding window of 100 entries to prevent storage bloat
    localStorage.setItem(key, JSON.stringify(history.slice(-100)));
  } catch (err) {
    console.warn('[SMRITI-AUDIT] Local persistence failed:', err);
  }
}
