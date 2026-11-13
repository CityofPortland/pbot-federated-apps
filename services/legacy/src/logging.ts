import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import {
  configureSync,
  getConsoleSink,
  getJsonLinesFormatter,
  getLogger,
  isLogLevel,
  withContext,
} from '@logtape/logtape';
import type { RequestHandler } from 'express';
import { isObjectType, type GraphQLSchema } from 'graphql';

export { getLogger };
export type { Logger } from '@logtape/logtape';

export function errorProperties(error: unknown) {
  return { errorType: error instanceof Error ? error.name : typeof error };
}

export function configureLogging(output: Console = console) {
  const configured =
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'development' ? 'debug' : 'info');
  const level =
    configured === 'warn'
      ? 'warning'
      : configured === 'silent'
      ? 'off'
      : configured;
  if (level !== 'off' && !isLogLevel(level)) {
    throw new Error('Invalid LOG_LEVEL.');
  }
  const format = getJsonLinesFormatter({ properties: 'flatten' });
  configureSync({
    reset: true,
    contextLocalStorage: new AsyncLocalStorage(),
    sinks: {
      stdout: getConsoleSink({
        console: output,
        formatter: record =>
          format({
            ...record,
            properties: {
              ...record.properties,
              application: 'legacy',
              pid: process.pid,
            },
          }),
        levelMap: {
          trace: 'log',
          debug: 'log',
          info: 'log',
          warning: 'log',
          error: 'log',
          fatal: 'log',
        },
      }),
    },
    loggers: [
      {
        category: 'legacy',
        lowestLevel: level === 'off' ? null : level,
        sinks: ['stdout'],
      },
      {
        category: ['logtape', 'meta'],
        lowestLevel: 'warning',
        sinks: ['stdout'],
      },
    ],
  });
  return getLogger(['legacy']);
}

export const requestLogging: RequestHandler = (req, res, next) => {
  const reqId = randomUUID();
  const started = performance.now();
  res.setHeader('X-Request-Id', reqId);
  withContext({ reqId }, () => {
    // Response events may run outside the request's async context.
    const logger = getLogger(['legacy', 'http']).with({
      reqId,
      method: req.method,
      path: req.path,
    });
    logger.debug('Request started');
    res.once('finish', () => {
      const properties = {
        status: res.statusCode,
        durationMs: performance.now() - started,
      };
      if (res.statusCode >= 500) {
        logger.error('Request completed', properties);
      } else if (res.statusCode >= 400) {
        logger.warning('Request completed', properties);
      } else {
        logger.info('Request completed', properties);
      }
    });
    res.once('close', () => {
      if (!res.writableFinished) {
        logger.warning('Request aborted', {
          status: res.statusCode,
          durationMs: performance.now() - started,
        });
      }
    });
    next();
  });
};

export function traceResolvers(schema: GraphQLSchema) {
  const logger = getLogger(['legacy', 'graphql']);
  for (const type of Object.values(schema.getTypeMap())) {
    if (!isObjectType(type) || type.name.startsWith('__')) continue;
    for (const field of Object.values(type.getFields())) {
      const resolve = field.resolve;
      if (!resolve) continue;
      field.resolve = (source, args, context, info) =>
        withContext({ field: `${type.name}.${info.fieldName}` }, async () => {
          const started = performance.now();
          logger.debug('Resolver started');
          try {
            const result = await resolve(source, args, context, info);
            const properties = {
              durationMs: performance.now() - started,
              resultCount: Array.isArray(result) ? result.length : undefined,
              hasValue: result != null,
            };
            if (type === schema.getQueryType()) {
              logger.info('Root resolver returned', properties);
            } else {
              logger.debug('Resolver returned', properties);
            }
            return result;
          } catch (error) {
            logger.error('Resolver failed', {
              durationMs: performance.now() - started,
              ...errorProperties(error),
            });
            throw error;
          }
        });
    }
  }
}
