import { getLogger } from '../logging.js';

const logger = getLogger(['legacy', 'document', 'cache']);

type CachedDocument<T> = {
  current?: { revision: string; value: T };
  pending?: Promise<T>;
  nextRefresh: number;
};

type DocumentCacheOptions<T> = {
  refreshInterval: number;
  readRevision: (name: string) => Promise<string>;
  compile: (name: string) => Promise<T>;
  onError: (name: string, error: unknown) => void;
  now?: () => number;
};

// Keep only the rendered value, and publish it after compilation succeeds.
export const createDocumentCache = <T>(options: DocumentCacheOptions<T>) => {
  const documents = new Map<string, CachedDocument<T>>();
  const now = options.now ?? Date.now;

  return async (name: string): Promise<T> => {
    let document = documents.get(name);
    if (!document) {
      document = { nextRefresh: 0 };
      documents.set(name, document);
    }
    const entry = document;

    if (!entry.pending && (!entry.current || now() >= entry.nextRefresh)) {
      logger.debug('Document load or refresh started', {
        document: name,
        cached: !!entry.current,
      });
      entry.pending = Promise.resolve()
        .then(async () => {
          const revision = await options.readRevision(name);
          if (!entry.current || entry.current.revision !== revision) {
            const value = await options.compile(name);
            entry.current = { revision, value };
            logger.debug('Document cache updated', { document: name });
          } else {
            logger.debug('Document revision unchanged', { document: name });
          }
          return entry.current.value;
        })
        .finally(() => {
          entry.nextRefresh = now() + options.refreshInterval;
          entry.pending = undefined;
        });

      // Handle background failures while allowing first-load callers to reject.
      void entry.pending.catch(error => options.onError(name, error));
    }

    if (entry.current) {
      logger.debug('Serving cached document', { document: name });
      return entry.current.value;
    }
    logger.debug('Waiting for initial document load', { document: name });
    return entry.pending;
  };
};
