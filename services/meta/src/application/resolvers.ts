import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { scrollSearch } from '@pbotapps/elasticsearch';
import { Context } from '@pbotapps/graphql';
import { BaseType, BaseUserChangeableType } from '@pbotapps/objects';
import { ok } from 'assert';

import { Application } from './type.js';
import { FindApplicationInput } from './input.js';
import { Rule } from '../rule/type.js';
import { elasticsearchClient } from '../client.js';
import { User } from '../user/type.js';

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    applications: async (_, { input }: { input: FindApplicationInput }) => {
      const { id } = input || {};

      const results = new Array<Application>();

      if (id) {
        for await (const hit of scrollSearch<Omit<Application, 'id'>>(
          elasticsearchClient,
          {
            index: 'metabase_application',
            query: {
              match: {
                name: id,
              },
            },
          }
        )) {
          results.push({ id: hit.id, ...hit._source });
        }
      } else {
        for await (const hit of scrollSearch<Omit<Application, 'id'>>(
          elasticsearchClient,
          {
            index: 'metabase_application',
            query: {
              match_all: {},
            },
          }
        )) {
          results.push({ id: hit.id, ...hit._source });
        }
      }

      return results;
    },
  },
  Mutation: {
    addApplication: async (
      _,
      { input }: { input: Omit<Application, keyof BaseUserChangeableType> },
      context
    ) => {
      const { name, ...rest } = input;

      ok(
        !(await elasticsearchClient.exists({
          index: 'metabase_application',
          id: name,
        })),
        `Application with name '${name}' already exists!`
      );

      const _created = new Date();
      const _createdBy = context.user.id;

      const app: Omit<Application, 'id'> = {
        _created,
        _createdBy,
        _changed: _created,
        _changedBy: _createdBy,
        name,
        ...rest,
      };

      await elasticsearchClient.index<Omit<Application, 'id'>>({
        index: 'metabase_application',
        id: name,
        document: app,
      });

      return { id: name, ...app };
    },
    updateApplication: async (
      _,
      {
        id,
        input,
      }: {
        id: string;
        input: Omit<Application, keyof BaseUserChangeableType>;
      },
      context
    ) => {
      ok(
        await elasticsearchClient.exists({
          index: 'metabase_application',
          id: id,
        }),
        `Application with id '${id}' does not exists!`
      );

      const result = await elasticsearchClient
        .get<Application>({
          index: 'metabase_application',
          id: id,
        })
        .then(hit => ({ id: hit.id, ...hit._source }));

      const _changed = new Date();
      const _changedBy = context.user.id;

      const { id: id, ...app } = {
        ...result,
        ...input,
        _changed,
        _changedBy,
      };

      await elasticsearchClient.index<Omit<Application, 'id'>>({
        index: 'metabase_application',
        id: id,
        document: app,
      });

      return { id: id, ...app };
    },
    deleteApplication: (_, { id }: Pick<Application, keyof BaseType>) => {
      return elasticsearchClient.delete({
        index: 'metabase_application',
        id: id,
      });
    },
  },
  Rule: {
    application: (rule: Rule) =>
      elasticsearchClient
        .get<Omit<Application, 'id'>>({
          index: 'metabase_application',
          id: rule.applicationId,
        })
        .then(hit => ({ id: hit.id, ...hit._source })),
  },
  User: {
    applications: async (user: User) => {
      user = await elasticsearchClient
        .get<Omit<User, 'id'>>({
          index: 'metabase_user',
          id: user.id,
        })
        .then(hit => ({ id: hit.id, ...hit._source }));

      if (!user.rules) return undefined;

      const promises = user.rules.map(id =>
        elasticsearchClient
          .get<Rule>({
            index: 'metabase_rule',
            id: id,
          })
          .then(hit => ({ id: hit.id, ...hit._source }))
      );

      const applications = await Promise.all(promises).then(rules =>
        rules.reduce(
          (acc, curr) => acc.add(curr.applicationId),
          new Set<string>()
        )
      );

      return Promise.all(
        [...applications.values()].map(app =>
          elasticsearchClient
            .get<Omit<Application, 'id'>>({
              index: 'metabase_application',
              id: app,
            })
            .then(hit => ({ id: hit.id, ...hit._source }))
        )
      );
    },
  },
};

export default resolvers;
