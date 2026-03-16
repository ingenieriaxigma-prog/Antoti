/**
 * Debug Configuration
 * 
 * Centralized debug logging configuration
 * Set DEBUG_MODE to false to silence all debug logs in production
 */

// 🎯 TOGGLE THIS TO CONTROL ALL DEBUG LOGS
export const DEBUG_MODE = false; // Set to true to enable debug logs

/**
 * Debug logger that respects DEBUG_MODE
 * Use this instead of console.log for debugging
 */
export const debug = {
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always show errors
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.info(...args);
    }
  },
};

/**
 * Auth-specific debug logger
 */
export const authDebug = {
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log('[AuthContext]', ...args);
    }
  },
};

/**
 * Data loader debug logger
 */
export const loaderDebug = {
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log('[DataLoader]', ...args);
    }
  },
};
