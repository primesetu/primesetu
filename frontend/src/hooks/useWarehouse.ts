/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export interface WarehouseMetrics {
  total_items: number;
  valuation_paise: number;
  low_stock_count: number;
}

export interface BinHighlight {
  name: string;
  qty: number;
  bin: string;
  sku?: string;
}

export interface WarehouseDashboardData {
  metrics: WarehouseMetrics;
  recent_movements: RecentMovement[];
  bin_highlights: BinHighlight[];
}

export interface RecentMovement {
  txn_type: string;
  ref_no: string;
  qty: number;
  created_at: string;
}

export interface StoreListItem {
  id: string;
  name: string;
  code: string;
}

export interface StockTransferItem {
  item_id: string;
  qty: number;
  size?: string;
  colour?: string;
  batch_no?: string;
}

export interface StockTransferPayload {
  source_store_id: string;
  destination_store_id: string;
  items: StockTransferItem[];
  notes?: string;
}

export interface TransferResult {
  status: string;
  transfer_id: string;
}

export interface TransferManifestItem {
  id: number;       // local row key
  item_id: string;  // UUID from DB — empty until resolved
  sku: string;
  name: string;
  qty: number;
  maxQty: number;
  size?: string;
  colour?: string;
  batch_no?: string;
}

export const useWarehouseDashboard = () => {
  return useQuery<WarehouseDashboardData>({
    queryKey: ['warehouse', 'dashboard'],
    queryFn: () => api.warehouse.getDashboard(),
    refetchInterval: 60000,
  });
};

export const useStoreList = () => {
  return useQuery<StoreListItem[]>({
    queryKey: ['stores', 'list'],
    queryFn: () => api.warehouse.getStores(),
    staleTime: 300000, // Stores rarely change — cache 5 min
  });
};

export const useStockTransfer = () => {
  const qc = useQueryClient();
  return useMutation<TransferResult, Error, StockTransferPayload>({
    mutationFn: (payload) => api.warehouse.transfer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouse', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['intelligence', 'doc'] });
    },
  });
};

export const useStockAdjustment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.warehouse.adjust(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouse', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['intelligence', 'doc'] });
    },
  });
};
