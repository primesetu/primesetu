import React, { useState, useCallback } from 'react';
import { useSovereignStore } from '@/store/useSovereignStore';
import { api } from '@/api/client';
import { useNodeHealth } from '@/hooks/connectivity/useNodeHealth';
import { useNodeSwitch } from '@/hooks/connectivity/useNodeSwitch';
import { ConnectivityStatusView } from '../connectivity/ConnectivityStatusView';
import { ConnectivityHub } from '../connectivity/ConnectivityHub';
import { SecurityOverride } from '../connectivity/SecurityOverride';
import { ConfirmationDialog } from './ConfirmationDialog';
import { syncEngine } from '@/lib/SyncEngine';
import { assessSyncRisk, getRiskRecommendation } from '@/domain/connectivity/riskAssessment';

export const ConnectivityGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isBackendAvailable = useSovereignStore(state => state.isBackendAvailable);
  const setBackendAvailable = useSovereignStore(state => state.setBackendAvailable);
  const preferredBackendUrl = useSovereignStore(state => state.preferredBackendUrl);
  const companyName = useSovereignStore(state => state.companyName);
  
  // Local UI States
  const [showHub, setShowHub] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  
  // Switch Workflow State
  const [pendingNode, setPendingNode] = useState<{ id: string; url: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Custom Hooks
  const { nodeStatus } = useNodeHealth(showHub);
  const { 
    state, 
    error, 
    context, 
    initiateSwitch, 
    verifyPin,
    cancelSwitch
  } = useNodeSwitch(() => {
    setShowHub(false);
    setPendingNode(null);
    setShowPin(false);
  });

  const handleVerifyPin = async (pin: string) => {
    await verifyPin(pin);
    return { approved: true, correlationId: context?.correlationId || '' };
  };

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      await api.offline.getStatus();
      setBackendAvailable(true);
      setLastCheck(new Date());
    } catch (err) {
      setBackendAvailable(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  }, [setBackendAvailable]);

  const handleApplyNode = (id: string, url: string) => {
    setPendingNode({ id, url });
    const pendingCount = syncEngine.getPendingCount();
    
    if (pendingCount > 0) {
      setShowConfirm(true);
    } else {
      setShowPin(true);
      initiateSwitch(url, id, 'Manual Switch');
    }
  };

  const handleConfirmed = () => {
    if (!pendingNode) return;
    setShowConfirm(false);
    setShowPin(true);
    initiateSwitch(pendingNode.url, pendingNode.id, 'Forced Switch (Risk Acknowledged)');
  };

  const syncRisk = assessSyncRisk(syncEngine.getPendingCount());

  if (isBackendAvailable) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl font-sans">
      <div className="max-w-md w-full bg-[#0f172a] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden rounded-3xl">
        <div className="p-8 relative z-10">
          {!showHub ? (
            <ConnectivityStatusView 
              isChecking={isChecking}
              onRetry={checkConnection}
              onOpenHub={() => setShowHub(true)}
              companyName={companyName}
              lastCheck={lastCheck}
            />
          ) : (
            <ConnectivityHub 
              onClose={() => setShowHub(false)}
              preferredBackendUrl={preferredBackendUrl}
              nodeStatus={nodeStatus}
              onApplyNode={handleApplyNode}
              validationError={error}
            />
          )}
        </div>
      </div>

      {/* Confirmation for Sync Backlog */}
      <ConfirmationDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmed}
        variant={syncRisk === 'CRITICAL' ? 'danger' : 'warning'}
        title="Sync Backlog Detected"
        message={`${getRiskRecommendation(syncRisk)} (Pending: ${syncEngine.getPendingCount()})`}
        confirmText="Proceed Anyway"
      />

      {/* Security Override (PIN) */}
      <SecurityOverride 
        isOpen={showPin}
        onClose={() => {
          setShowPin(false);
          cancelSwitch();
        }}
        correlationId={context?.correlationId || ''}
        onVerify={handleVerifyPin}
        onSuccess={() => {
           // useNodeSwitch already calls commitSwitch() inside verifyPin
        }}
      />

      {/* Switching Overlay */}
      {state === 'switching' && (
        <div className="fixed inset-0 z-[13000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Switching Sovereign Node</h3>
            <p className="text-[10px] text-white/40 font-mono">Migrating State Pulse... {context?.correlationId}</p>
          </div>
        </div>
      )}
    </div>
  );
};
