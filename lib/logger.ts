/**
 * Lightweight logger for Shothik Platform
 */
declare const process: any;

export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(`[INFO] ${msg}`, meta ? JSON.stringify(meta) : "");
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`[WARN] ${msg}`, meta ? JSON.stringify(meta) : "");
  },
  error: (msg: string, meta?: any) => {
    console.error(`[ERROR] ${msg}`, meta ? JSON.stringify(meta) : "");
  },
  debug: (msg: string, meta?: any) => {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${msg}`, meta ? JSON.stringify(meta) : "");
    }
  }
};

export default logger;
