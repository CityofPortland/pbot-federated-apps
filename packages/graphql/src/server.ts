import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { handleToken, RuleType } from '@pbotapps/authorization';
import { User } from '@pbotapps/objects';
import cors from 'cors';
import DataLoader from 'dataloader';
import express, { json, Express, RequestHandler } from 'express';
import { GraphQLSchema } from 'graphql';
import { Server } from 'http';
import { AddressInfo } from 'net';

import { Context } from './context.js';

function createURL(httpServer: Server, subPath = '/') {
  const { address, port } = httpServer.address() as AddressInfo;

  const hostname = address === '' || address === '::' ? 'localhost' : address;

  const url = new URL(subPath, `http://${hostname}:${port}/`);

  return url.toString();
}

type BootstrapOptions = {
  allowedOrigins?: Array<string>;
  application: string;
  handlers: Array<RequestHandler>;
  loaderCallback: () => Record<string, DataLoader<string, any>>;
  requireToken?: boolean;
  schema: GraphQLSchema;
};

export async function createServer({
  application,
  handlers = [],
  requireToken = false,
  schema,
}: BootstrapOptions): Promise<{ app: Express; server: ApolloServer<Context> }> {
  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap

  const app = express();

  // The `listen` method launches a web server.
  const httpServer = app.listen(process.env.PORT || 4000);

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.get('/probe', (_, res) => res.status(200).send('Success!'));

  app.use(
    '/',
    cors(),
    json(),
    handleToken({ fail: requireToken }),
    ...handlers,
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = req['user'] as User | undefined;
        const rules = req['rules'] as Array<RuleType<unknown>> | undefined;

        return { application, client: null, rules, user };
      },
    })
  );

  const url = createURL(httpServer);

  console.log(`🚀 Server ready at ${url}`);

  return { app, server };
}
