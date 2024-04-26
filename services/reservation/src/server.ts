import { mergeSchemas } from '@graphql-tools/schema';
import { RuleType, handleRules, handleToken } from '@pbotapps/authorization';
import cors from 'cors';
import { config } from 'dotenv';
import express, { Response, json } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';

import { GraphQLHotelSchema } from './hotel/schema.js';
import { GraphQLReservationSchema } from './reservation/schema.js';
import { GraphQLRuleSchema } from './rules.js';
import { GraphQLSpotSchema } from './spot/schema.js';

if (process.env.NODE_ENV == 'development') {
  config();
}

const schema = mergeSchemas({
  schemas: [
    GraphQLHotelSchema,
    GraphQLReservationSchema,
    GraphQLRuleSchema,
    GraphQLSpotSchema,
  ],
});

// Create a express instance serving all methods on `/graphql`
// where the GraphQL over HTTP express request handler is
const app = express();

app.use(
  cors(),
  json(),
  handleToken({ fail: false }),
  handleRules(
    {
      getRules: async ({ user }) => {
        const rules = new Array<Partial<RuleType>>();

        if (['Michael.McDonald@portlandoregon.gov'].includes(user._id)) {
          rules.push(
            {
              action: 'write',
              subject: 'reservation',
            },
            {
              action: 'write',
              subject: 'hotel',
            }
          );
        }

        return rules;
      },
    },
    { _id: 'reservation' }
  )
);

app.get('/probe', (_, res) => res.status(200).send('Success!'));

if (process.env.NODE_ENV == 'development') {
  import('graphql-playground-html').then(graphqlPlaygroundHtml => {
    const graphqlPlayground = options => {
      return function (_, res: Response) {
        res.setHeader('Content-Type', 'text/html');
        const playground = graphqlPlaygroundHtml.renderPlaygroundPage(options);
        res.write(playground);
        res.end();
      };
    };

    app.get('/playground', graphqlPlayground({ endpoint: '/' }));
  });
}

app.all(
  '/',
  createHandler({
    schema,
    context: async req => {
      return {
        user: req.raw['user'],
        rules: req.raw['rules'],
      };
    },
  })
);

app.listen({ port: 4000 });
console.log('Listening to port 4000');
