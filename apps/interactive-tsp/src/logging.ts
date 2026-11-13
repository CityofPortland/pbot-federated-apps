import {
  configureSync,
  getConsoleSink,
  getLogger,
  isLogLevel,
} from '@logtape/logtape';
import type { PiniaPlugin } from 'pinia';

export { getLogger };
export type { Logger } from '@logtape/logtape';

export function configureLogging() {
  const level =
    import.meta.env.VITE_LOG_LEVEL || (import.meta.env.DEV ? 'trace' : 'info');
  if (level !== 'off' && !isLogLevel(level)) {
    throw new Error('Invalid VITE_LOG_LEVEL.');
  }
  configureSync({
    reset: true,
    sinks: { console: getConsoleSink() },
    loggers: [
      {
        category: 'interactive-tsp',
        lowestLevel: level === 'off' ? null : level,
        sinks: ['console'],
      },
      {
        category: ['logtape', 'meta'],
        lowestLevel: 'warning',
        sinks: ['console'],
      },
    ],
  });
}

// Error messages and Axios errors can contain search text, URLs or credentials.
export function errorProperties(error: unknown) {
  return { errorType: error instanceof Error ? error.name : typeof error };
}

export const traceStoreActions: PiniaPlugin = ({ store }) => {
  if (store.$id === 'message') return;

  const logger = getLogger(['interactive-tsp', 'store', store.$id]);

  store.$onAction(({ name, after, onError }) => {
    const started = performance.now();
    logger.debug('Action started: {action}', { action: name });
    after(() => {
      logger.debug('Action returned: {action}', {
        action: name,
        durationMs: performance.now() - started,
      });
    });
    onError(error => {
      logger.error('Action failed: {action}', {
        action: name,
        durationMs: performance.now() - started,
        ...errorProperties(error),
      });
    });
  }, true);
};
