// ─── Logger Utility ─────────────────────────────────────────────────────────
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;

class Logger {
  private level: number;

  constructor() {
    this.level = LOG_LEVELS.debug;
  }

  info(message: string, meta?: Record<string, unknown>) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, meta ?? '');
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, meta ?? '');
  }

  error(message: string, meta?: Record<string, unknown>) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, meta ?? '');
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.level <= LOG_LEVELS.debug) {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, meta ?? '');
    }
  }
}

export const logger = new Logger();
