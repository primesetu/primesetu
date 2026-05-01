import { useMemo, useRef, useState, useCallback } from 'react';
import type { EntryFieldMask, EntryPayload } from '@/types/billing.entry';

export function useEntryFields(mask: EntryFieldMask[]) {
  const visibleFields = useMemo(() =>
    mask.filter(f => f.visible).sort((a, b) => a.tab_order - b.tab_order),
    [mask]
  );

  const initialState = useMemo(() => {
    const state: EntryPayload = {};
    visibleFields.forEach(f => {
      state[f.field_key] = f.default_value ?? (f.type === 'number' ? 1 : '');
    });
    return state;
  }, [visibleFields]);

  const [values, setValues] = useState<EntryPayload>(initialState);

  const refs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  const setValue = useCallback((key: string, val: string | number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialState);
    const firstField = visibleFields.find(f => f.type === 'barcode' || f.tab_order === 1);
    if (firstField) refs.current[firstField.field_key]?.focus();
  }, [initialState, visibleFields]);

  const focusNext = useCallback((currentKey: string) => {
    const currentIndex = visibleFields.findIndex(f => f.field_key === currentKey);
    const next = visibleFields.find((f, i) => i > currentIndex && f.type !== 'readonly');
    if (next) refs.current[next.field_key]?.focus();
  }, [visibleFields]);

  const focusFirst = useCallback(() => {
    const first = visibleFields[0];
    if (first) refs.current[first.field_key]?.focus();
  }, [visibleFields]);

  return { visibleFields, values, setValue, reset, focusNext, focusFirst, refs };
}
