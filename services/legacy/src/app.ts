import cors from 'cors';
import express, { json, type ErrorRequestHandler, type Express } from 'express';
import type { GraphQLSchema } from 'graphql';
import { createHandler } from 'graphql-http';
import { errorProperties, getLogger, requestLogging } from './logging.js';
import type { ResolverContext } from './schema.js';

export function createApp(schema: GraphQLSchema): Express {
  const app = express();
  const logger = getLogger(['legacy', 'graphql']);

  app.use(requestLogging, cors({ exposedHeaders: ['X-Request-Id'] }));
  app.get('/probe', (_, res) => res.status(200).send('Success!'));
  const handle = createHandler<unknown, unknown, ResolverContext>({
    schema,
    context: () => ({ application: 'legacy', client: null, logger }),
    onOperation: (_req, _args, result) => {
      for (const error of result.errors ?? []) {
        logger.error(
          'GraphQL operation failed',
          errorProperties(error.cause ?? error)
        );
      }
    },
  });
  // Forward rejected handler promises explicitly for Express 4.
  app.all('/', json(), (req, res, next) => {
    handle({
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: () => req.body,
      raw: req,
      context: undefined,
    })
      .then(([body, init]) => {
        res.writeHead(init.status, init.statusText, init.headers).end(body);
      })
      .catch(next);
  });

  const handleError: ErrorRequestHandler = (error, _req, res, next) => {
    getLogger(['legacy', 'http']).error(
      'Request failed',
      errorProperties(error)
    );
    if (res.headersSent) {
      next(error);
      return;
    }
    const status =
      typeof error?.status === 'number' &&
      error.status >= 400 &&
      error.status < 600
        ? error.status
        : 500;
    res.status(status).json({
      error: status === 500 ? 'Internal server error' : 'Bad request',
    });
  };
  app.use(handleError);

  return app;
}
