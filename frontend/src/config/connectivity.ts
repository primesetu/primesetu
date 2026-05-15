/**
 * SMRITI-OS Connectivity Configuration
 * 
 * Calibrated for retail environments with unstable WiFi, 
 * mobile tethering, and occasional router hiccups.
 */

export const CONNECTIVITY_CONFIG = {
  // Authoritative Heartbeat
  HEARTBEAT_INTERVAL_ONLINE: 5000,   // 5s when everything is fine
  HEARTBEAT_INTERVAL_OFFLINE: 10000, // 10s when we know we are offline
  HEARTBEAT_TIMEOUT: 3000,           // 3s timeout per ping
  
  // Debounce Logic
  FAILURES_BEFORE_OFFLINE: 3,        // 15s of sustained failure required to show "Offline"
  SUCCESSES_TO_ONLINE: 2,           // 2 consecutive successes required to clear recovery mode
  
  // Telemetry
  PULSE_INTERVAL: 30000,             // 30s background telemetry pulse
  PULSE_TIMEOUT: 5000,               // 5s timeout for telemetry
};
