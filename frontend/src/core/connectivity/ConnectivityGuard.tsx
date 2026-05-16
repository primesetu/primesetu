import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Settings2 } from 'lucide-react';
import { useSovereignStore } from '@/core/stores/useSovereignStore';
import { useNodeHealth } from '@/core/connectivity/hooks/useNodeHealth';
import { useNodeSwitch } from '@/core/connectivity/hooks/useNodeSwitch';
import { ConnectivityStatusView } from '@/components/connectivity/ConnectivityStatusView';
import { ConnectivityHub } from '@/components/connectivity/ConnectivityHub';
import { SecurityOverride } from '@/components/connectivity/SecurityOverride';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { syncEngine } from '@/lib/SyncEngine';
import { assessSyncRisk, getRiskRecommendation } from '@/core/connectivity/domain/riskAssessment';
import { CONNECTIVITY_CONFIG } from '@/config/connectivity';

export const ConnectivityGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isBackendAvailable,
    setBackendAvailable,
    connectivityState,
    setConnectivityState,
    preferredBackendUrl,
    companyName,
    guardBypassUntil,
    setGuardBypass
  } = useSovereignStore();
  
  const [showHub, setShowHub] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [failureCount, setFailureCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const heartbeatTimer = useRef<any>(null);
  
  // Switch Workflow State
  const [pendingNode, setPendingNode] = useState<{ id: string; url: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pendingSnooze, setPendingSnooze] = useState<number | null>(null);

  const { nodeStatus } = useNodeHealth(showHub);
  const { state, error, context, initiateSwitch, verifyPin, cancelSwitch } = useNodeSwitch(() => {
    setShowHub(false);
    setPendingNode(null);
    setShowPin(false);
  });

  const runHeartbeat = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTIVITY_CONFIG.HEARTBEAT_TIMEOUT);

    try {
      const baseUrl = preferredBackendUrl || `http://${window.location.hostname}:8000`;
      const response = await fetch(`${baseUrl}/api/v1/health`, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.service === 'smriti-os') {
          setFailureCount(0);
          setSuccessCount(prev => prev + 1);
          
          // Move transition logic to a safe place (here, in the async function)
          if (connectivityState === 'OFFLINE' || connectivityState === 'RECOVERING') {
            if (successCount + 1 >= CONNECTIVITY_CONFIG.SUCCESSES_TO_ONLINE) {
              setConnectivityState('ONLINE');
              setBackendAvailable(true);
            } else {
              setConnectivityState('RECOVERING');
            }
          } else {
            setConnectivityState('ONLINE');
            setBackendAvailable(true);
          }
          
          setLastCheck(new Date());
        }
      } else {
        throw new Error('Health check failed');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setSuccessCount(0);
      setFailureCount(prev => prev + 1);
      
      const nextFailure = failureCount + 1;
      if (nextFailure >= CONNECTIVITY_CONFIG.FAILURES_BEFORE_OFFLINE) {
        setConnectivityState('OFFLINE');
        setBackendAvailable(false);
      } else {
        setConnectivityState('DEGRADED');
      }
      
      setLastCheck(new Date());
    }

    const delay = (connectivityState === 'OFFLINE') 
      ? CONNECTIVITY_CONFIG.HEARTBEAT_INTERVAL_OFFLINE 
      : CONNECTIVITY_CONFIG.HEARTBEAT_INTERVAL_ONLINE;
      
    heartbeatTimer.current = setTimeout(runHeartbeat, delay);
  }, [connectivityState, setBackendAvailable, setConnectivityState, preferredBackendUrl]);

  useEffect(() => {
    runHeartbeat();
    return () => {
      if (heartbeatTimer.current) clearTimeout(heartbeatTimer.current);
    };
  }, []); // Only run on mount

  const handleApplyNode = (id: string, url: string) => {
    setPendingNode({ id, url });
    if (syncEngine.getPendingCount() > 0) {
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
  
  const handleSnoozeRequest = (hours: number) => {
    setPendingSnooze(hours);
    setShowPin(true);
  };

  const syncRisk = assessSyncRisk(syncEngine.getPendingCount());

  // RETAIL PRINCIPLE: Billing must be possible during DEGRADED/RECOVERING
  // UI only blocks if state is truly OFFLINE and no maintenance bypass is active
  const isBypassed = guardBypassUntil && Date.now() < guardBypassUntil;
  const isUIVisible = connectivityState !== 'OFFLINE' || isBypassed;

  return (
    <>
      {children}
      
      {/* Recovery indicator (Subtle, Non-blocking) */}
      {connectivityState === 'RECOVERING' && (
        <div className="fixed bottom-4 right-4 z-[20000] flex items-center space-x-2 bg-blue-600/90 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          <span>Reconnecting Node...</span>
        </div>
      )}

      {/* Maintenance Bypass indicator (Visible when guard is bypassed) */}
      {isBypassed && (
        <div className="fixed bottom-4 left-4 z-[20000] flex flex-col gap-1">
          <div className="flex items-center space-x-2 bg-amber-600/90 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
            <Settings2 size={12} className="animate-spin-slow" />
            <span>Maintenance Bypass Active</span>
          </div>
          <p className="text-[8px] text-white/40 font-mono pl-3 uppercase">
            Ends: {new Date(guardBypassUntil!).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Degraded indicator (Subtle, Non-blocking) */}
      {connectivityState === 'DEGRADED' && (
        <div className="fixed bottom-4 right-4 z-[20000] flex items-center space-x-2 bg-amber-600/90 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full" />
          <span>Connectivity Unstable</span>
        </div>
      )}

      {!isUIVisible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl font-sans text-white">
          <div className="max-w-md w-full bg-[#0f172a] border border-white/10 shadow-2xl relative overflow-hidden rounded-3xl">
            <div className="p-8 relative z-10">
              {!showHub ? (
                <ConnectivityStatusView 
                  isChecking={false}
                  onRetry={runHeartbeat}
                  onOpenHub={() => setShowHub(true)}
                  companyName={companyName}
                  lastCheck={lastCheck}
                  onSnooze={handleSnoozeRequest}
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

          <ConfirmationDialog 
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleConfirmed}
            variant={syncRisk === 'CRITICAL' ? 'danger' : 'warning'}
            title="Sync Backlog Detected"
            message={`${getRiskRecommendation(syncRisk)} (Pending: ${syncEngine.getPendingCount()})`}
            confirmText="Proceed Anyway"
          />

          <SecurityOverride 
            isOpen={showPin}
            onClose={() => { setShowPin(false); cancelSwitch(); }}
            correlationId={context?.correlationId || ''}
            onVerify={async (pin) => {
              await verifyPin(pin);
              if (pendingSnooze) {
                setGuardBypass(pendingSnooze);
                setPendingSnooze(null);
              }
              return { approved: true, correlationId: context?.correlationId || '' };
            }}
            onSuccess={() => {}}
          />
        </div>
      )}
    </>
  );
};
