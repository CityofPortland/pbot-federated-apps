import type { User } from '@pbotapps/objects';
import cors from 'cors';
import express, {
  json,
  type ErrorRequestHandler,
  type Express,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import type { GraphQLSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import type { HandlerOptions } from 'graphql-http/lib/use/express';
import pino, { type Logger } from 'pino';
import { pinoHttp } from 'pino-http';

import type { Context } from './context.js';
import { Rule } from '@pbotapps/authorization';

export type BootstrapOptions = {
  allowedOrigins?: Array<string>;
  application: string;
  handlers?: Array<RequestHandler>;
  /** Called for each request so loader caches are never shared between users. */
  loaderCallback?: () => NonNullable<Context['loaders']>;
  requireToken?: boolean;
  schema: GraphQLSchema;
  logger?: Logger;
  path?: string;
  port?: number;
  /** Extend the default application, user, rules, client and loaders context. */
  context?: (
    req: Request,
    res: Response
  ) => Partial<Context> | Promise<Partial<Context>>;
  /** Override request parsing, for example to support multipart uploads. */
  parseRequestParams?: HandlerOptions<Context>['parseRequestParams'];
};

// Express 4 does not forward rejected middleware promises to error handlers.
function handleAsync(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
  };
}

/** Build the application without opening a listening socket. */
export function createApp({
  allowedOrigins,
  application,
  handlers = [],
  schema,
  logger = pino({ level: process.env.LOG_LEVEL || 'info' }),
  path = '/',
  context,
  parseRequestParams,
}: BootstrapOptions): { app: Express; logger: Logger; path: string } {
  const app = express();

  logger = logger.child({ application });

  app.use(
    pinoHttp({
      logger,
      serializers: {
        req: req => ({
          id: req.id,
          method: req.method,
          path: req.url?.split('?')[0],
        }),
      },
    }),
    cors({ origin: allowedOrigins ?? '*' })
  );

  app.get('/probe', (_, res) => res.status(200).send('Success!'));

  app.all(
    path,
    json(),
    ...handlers.map(handleAsync),
    createHandler({
      schema,
      parseRequestParams,
      context: async req => ({
        application,
        client: null,
        user: (req.raw as Request & { user?: User }).user,
        rules: (req.raw as Request & { rules?: Array<Rule<unknown>> }).rules,
        ...(await context?.(req.raw, req.context.res)),
        logger: req.raw.log,
      }),
      onOperation: (req, _args, result) => {
        for (const error of result.errors ?? []) {
          req.raw.log.error(
            { err: error.cause ?? error, path: error.path },
            'GraphQL operation failed'
          );
        }
      },
    })
  );

  const handleError: ErrorRequestHandler = (err, req, res, next) => {
    req.log.error({ err }, 'Request failed');
    if (res.headersSent) {
      next(err);
      return;
    }
    const status = err.status >= 400 && err.status < 600 ? err.status : 500;
    res.status(status).json({
      error: status === 500 ? 'Internal server error' : 'Bad request',
    });
  };

  app.use(handleError);

  return { app, logger, path };
}

/** Build and start a service. */
export async function createServer(options: BootstrapOptions): Promise<{
  app: Express;
  host: string;
  port: number;
  logger: Logger;
}> {
  const { app, logger, path } = createApp(options);

  const port = options.port ?? Number(process.env.PORT || 4000);

  app.listen(port, '0.0.0.0', () => {
    logger.info(`Server is listening on port ${port} at path "${path ?? '/'}"`);
  });

  return { app, host: 'localhost', port, logger };
}
