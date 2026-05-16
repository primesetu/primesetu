import { SyncRiskLevel } from './types';

/**
 * Assess the risk of switching nodes based on the current sync queue.
 * This is critical for maintaining financial integrity in a sovereign node environment.
 */
export const assessSyncRisk = (pendingCount: number): SyncRiskLevel => {
  if (pendingCount === 0) return 'LOW';
  if (pendingCount < 10) return 'MEDIUM';
  if (pendingCount < 50) return 'HIGH';
  return 'CRITICAL';
};

export const getRiskRecommendation = (level: SyncRiskLevel): string => {
  switch (level) {
    case 'LOW':
      return 'Safe to switch. No pending transactions.';
    case 'MEDIUM':
      return 'Minor risk. Ensure you sync as soon as the new node is active.';
    case 'HIGH':
      return 'Significant risk. Multiple pending transactions detected. Syncing may take time.';
    case 'CRITICAL':
      return 'CRITICAL DANGER. Switching nodes with a large backlog may lead to transaction timeout or data mismatch. Sync all data before proceeding.';
    default:
      return 'Unknown risk level.';
  }
};
