import { SecurityOverrideResult } from '../../connectivity/types';

/**
 * SMRITI-OS — Temporary PIN Verification Service
 * 
 * > [!WARNING]
 * > This is a MOCK implementation for development only.
 * > Hardcoded PINs (0000, 1234) must be removed before production deployment.
 * 
 * TODO: Replace with real POST /api/v1/auth/verify-manager-pin in production.
 */

/**
 * Validates manager elevation PIN.
 * @param pin 4-digit PIN string
 * @param correlationId Active switch session ID
 */
export const verifyManagerPin = async (
  pin: string, 
  correlationId: string
): Promise<SecurityOverrideResult> => {
  // ── [HARD SECURITY GATE] ───────────────────────────────────────────
  // Ensure mock auth NEVER runs in production or staging environments.
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    throw new Error('FATAL: Mock authentication bridge detected in production. Elevation blocked.');
  }

  // Artificial delay to simulate network/crypto latency
  await new Promise(resolve => setTimeout(resolve, 600));

  const isApproved = pin === '0000' || pin === '1234';
  
  return {
    approved: isApproved,
    correlationId,
    actorId: isApproved ? 'MGR-DEV' : undefined,
    escalationLevel: isApproved ? 'MANAGER' : undefined
  };
};
