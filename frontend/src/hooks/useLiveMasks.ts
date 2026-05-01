// Single hook. Fetches ALL masks for a trnType in parallel.
// Falls back to DEFAULT_* on any fetch failure — terminal never dies.

import { useQueries } from '@tanstack/react-query';
import { maskApi }    from '@/api/masks';

// Import defaults to provide fallback safety
import { DEFAULT_ENTRY_MASK }       from '@/hooks/useEntryMask';
import { DEFAULT_VALIDATION_RULES } from '@/hooks/useValidationMask';
import { DEFAULT_ZONE_C_MASK }      from '@/hooks/useZoneCMask';
import { DEFAULT_HOTKEY_MASK }      from '@/hooks/useHotkeyMask';
import { DEFAULT_PERMISSION_MASK }  from '@/hooks/usePermissionMask';

const MASK_STALE_MS  = 5 * 60 * 1000;   // 5 min — masks rarely change mid-shift
const MASK_RETRY     = 1;               // one retry, then fallback

export function useLiveMasks(trnType: number) {
  const results = useQueries({
    queries: [
      {
        queryKey:  ['mask-entry', trnType],
        queryFn:   () => maskApi.fetchEntryMask(trnType),
        staleTime: MASK_STALE_MS,
        retry:     MASK_RETRY,
      },
      {
        queryKey:  ['mask-validation', trnType],
        queryFn:   () => maskApi.fetchValidationMask(trnType),
        staleTime: MASK_STALE_MS,
        retry:     MASK_RETRY,
      },
      {
        queryKey:  ['mask-zone-c', trnType],
        queryFn:   () => maskApi.fetchZoneCMask(trnType),
        staleTime: MASK_STALE_MS,
        retry:     MASK_RETRY,
      },
      {
        queryKey:  ['mask-hotkeys', trnType],
        queryFn:   () => maskApi.fetchHotkeyMask(trnType),
        staleTime: MASK_STALE_MS,
        retry:     MASK_RETRY,
      },
      {
        queryKey:  ['mask-permissions', trnType],
        queryFn:   () => maskApi.fetchPermissionMask(trnType),
        staleTime: MASK_STALE_MS,
        retry:     MASK_RETRY,
      },
    ],
  });

  const [entry, validation, zoneC, hotkeys, permissions] = results;

  const isLoading = results.some(r => r.isLoading);
  const hasError  = results.some(r => r.isError);

  return {
    isLoading,
    hasError,
    entryMask:       entry.data      ?? DEFAULT_ENTRY_MASK,
    validationRules: validation.data ?? DEFAULT_VALIDATION_RULES,
    zoneCMask:       zoneC.data      ?? DEFAULT_ZONE_C_MASK,
    hotkeyMask:      hotkeys.data    ?? DEFAULT_HOTKEY_MASK,
    permissionMask:  permissions.data ?? DEFAULT_PERMISSION_MASK,
  };
}
