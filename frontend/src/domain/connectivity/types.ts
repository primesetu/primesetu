/**
 * SMRITI-OS — Sovereign Connectivity Domain Types
 * Defines the state machine and contracts for node orchestration.
 */

export type ConnectivityState = 
  | 'idle'
  | 'checking'
  | 'offline'
  | 'confirming'
  | 'entering_pin'
  | 'validating'
  | 'awaiting_auth'
  | 'switching'
  | 'recovering'
  | 'error';

export type SyncRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NodeCapabilities {
  sovereignPhase: string;
  apiVersion: string;
  schemaVersion: string;
  supportedFeatures: string[];
}

export interface NodeValidationResult {
  success: boolean;
  code?: string;
  message?: string;
  latencyMs?: number;
  capabilities?: NodeCapabilities;
  correlationId: string;
}

export interface SecurityOverrideResult {
  approved: boolean;
  actorId?: string;
  escalationLevel?: string;
  correlationId: string;
}

export interface NodeSwitchAuditLog {
  timestamp: string;
  correlationId: string;
  fromUrl: string | null;
  toUrl: string;
  reason: string;
  actorId?: string;
  riskLevel: SyncRiskLevel;
}

export interface NodeSwitchContext {
  targetUrl: string;
  targetId: string;
  reason: string;
  correlationId: string;
  riskLevel: SyncRiskLevel;
}

export type ConnectivityTransition =
  | ['idle', 'checking']
  | ['checking', 'offline']
  | ['checking', 'confirming']
  | ['confirming', 'entering_pin']
  | ['entering_pin', 'validating']
  | ['validating', 'awaiting_auth']
  | ['awaiting_auth', 'switching']
  | ['switching', 'idle']
  | ['offline', 'idle']
  | ['any', 'error'];
