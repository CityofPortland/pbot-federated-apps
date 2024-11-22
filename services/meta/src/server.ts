import { mergeSchemas } from '@graphql-tools/schema';
import { handleRules, handleToken } from '@pbotapps/authorization/middleware';
import { RuleType } from '@pbotapps/authorization/rule';
import cors from 'cors';
import express, { Response, json } from 'express';
import { RequestParams, parseRequestParams } from 'graphql-http';
import { createHandler } from 'graphql-http/lib/use/express';
import processRequest from 'graphql-upload/processRequest.mjs';

import { GraphQLApplicationSchema } from './application/schema.js';
import { GraphQLRuleSchema } from './rule/schema.js';

const schema = mergeSchemas({
  schemas: [GraphQLApplicationSchema, GraphQLRuleSchema],
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
      getRules: async ({}) => {
        const rules = new Array<Partial<RuleType>>();

        return rules;
      },
    },
    { id: 'reservation' }
  )
);

app.get('/probe', (_, res) => res.status(200).send('Success!'));

if (process.env.NODE_ENV == 'development') {
  import('graphql-playground-html').then(graphqlPlaygroundHtml => {
    const graphqlPlayground = options => {
      return function (_: unknown, res: Response) {
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
    async parseRequestParams(req) {
      const contentType = req.headers['content-type'];

      if (contentType && contentType.startsWith('multipart/')) {
        const params = await processRequest(req.raw, req.context.res);

        if (Array.isArray(params)) {
          throw new Error('Batching is not supported');
        }

        return {
          ...(params as unknown as RequestParams),
          // variables must be an object as per the GraphQL over HTTP spec
          variables: Object(params.variables),
        };
      }

      return parseRequestParams(req);
    },
  })
);

app.listen({ port: 4000 });
console.log('Listening to port 4000');
