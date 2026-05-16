import { useState, useCallback, useRef } from 'react';
import { useSovereignStore } from '@/core/stores/useSovereignStore';
import { nodeManager } from '@/core/connectivity/domain/nodeManager';
import { assessSyncRisk } from '@/core/connectivity/domain/riskAssessment';
import { connectivityAudit } from '@/core/connectivity/domain/auditLogger';
import { ConnectivityState, NodeSwitchContext } from '@/core/connectivity/domain/types';
import { syncEngine } from '@/lib/SyncEngine';
import { verifyManagerPin } from '@/modules/auth/domain/__mocks__/verifyManagerPin';

/**
 * Orchestrates the multi-step node switching flow.
 * Confirmation -> PIN -> Validation -> State Migration.
 */
export const useNodeSwitch = (onComplete?: () => void) => {
  const [state, setState] = useState<ConnectivityState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<NodeSwitchContext | null>(null);
  
  // Guard against concurrent switch attempts
  const isBusy = useRef(false);

  const preferredBackendUrl = useSovereignStore(state => state.preferredBackendUrl);
  const setPreferredBackendUrl = useSovereignStore(state => state.setPreferredBackendUrl);

  /**
   * Phase 1: Initiation
   * Triggers the confirmation dialog state.
   */
  const initiateSwitch = useCallback((url: string, id: string, reason: string) => {
    if (isBusy.current) return;
    
    const cid = `SW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const pendingCount = syncEngine.getPendingCount();
    const riskLevel = assessSyncRisk(pendingCount);

    setContext({
      targetUrl: url,
      targetId: id,
      reason,
      correlationId: cid,
      riskLevel
    });
    
    setState('confirming');
  }, []);

  /**
   * Phase 2: Confirmation Accepted
   * Moves to PIN challenge.
   */
  const confirmSwitch = useCallback(() => {
    if (state !== 'confirming') return;
    setState('entering_pin');
  }, [state]);

  /**
   * Phase 3: PIN Verification
   * Validates manager credentials.
   */
  const verifyPin = useCallback(async (pin: string) => {
    if (!context || state !== 'entering_pin' || isBusy.current) return;

    isBusy.current = true;
    setState('validating');
    setError(null);

    try {
      // 1. Check PIN
      const auth = await verifyManagerPin(pin, context.correlationId);
      if (!auth.approved) {
        setError('Manager PIN verification failed.');
        setState('entering_pin');
        return;
      }

      // 2. Validate Node Availability
      const validation = await nodeManager.validateNode(
        context.targetUrl, 
        context.targetId, 
        context.correlationId
      );

      if (!validation.success) {
        connectivityAudit.logFailure(context.correlationId, context.targetUrl, validation.message || 'Validation failed');
        setError(validation.message || 'Target node is unreachable or invalid.');
        // ROLLBACK: Revert to idle, keep the context so user can try another URL if needed
        setState('idle'); 
        return;
      }

      // 3. Commit Switch
      commitSwitch();

    } catch (err: any) {
      setError(err.message || 'Unexpected switch error');
      setState('error');
    } finally {
      isBusy.current = false;
    }
  }, [context, state]);

  /**
   * Phase 4: Commitment
   * Updates global state and logs success.
   * @private
   */
  const commitSwitch = useCallback(() => {
    if (!context) return;

    setState('switching');

    connectivityAudit.logSwitch({
      timestamp: new Date().toISOString(),
      correlationId: context.correlationId,
      fromUrl: preferredBackendUrl,
      toUrl: context.targetUrl,
      reason: context.reason,
      riskLevel: context.riskLevel
    });

    // Update global store
    setPreferredBackendUrl(context.targetUrl, context.reason);
    
    // Cleanup
    setState('idle');
    setContext(null);
    onComplete?.();
  }, [context, preferredBackendUrl, setPreferredBackendUrl, onComplete]);

  /**
   * Abort the current flow and reset to idle.
   */
  const cancelSwitch = useCallback(() => {
    setState('idle');
    setContext(null);
    setError(null);
    isBusy.current = false;
  }, []);

  return {
    state,
    error,
    context,
    initiateSwitch,
    confirmSwitch,
    verifyPin,
    cancelSwitch
  };
};
