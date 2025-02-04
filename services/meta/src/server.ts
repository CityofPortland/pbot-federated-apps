import { mergeSchemas } from '@graphql-tools/schema';
import {
  handleRules,
  handleToken,
  handleUser,
} from '@pbotapps/authorization/middleware';
import { RuleType } from '@pbotapps/authorization';
import { createRepository } from '@pbotapps/cosmos';
import { BaseType } from '@pbotapps/objects';
import cors from 'cors';
import { config } from 'dotenv';
import express, { Response, json } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';

import { GraphQLApplicationSchema } from './application/schema.js';
import { GraphQLRuleSchema } from './rule/schema.js';
import { GraphQLUserSchema } from './user/schema.js';
import { User } from './user/types.js';
import { Rule } from './rule/index.js';

if (process.env.NODE_ENV == 'development') {
  config();
}

const schema = mergeSchemas({
  schemas: [GraphQLApplicationSchema, GraphQLRuleSchema, GraphQLUserSchema],
});

// Create a express instance serving all methods on `/graphql`
// where the GraphQL over HTTP express request handler is
const app = express();

app.use(
  cors(),
  json(),
  handleToken({ fail: false }),
  handleUser({
    getUser: async user => {
      const repo = await createRepository<Partial<User>>('meta', 'user');
      const existing = await repo.get(user.id);

      if (existing) {
        return existing;
      }

      return repo.add({
        created: new Date(),
        creator: user.id,
        updated: new Date(),
        updater: user.id,
        ...user,
        rules: [],
      });
    },
  }),
  handleRules(
    {
      getRules: async ({ user }) => {
        const users = await createRepository<Partial<User>>('meta', 'user');

        const u = await users.get(user.id);

        // guaranteed we have a user by this point from above
        if (u.rules != undefined && u.rules.length > 0) {
          const apps = await createRepository<Partial<User>>(
            'meta',
            'application'
          );
          const repo = await createRepository<Partial<RuleType & Rule>>(
            'meta',
            'rule'
          );

          const rules = await Promise.all(u.rules.map(r => repo.get(r)));

          for (const rule of rules) {
            rule.application = (await apps.get(rule.applicationId)) as BaseType;
          }

          return rules;
        } else {
          return [];
        }
      },
    },
    { id: 'meta' }
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
  })
);

app.listen({ port: 4000 });
console.log('Listening to port 4000');
