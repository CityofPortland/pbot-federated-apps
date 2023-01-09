import { buildSubgraphSchema, printSubgraphSchema } from '@apollo/subgraph';
import { ApolloServer } from 'apollo-server-express';
import { config as loadenv } from 'dotenv';
import express from 'express';
import { specifiedDirectives } from 'graphql';
import gql from 'graphql-tag';
import passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { BearerStrategy } from 'passport-azure-ad';
import 'reflect-metadata';
import {
  buildSchema,
  BuildSchemaOptions,
  createResolversMap,
} from 'type-graphql';

import { ServerInfo } from 'apollo-server';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { EnrichedMetastore, RawMetastore } from './data-source.js';
import { SchemaResolver } from './schema/resolver.js';
import { TableResolver } from './table/resolver.js';
import { ZoneResolver } from './zone/resolver.js';

if (process.env.NODE_ENV !== 'production') {
  const out = loadenv();
  if (out.error) {
    console.error(out.error);
  }
}

function createServerInfo(
  httpServer: Server,
  subPath: string = '/'
): ServerInfo {
  const addressInfo = httpServer.address() as AddressInfo;

  const hostname =
    addressInfo.address === '' || addressInfo.address === '::'
      ? 'localhost'
      : addressInfo.address;

  const url = new URL(subPath, `http://${hostname}:${addressInfo.port}/`);

  return {
    ...addressInfo,
    server: httpServer,
    url: url.toString(),
  };
}

export async function bootstrap() {
  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap

  Promise.all([EnrichedMetastore.initialize(), RawMetastore.initialize()])
    .then(() => console.log('✅  TypeORM connections intialized!'))
    .catch(err => {
      console.error(err);
      throw new Error('Failed to initialize database');
    });

  const app = express();

  passport.use(
    new BearerStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        clientID: process.env.AZURE_CLIENT_ID,
        validateIssuer: false,
        passReqToCallback: true,
        isB2C: false,
      },
      async function (_req, token, done) {
        try {
          // find this user using graphQL gateway itself?
          const user = {
            oauthId: token.oid,
            email: token.upn.toLowerCase(),
            firstName: token.given_name,
            lastName: token.family_name,
          };

          return done(null, user, token);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.use(new AnonymousStrategy());

  passport.serializeUser((user: { oauthId: string }, done) => {
    const { oauthId } = user;
    done(null, oauthId);
  });

  passport.deserializeUser((user: { oauthId: string }, done) => {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.authenticate(['oauth-bearer', 'anonymous']));

  const options: BuildSchemaOptions = {
    resolvers: [SchemaResolver, TableResolver, ZoneResolver],
  };

  const schema = await buildSchema({
    ...options,
    directives: [...specifiedDirectives, ...(options.directives || [])],
    skipCheck: true,
  });

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs: gql(printSubgraphSchema(schema)),
      resolvers: createResolversMap(schema) as any,
    }),
    context: ({ req }) => {
      const user = req.user || null;
      const application = '0144ffd2-1e90-4594-a0b0-8e114ea273ea';
      return { application, user };
    },
  });

  // The `listen` method launches a web server.
  const httpServer = app.listen(process.env.PORT || 4000);

  const { url } = createServerInfo(httpServer, server.graphqlPath);

  await server.start();

  server.applyMiddleware({ app });

  console.log(`🚀  Server ready at ${url}`);

  return url;
}

bootstrap();
