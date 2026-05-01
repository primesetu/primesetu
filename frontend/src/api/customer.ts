import { apiClient } from '@/api/client';

export interface CustomerRecord {
  code:           string;
  name:           string;
  phone:          string;
  loyalty_points: number;
  outstanding_paise: number;
  price_group_id?: string;
  created_at:     string;
}

export const customerApi = {
  search: (q: string): Promise<CustomerRecord[]> =>
    apiClient.get(`/customers/search?q=${encodeURIComponent(q)}`).then(r => r.data),

  fetchByCode: (code: string): Promise<CustomerRecord> =>
    apiClient.get(`/customers/${code}`).then(r => r.data),
};
