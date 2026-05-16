import { useHotkeys } from 'react-hotkeys-hook';
import { useCartStore } from '@/modules/billing/stores/useCartStore';
import { usePaymentStore } from '@/modules/billing/stores/usePaymentStore';
import { logger } from '@/core/observability/logger';

/**
 * [SMRITI-OS] ShortcutHandler (v1.2 Compliant)
 * 
 * [RULE 4.8] Deterministic Shortcut Ownership.
 * [RULE 6.1] Interaction Idempotency: Prevents duplicate workflow triggers.
 */
export const ShortcutHandler = () => {
  const clearCart = useCartStore(state => state.clearCart);
  const { openPayment, isOpen: isPaymentOpen } = usePaymentStore();

  /**
   * [GOVERNANCE] Interaction Idempotency & Passive Observability
   */
  const handleSettleTrigger = () => {
    if (isPaymentOpen) return; // Idempotency check: Don't re-trigger if already open
    
    logger.traceWorkflow('BILLING_INTERACTION', 'SHORTCUT_SETTLE_TRIGGERED', { 
      module: 'BILLING',
      shortcut: 'F10'
    });
    
    openPayment();
  };

  const handleClearTrigger = () => {
    logger.traceWorkflow('BILLING_INTERACTION', 'SHORTCUT_CLEAR_TRIGGERED', { 
      module: 'BILLING',
      shortcut: 'F12'
    });
    
    clearCart();
  };

  // Bind hotkeys with explicit focus handling
  useHotkeys('f10', (e) => {
    e.preventDefault();
    handleSettleTrigger();
  }, { enableOnFormTags: true });

  useHotkeys('f12', (e) => {
    e.preventDefault();
    handleClearTrigger();
  }, { enableOnFormTags: true });

  return null; // Passive interaction layer
};

ShortcutHandler.displayName = 'ShortcutHandler';
