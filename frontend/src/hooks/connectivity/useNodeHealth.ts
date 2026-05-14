import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { useSovereignStore } from '@/store/useSovereignStore';

export const useNodeHealth = (showSettings: boolean) => {
  const preferredBackendUrl = useSovereignStore(state => state.preferredBackendUrl);
  const [nodeStatus, setNodeStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({
    local: 'checking',
    cloud: 'checking',
    tunnel: 'checking'
  });

  const pingNode = useCallback(async (id: string, url: string, signal: AbortSignal) => {
    if (!url) return;
    setNodeStatus(prev => ({ ...prev, [id]: 'checking' }));
    try {
      const data = await api.connectivity.healthCheck(url, signal);
      if (data.service === "smriti-os") {
        setNodeStatus(prev => ({ ...prev, [id]: 'online' }));
      } else {
        setNodeStatus(prev => ({ ...prev, [id]: 'offline' }));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setNodeStatus(prev => ({ ...prev, [id]: 'offline' }));
      }
    }
  }, []);

  useEffect(() => {
    if (showSettings) {
      const controller = new AbortController();
      
      pingNode('local', 'http://127.0.0.1:8000', controller.signal);
      pingNode('cloud', 'https://smriti-api.primesetu.com', controller.signal);
      
      const isCustom = preferredBackendUrl && 
                      !['http://127.0.0.1:8000', 'https://smriti-api.primesetu.com'].includes(preferredBackendUrl);
      if (isCustom) {
        pingNode('tunnel', preferredBackendUrl!, controller.signal);
      }

      return () => controller.abort();
    }
  }, [showSettings, preferredBackendUrl, pingNode]);

  return { nodeStatus };
};
