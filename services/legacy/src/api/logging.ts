import { isAxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { errorProperties, getLogger } from '../logging.js';

export function traceRequests(client: AxiosInstance, upstream: string) {
  const logger = getLogger(['legacy', 'upstream', upstream]);
  const starts = new WeakMap<object, number>();
  client.interceptors.request.use(config => {
    starts.set(config, performance.now());
    logger.debug('Upstream request started', { method: config.method });
    return config;
  });
  client.interceptors.response.use(
    (response: AxiosResponse<unknown>) => {
      const started = starts.get(response.config);
      const properties = {
        status: response.status,
        durationMs:
          started === undefined ? undefined : performance.now() - started,
      };
      // ArcGIS and PortlandMaps can return HTTP 200 with an error payload.
      const data = response.data;
      if (
        typeof data === 'object' &&
        data !== null &&
        (('error' in data && data.error) ||
          ('status' in data && data.status === 'error'))
      ) {
        logger.warning('Upstream returned an application error', properties);
      } else {
        logger.debug('Upstream request returned', properties);
      }
      return response;
    },
    (error: unknown) => {
      const config = isAxiosError(error) ? error.config : undefined;
      const started = config && starts.get(config);
      logger.error('Upstream request failed', {
        status: isAxiosError(error) ? error.response?.status : undefined,
        durationMs:
          started === undefined ? undefined : performance.now() - started,
        ...errorProperties(error),
      });
      return Promise.reject(error);
    }
  );
}
