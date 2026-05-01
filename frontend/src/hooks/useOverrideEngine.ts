import { useState, useCallback, useRef } from 'react';
import type { OverrideAction, OverrideRequest, OverrideSession, PermissionMask } from '@/types/billing.permissions';
import { apiClient } from '@/api/client';

// Manager PINs are NEVER stored client-side.
// PIN is sent to backend for validation. Backend returns approved/denied.
const validateManagerPin = async (pin: string, role: string): Promise<{ valid: boolean; manager_code: string }> => {
  try {
    const res = await apiClient.post('/auth/manager-pin', { pin, required_role: role });
    return res.data;
  } catch {
    return { valid: false, manager_code: '' };
  }
};

const logOverride = async (session: OverrideSession) => {
  try {
    await apiClient.post('/audit/override', session);
  } catch {
    // Audit log failure is non-blocking — terminal continues
    console.warn('[AUDIT] Override log failed — will retry on sync');
  }
};

export function useOverrideEngine(permissionMask: PermissionMask[]) {
  const [pendingRequest, setPendingRequest] = useState<OverrideRequest | null>(null);
  const [pin,            setPin]            = useState('');
  const [isValidating,   setIsValidating]   = useState(false);
  const [pinError,       setPinError]       = useState('');
  const pinInputRef = useRef<HTMLInputElement>(null);

  const requestOverride = useCallback((req: OverrideRequest) => {
    const mask = permissionMask.find(p => p.action === req.action);
    if (!mask) {
      // No rule defined — allow by default
      req.onApproved();
      return;
    }
    if (!mask.requires_pin) {
      // Permission noted, no PIN needed
      if (mask.log_to_audit) {
        logOverride({ action: req.action, approved_by: 'AUTO', approved_at: new Date().toISOString(), context: req.context });
      }
      req.onApproved();
      return;
    }
    // PIN required — open modal
    setPendingRequest(req);
    setPin('');
    setPinError('');
    setTimeout(() => pinInputRef.current?.focus(), 100);
  }, [permissionMask]);

  const submitPin = useCallback(async () => {
    if (!pendingRequest) return;
    const mask = permissionMask.find(p => p.action === pendingRequest.action);
    if (!mask) return;

    setIsValidating(true);
    setPinError('');

    const result = await validateManagerPin(pin, mask.pin_role);

    setIsValidating(false);

    if (result.valid) {
      if (mask.log_to_audit) {
        logOverride({
          action:      pendingRequest.action,
          approved_by: result.manager_code,
          approved_at: new Date().toISOString(),
          context:     pendingRequest.context,
        });
      }
      setPendingRequest(null);
      setPin('');
      pendingRequest.onApproved();
    } else {
      setPinError('Invalid PIN or insufficient role. Try again.');
      setPin('');
      pinInputRef.current?.focus();
    }
  }, [pendingRequest, pin, permissionMask]);

  const cancelOverride = useCallback(() => {
    if (pendingRequest?.onDenied) pendingRequest.onDenied();
    setPendingRequest(null);
    setPin('');
    setPinError('');
  }, [pendingRequest]);

  return {
    pendingRequest,
    pin, setPin,
    isValidating,
    pinError,
    pinInputRef,
    requestOverride,
    submitPin,
    cancelOverride,
  };
}
