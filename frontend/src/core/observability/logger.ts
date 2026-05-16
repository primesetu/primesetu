/**
 * [SMRITI-OS] Sovereign Observability Service (v1.2 Compliant)
 * 
 * [RULE R8-O] Centralizes structured operational tracing.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'TRACE' | 'DEBUG';

interface LogMetadata {
  module: string;
  workflow?: string;
  transactionId?: string;
  [key: string]: any;
}

export class SovereignLogger {
  private static instance: SovereignLogger;
  
  private constructor() {}

  public static getInstance(): SovereignLogger {
    if (!SovereignLogger.instance) {
      SovereignLogger.instance = new SovereignLogger();
    }
    return SovereignLogger.instance;
  }

  /**
   * [GOVERNANCE] Structured Operational Log
   */
  public log(level: LogLevel, message: string, metadata: LogMetadata) {
    const timestamp = new Date().toISOString();
    const formattedLog = `[${timestamp}] [${level}] [${metadata.module}] ${message}`;
    
    // In production, this would ship to a local SQLite audit table or a cloud sink.
    // For local dev, we output structured objects for Cursor-level observability.
    if (level === 'ERROR') {
      console.error(formattedLog, metadata);
    } else if (level === 'WARN') {
      console.warn(formattedLog, metadata);
    } else {
      console.log(formattedLog, metadata);
    }
  }

  // Helper for workflow-specific tracing
  public traceWorkflow(workflow: string, step: string, metadata: Omit<LogMetadata, 'workflow'>) {
    this.log('TRACE', `Workflow Transition: ${step}`, { ...metadata, workflow } as LogMetadata);
  }
}

export const logger = SovereignLogger.getInstance();
