import { useCallback } from 'react';
import type { ValidationRule, ValidationCondition, ValidationResult, ValidationTrigger } from '@/types/billing.validation';

interface ValidateArgs {
  trigger:        ValidationTrigger;
  rules:          ValidationRule[];
  product?:       any;
  cartItems?:     any[];
  entryValues?:   Record<string, string | number>;
  trnMode?:       string;
  customerCode?:  string;
}

function evaluateCondition(
  condition: ValidationCondition,
  args: ValidateArgs
): boolean {
  const { product, cartItems = [], entryValues = {}, trnMode, customerCode } = args;

  switch (condition.type) {
    case 'stock_zero':
      return (product?.stock ?? product?.current_stock ?? 1) <= 0;

    case 'qty_exceeds_stock':
      return Number(entryValues['qty'] ?? 1) > (product?.stock ?? product?.current_stock ?? 999);

    case 'qty_below_min':
      return Number(entryValues['qty'] ?? 1) < condition.min;

    case 'disc_exceeds_max':
      return Number(entryValues['disc_per'] ?? 0) > condition.max_per;

    case 'mrp_zero':
      return (product?.mrp ?? 0) === 0;

    case 'gst_rate_missing':
      return product?.gst_rate == null && product?.tax_rate == null;

    case 'credit_requires_customer':
      return trnMode === 'Credit' && (!customerCode || customerCode === 'CUST-00192');

    case 'cart_empty':
      return cartItems.length === 0;

    default:
      return false;
  }
}

export function useValidator() {
  const validate = useCallback((args: ValidateArgs): ValidationResult[] => {
    const { trigger, rules } = args;
    const results: ValidationResult[] = [];

    for (const rule of rules) {
      if (rule.trigger !== trigger) continue;
      const triggered = evaluateCondition(rule.condition, args);
      if (triggered) {
        results.push({
          rule_id:   rule.rule_id,
          severity:  rule.severity,
          message:   rule.message,
          block:     rule.block,
          field_key: rule.field_key,
        });
      }
    }

    return results;
  }, []);

  const hasBlocker = (results: ValidationResult[]) =>
    results.some(r => r.block && r.severity === 'error');

  return { validate, hasBlocker };
}
