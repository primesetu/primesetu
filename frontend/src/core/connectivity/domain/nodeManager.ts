import { NodeValidationResult, ConnectivityTransition } from './types';
import { api } from '@/api/client';

/**
 * Sovereign Node Manager — Stateless Policy Engine
 */
export const nodeManager = {
  /**
   * Validate a target node's capabilities and identity.
   */
  validateNode: async (url: string, id: string, correlationId: string, signal?: AbortSignal): Promise<NodeValidationResult> => {
    const startTime = Date.now();
    try {
      const parsed = new URL(url);
      if (id !== 'local' && parsed.protocol !== 'https:') {
        return { success: false, code: 'PROTOCOL_UNSAFE', message: 'Remote nodes must use HTTPS.', correlationId };
      }

      const data = await api.connectivity.healthCheck(url, signal);
      const latencyMs = Date.now() - startTime;

      if (data.service !== "smriti-os") {
        return { success: false, code: 'IDENTITY_MISMATCH', message: 'Not a valid Smriti-OS node.', correlationId };
      }

      return {
        success: true,
        latencyMs,
        correlationId,
        capabilities: {
          sovereignPhase: data.sovereign_phase || 'unknown',
          apiVersion: data.version || 'v1',
          schemaVersion: data.schema_version || 's9',
          supportedFeatures: data.features || []
        }
      };
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      return { 
        success: false, 
        code: 'UNREACHABLE', 
        message: err.message || 'Node unreachable', 
        correlationId 
      };
    }
  },

  /**
   * Determine if a state transition is allowed by the governance policy.
   */
  isTransitionAllowed: (from: string, to: string): boolean => {
    if (from === to) return true;
    if (to === 'error') return true;
    
    const allowed: ConnectivityTransition[] = [
      ['idle', 'checking'],
      ['checking', 'offline'],
      ['checking', 'confirming'],
      ['confirming', 'entering_pin'],
      ['entering_pin', 'validating'],
      ['validating', 'awaiting_auth'],
      ['awaiting_auth', 'switching'],
      ['switching', 'idle'],
      ['offline', 'idle']
    ];

    return allowed.some(([f, t]) => (f === from || f === 'any') && t === to);
  }
};
