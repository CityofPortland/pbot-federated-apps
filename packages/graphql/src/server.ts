import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { RuleType } from '@pbotapps/authorization';
import { generateSource } from '@pbotapps/common';
import { User } from '@pbotapps/objects';
import DataLoader from 'dataloader';
import express, { Express, RequestHandler } from 'express';
import { GraphQLSchema } from 'graphql';
import { Server } from 'http';
import { AddressInfo } from 'net';

import { Context } from './context';

function createURL(httpServer: Server, subPath: string = '/') {
  const { address, port } = httpServer.address() as AddressInfo;

  const hostname = address === '' || address === '::' ? 'localhost' : address;

  const url = new URL(subPath, `http://${hostname}:${port}/`);

  return url.toString();
}

type BootstrapOptions = {
  application: string;
  handlers: Array<RequestHandler>;
  loaderCallback: () => Record<string, DataLoader<string, any>>;
  schema: GraphQLSchema;
};

export async function createServer({
  application,
  handlers = [],
  schema,
  loaderCallback = () => ({}),
}: BootstrapOptions): Promise<{ app: Express; server: ApolloServer<Context> }> {
  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap

  const app = express();

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer<Context>({
    schema,
  });

  // The `listen` method launches a web server.
  const httpServer = app.listen(process.env.PORT || 4000);

  await server.start();

  app.use(
    '/graphql',
    ...handlers,
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = req.user as User | undefined;
        const loaders = loaderCallback();

        let rules = [];

        if (user && user._id) {
          rules = await generateSource({ database: 'meta' })('user_rule')
            .where({
              user_id: user._id,
            })
            .leftJoin('rule', {
              id: 'user_rule.rule_id',
              application_id: application,
            })
            .select<RuleType<any>[]>('rule.*');
        }

        return { application, client: null, user, rules, loaders };
      },
    })
  );

  const url = createURL(httpServer, '/graphql');

  console.log(`🚀 Server ready at ${url}`);

  return { app, server };
}
