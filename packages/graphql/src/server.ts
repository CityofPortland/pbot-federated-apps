import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { handleToken } from '@pbotapps/authorization';
import { User } from '@pbotapps/objects';
import cors from 'cors';
import DataLoader from 'dataloader';
import express, { json, Express, RequestHandler } from 'express';
import { GraphQLSchema } from 'graphql';
import { Server } from 'http';
import { AddressInfo } from 'net';

import { Context } from './context';

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

  app.use(cors({}));

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer<Context>({
    schema,
  });

  // The `listen` method launches a web server.
  const httpServer = app.listen(process.env.PORT || 4000);

  await server.start();

  app.use('/', (_, res) =>
    res.send('Use the "/graphql" endpoint to send queries')
  );

  app.use(
    '/graphql',
    json(),
    handleToken({ fail: requireToken }),
    ...handlers,
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = req.user as User | undefined;

        return { application, client: null, user };
      },
    })
  );

  const url = createURL(httpServer, '/graphql');

  console.log(`🚀 Server ready at ${url}`);

  return { app, server };
}
