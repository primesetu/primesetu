/**
 * useHoPulse.ts — Sovereign HQ Heartbeat Hook
 * Part of: Smriti-OS Sovereign Connectivity Hub, Phase 5
 *
 * Responsibilities:
 *   1. Poll /api/v1/ho/pulse on a configurable interval with exponential backoff.
 *   2. Detect incoming commands and classify by approval requirement.
 *   3. Surface destructive/approval-required commands to the UI via `pendingApprovalCommand`.
 *   4. Execute non-approval commands automatically after pulse.
 *   5. Provide `confirmAndExecute(managerId, pin)` for the manager PIN confirmation flow.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "@/lib/client";
import type { RemoteCommand, PulseRequest, PulseResponse } from "@/types/ho";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type PulseStatus =
  | "idle"
  | "polling"
  | "backoff"
  | "awaiting_approval"
  | "executing"
  | "error";

export interface HoPulseState {
  status:                 PulseStatus;
  lastPulseAt:            Date | null;
  consecutiveFailures:    number;
  pendingApprovalCommand: RemoteCommand | null;
  lastResult:             PulseResponse | null;
  error:                  string | null;
}

interface UseHoPulseOptions {
  /** Base polling interval in ms. Default: 30_000 (30s) */
  intervalMs?:     number;
  /** Max backoff interval in ms. Default: 300_000 (5 min) */
  maxBackoffMs?:   number;
  /** Node health telemetry provider */
  getHealthSnapshot: () => PulseRequest["health"];
  nodeId: string;
  lastSyncId: string;
  transactionCount: number;
}

// ─────────────────────────────────────────────────────────────
// BACKOFF CALCULATOR
// Exponential backoff: base * 2^failures, capped at maxBackoffMs
// ─────────────────────────────────────────────────────────────

function calcBackoff(failures: number, baseMs: number, maxMs: number): number {
  const raw = baseMs * Math.pow(2, failures);
  // Add ±10% jitter to prevent thundering herd from multiple nodes
  const jitter = raw * 0.1 * (Math.random() * 2 - 1);
  return Math.min(raw + jitter, maxMs);
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export function useHoPulse({
  intervalMs     = 30_000,
  maxBackoffMs   = 300_000,
  getHealthSnapshot,
  nodeId,
  lastSyncId,
  transactionCount,
}: UseHoPulseOptions) {

  const [state, setState] = useState<HoPulseState>({
    status:                 "idle",
    lastPulseAt:            null,
    consecutiveFailures:    0,
    pendingApprovalCommand: null,
    lastResult:             null,
    error:                  null,
  });

  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef      = useRef(true);

  // ── Core pulse function ─────────────────────────────────────

  const sendPulse = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState(s => ({ ...s, status: "polling", error: null }));

    const body: PulseRequest = {
      node_id:           nodeId,
      transaction_count: transactionCount,
      last_sync_id:      lastSyncId,
      health:            getHealthSnapshot(),
    };

    try {
      const response: PulseResponse = await apiClient.post("/api/v1/ho/pulse", body);

      if (!isMountedRef.current) return;

      // ── Command routing ──────────────────────────────────────
      // Split commands: approval-required go to UI, safe ones auto-execute.
      const approvalCommands = response.commands.filter(
        (c) => APPROVAL_REQUIRED_TYPES.has(c.command_type)
      );
      const autoCommands = response.commands.filter(
        (c) => !APPROVAL_REQUIRED_TYPES.has(c.command_type)
      );

      // Auto-execute non-approval commands immediately
      for (const cmd of autoCommands) {
        void executeCommand(cmd.command_id);
      }

      // Surface the first approval-required command to the UI.
      // If there are multiple, they'll be queued after the first is resolved.
      const nextApproval = approvalCommands[0] ?? null;

      setState(s => ({
        ...s,
        status:                 nextApproval ? "awaiting_approval" : "polling",
        lastPulseAt:            new Date(),
        consecutiveFailures:    0,
        pendingApprovalCommand: nextApproval,
        lastResult:             response,
        error:                  null,
      }));

      // Schedule next pulse
      scheduleNext(0);

    } catch (err: unknown) {
      if (!isMountedRef.current) return;

      const message = err instanceof Error ? err.message : "Pulse failed";

      setState(s => {
        const failures = s.consecutiveFailures + 1;
        const backoff  = calcBackoff(failures, intervalMs, maxBackoffMs);
        scheduleNext(backoff);
        return {
          ...s,
          status:              "backoff",
          consecutiveFailures: failures,
          error:               message,
        };
      });
    }
  }, [nodeId, transactionCount, lastSyncId, getHealthSnapshot, intervalMs, maxBackoffMs]);

  // ── Scheduler ───────────────────────────────────────────────

  function scheduleNext(delayMs: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) void sendPulse();
    }, delayMs);
  }

  // ── Execute a specific command (after confirmation or auto) ──

  const executeCommand = useCallback(async (commandId: string) => {
    try {
      await apiClient.post(`/api/v1/ho/execute-command/${commandId}`);
    } catch (err) {
      console.error(`[HoPulse] Failed to execute command ${commandId}:`, err);
    }
  }, []);

  // ── Manager PIN confirmation flow ────────────────────────────
  // Called by the non-dismissible confirmation dialog in the UI.
  // TTL: if the manager doesn't confirm within the command's TTL,
  // the backend will reject the execution attempt.

  const confirmAndExecute = useCallback(
    async (managerId: string, pin: string): Promise<{ success: boolean; message: string }> => {
      const command = state.pendingApprovalCommand;
      if (!command) {
        return { success: false, message: "No pending command to confirm." };
      }

      setState(s => ({ ...s, status: "executing" }));

      try {
        // Step 1: Confirm with manager PIN
        await apiClient.post(`/api/v1/ho/confirm-command/${command.command_id}`, {
          manager_id:  managerId,
          manager_pin: pin,
        });

        // Step 2: Execute after confirmation
        await executeCommand(command.command_id);

        setState(s => ({
          ...s,
          status:                 "polling",
          pendingApprovalCommand: null,
        }));

        return { success: true, message: `Command '${command.command_type}' executed successfully.` };

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Confirmation failed.";
        setState(s => ({
          ...s,
          status: "awaiting_approval",  // Keep dialog open on failure
          error:  message,
        }));
        return { success: false, message };
      }
    },
    [state.pendingApprovalCommand, executeCommand]
  );

  // ── Dismiss an expired/cancelled pending command ─────────────

  const dismissPendingCommand = useCallback(() => {
    setState(s => ({
      ...s,
      status:                 "polling",
      pendingApprovalCommand: null,
    }));
  }, []);

  // ── Lifecycle ───────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    void sendPulse(); // initial pulse on mount

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sendPulse]);

  return {
    ...state,
    confirmAndExecute,
    dismissPendingCommand,
  };
}

// ─────────────────────────────────────────────────────────────
// NODE-SIDE POLICY MIRROR
// Keep in sync with _COMMAND_POLICY in ho.py (models).
// These are the types that ALWAYS require manager approval,
// regardless of anything returned in the pulse response.
// ─────────────────────────────────────────────────────────────

const APPROVAL_REQUIRED_TYPES = new Set([
  "RESTART_SERVICE",
  "UPDATE_CONFIG",
  "SYSTEM_REBOOT",
]);
