import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import cors from 'cors';
import { config as loadenv } from 'dotenv';
import express from 'express';
import http, { Server } from 'http';
import { AddressInfo } from 'net';
import passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { BearerStrategy } from 'passport-azure-ad';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

import { ApplicationResolver } from './application/resolver.js';
import { customAuthChecker } from './auth.js';
import knex from './data-source.js';
import { RuleResolver } from './rule/resolver.js';
import { UserResolver } from './user/resolver.js';
import { User } from './user/entity.js';

if (process.env.NODE_ENV !== 'production') {
  loadenv();
}

function createServerInfo(httpServer: Server, subPath: string = '/') {
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

  const schema = await buildSchema({
    resolvers: [ApplicationResolver, RuleResolver, UserResolver],
    authChecker: customAuthChecker,
  });

  const app = express();
  const httpServer = http.createServer(app);

  passport.use(
    new BearerStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        clientID: process.env.AZURE_CLIENT_ID,
        validateIssuer: false,
        passReqToCallback: true,
        isB2C: false,
        loggingNoPII: false,
        loggingLevel: 'info',
      },
      async function (_req, token, done) {
        try {
          let user = await knex<User>('user')
            .where({
              oauth_id: token.oid,
            })
            .first();

          if (!user) {
            user = new User();
            user.email = token.upn.toLowerCase();
            user.first_name = token.given_name;
            user.last_name = token.family_name;
            user.oauth_id = token.oid;

            await knex<User>('user').insert({ ...user });
          }

          return done(null, user, token);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.use(new AnonymousStrategy());

  passport.serializeUser((user: User, done) => {
    const { uuid } = user;
    done(null, uuid);
  });

  passport.deserializeUser((user: User, done) => {
    done(null, user);
  });

  app.use(passport.initialize());

  interface Context {
    application?: String;
    user: User;
  }

  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    passport.authenticate(['oauth-bearer', 'anonymous'], { session: false }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = req.user as User;
        const application = '0144ffd2-1e90-4594-a0b0-8e114ea273ea';
        return { application, user };
      },
    })
  );

  await new Promise<void>(resolve =>
    httpServer.listen({ port: 4000 }, resolve)
  );

  const { url } = createServerInfo(httpServer, '/graphql');

  console.log(`🚀 Server ready at ${url}`);
}

bootstrap();
