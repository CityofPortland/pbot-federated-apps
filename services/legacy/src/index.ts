import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema, printSubgraphSchema } from '@apollo/subgraph';
import cors from 'cors';
import { config as loadenv } from 'dotenv';
import express from 'express';
import { gql } from 'graphql-tag';
import schema from './schema';

if (process.env.NODE_ENV !== 'production') {
  loadenv();
}

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

export async function bootstrap() {
  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const sdl = gql(printSubgraphSchema(schema));

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    schema: buildSubgraphSchema(sdl),
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
