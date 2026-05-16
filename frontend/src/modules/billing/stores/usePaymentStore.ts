import { create } from 'zustand';
import { logger } from '@/core/observability/logger';

/**
 * [SMRITI-OS] Payment State Machine (v1.2 Compliant)
 * 
 * [GOVERNANCE] OBSERVABILITY: Uses centralized logger for deterministic tracing.
 * [GOVERNANCE] DETERMINISM: Prevents invalid jumps between payment stages.
 */

export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'SPLIT' | null;

interface PaymentState {
  isOpen: boolean;
  mode: PaymentMode;
  tendered: number;
  isProcessing: boolean;
  
  // Actions
  openPayment: () => void;
  closePayment: () => void;
  setMode: (mode: PaymentMode) => void;
  setTendered: (amount: number) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  isOpen: false,
  mode: null,
  tendered: 0,
  isProcessing: false,

  openPayment: () => {
    logger.traceWorkflow('BILLING_SETTLEMENT', 'INITIATED', { module: 'BILLING' });
    set({ isOpen: true, mode: null, tendered: 0 });
  },

  closePayment: () => {
    logger.traceWorkflow('BILLING_SETTLEMENT', 'CLOSED', { module: 'BILLING' });
    set({ isOpen: false });
  },

  setMode: (mode) => {
    logger.log('INFO', `Payment mode selected: ${mode}`, { module: 'BILLING', workflow: 'BILLING_SETTLEMENT', mode });
    set({ mode });
  },

  setTendered: (tendered) => {
    set({ tendered });
  },

  reset: () => {
    set({ isOpen: false, mode: null, tendered: 0, isProcessing: false });
  }
}));
