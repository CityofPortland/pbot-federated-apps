import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from 'apollo-server';

const settings = {
  subgraphs: JSON.parse(process.env.SUPERGRAPH_SETTINGS || '[]'),
};

async function bootstrap() {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: settings.subgraphs,
    }),
  });

  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => {
      // Get the user token from the headers
      const token = req.headers.authorization || '';
      return { token };
    },
  });

  const port = parseInt(process.env.PORT || '4000');

  server.listen({ port }).then(({ url }) => {
    console.log(`Apollo Gateway ready at ${url}`);
  });
}

bootstrap().catch(console.error);
