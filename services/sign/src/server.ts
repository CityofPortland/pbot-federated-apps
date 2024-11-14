import { mergeSchemas } from '@graphql-tools/schema';
import { handleRules, handleToken } from '@pbotapps/authorization/middleware';
import { RuleType } from '@pbotapps/authorization/rule';
import cors from 'cors';
import express, { Response, json } from 'express';
import { RequestParams, parseRequestParams } from 'graphql-http';
import { createHandler } from 'graphql-http/lib/use/express';
//import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import processRequest from 'graphql-upload/processRequest.mjs';

import { GraphQLSignSchema } from './sign/schema.js';
import { GraphQLRuleSchema } from './rules.js';

const schema = mergeSchemas({
  schemas: [GraphQLSignSchema, GraphQLRuleSchema],
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

        if (
          process.env.NODE_ENV == 'developement' ||
          [
            'Joel.Hudson@portlandoregon.gov',
            'Michael.McDonald@portlandoregon.gov',
            'Matthew.Machado@portlandoregon.gov',
            'Peter.Wojcicki@portlandoregon.gov',
            'Sabrina.Kao@portlandoregon.gov',
          ].find(
            u =>
              u.localeCompare(user.id, undefined, { sensitivity: 'base' }) == 0
          )
        ) {
          rules.push(
            {
              action: 'create',
              subject: 'sign',
            },
            {
              action: 'edit',
              subject: 'sign',
            }
          );
        }

        return rules;
      },
    },
    { id: 'reservation' }
  )
  //graphqlUploadExpress()
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

      if (contentType.startsWith('multipart/')) {
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
