// All mask fetches are centralized here.
// Backend contract: GET /api/masks/{mask_type}?trn_type={trnType}

import { api, apiClient } from '@/api/client';
import type { EntryFieldMask }   from '@/types/billing.entry';
import type { ValidationRule }   from '@/types/billing.validation';
import type { ZoneCMask }        from '@/types/billing.panel';
import type { HotkeyMask }       from '@/types/billing.hotkeys';

export const maskApi = {
  fetchEntryMask:     (trnType: number): Promise<EntryFieldMask[]>  =>
    apiClient.get(`/masks/entry?trn_type=${trnType}`).then(r => r.data),

  fetchValidationMask:(trnType: number): Promise<ValidationRule[]>  =>
    apiClient.get(`/masks/validation?trn_type=${trnType}`).then(r => r.data),

  fetchZoneCMask:     (trnType: number): Promise<ZoneCMask>         =>
    apiClient.get(`/masks/zone_c?trn_type=${trnType}`).then(r => r.data),

  fetchHotkeyMask:    (trnType: number): Promise<HotkeyMask[]>      =>
    apiClient.get(`/masks/hotkeys?trn_type=${trnType}`).then(r => r.data),

  fetchGridMask:      (trnType: number): Promise<any[]>             =>
    apiClient.get(`/masks/grid?trn_type=${trnType}`).then(r => r.data),

  fetchPermissionMask:(trnType: number): Promise<any[]>             =>
    apiClient.get(`/masks/permissions?trn_type=${trnType}`).then(r => r.data),
};
