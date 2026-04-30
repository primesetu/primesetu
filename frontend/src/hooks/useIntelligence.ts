/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface IntelligenceRow {
  id: string;
  sku: string;
  name: string;
  brand: string;
  stock: number;
  velocity: number;
  doc: number;
  status: string;
}

export const useIntelligenceDoc = () => {
  return useQuery<IntelligenceRow[]>({
    queryKey: ['intelligence', 'doc'],
    queryFn: () => api.intelligence.getDoc(),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useIntelligenceRiskSummary = () => {
  return useQuery({
    queryKey: ['intelligence', 'risk-summary'],
    queryFn: () => api.intelligence.getRiskSummary(),
    refetchInterval: 300000,
  });
};




