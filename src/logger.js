// src/logger.js
const LOG_LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };
const MAX_LOGS = 100;
const GLOBAL_LOG_STORE = '__SRE_LOGS__';
const GLOBAL_EVENT = 'sre-log-event';

const appendLog = (entry) => {
  if (typeof window === 'undefined') return;
  window[GLOBAL_LOG_STORE] = window[GLOBAL_LOG_STORE] || [];
  window[GLOBAL_LOG_STORE] = [entry, ...window[GLOBAL_LOG_STORE]].slice(0, MAX_LOGS);
  window.dispatchEvent(new CustomEvent(GLOBAL_EVENT, { detail: entry }));
};

const buildEntry = (level, msg, extra = {}) => ({
  timestamp: new Date().toISOString(),
  level,
  message: msg,
  app_version: '1.0.0',
  ...extra
});

export const logger = {
  info: (msg, data) => {
    const entry = buildEntry(LOG_LEVELS.INFO, msg, { data });
    console.log(JSON.stringify(entry));
    appendLog(entry);
  },
  error: (msg, error) => {
    const entry = buildEntry(LOG_LEVELS.ERROR, msg, { error: error?.message || error });
    console.error(JSON.stringify(entry));
    appendLog(entry);
  }
};