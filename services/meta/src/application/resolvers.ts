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
      const { _id } = input || {};

      const results = new Array<Application>();

      if (_id) {
        for await (const hit of scrollSearch<Omit<Application, '_id'>>(
          elasticsearchClient,
          {
            index: 'metabase_application',
            query: {
              match: {
                name: _id,
              },
            },
          }
        )) {
          results.push({ _id: hit._id, ...hit._source });
        }
      } else {
        for await (const hit of scrollSearch<Omit<Application, '_id'>>(
          elasticsearchClient,
          {
            index: 'metabase_application',
            query: {
              match_all: {},
            },
          }
        )) {
          results.push({ _id: hit._id, ...hit._source });
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
      const _createdBy = context.user._id;

      const app: Omit<Application, '_id'> = {
        _created,
        _createdBy,
        _changed: _created,
        _changedBy: _createdBy,
        name,
        ...rest,
      };

      await elasticsearchClient.index<Omit<Application, '_id'>>({
        index: 'metabase_application',
        id: name,
        document: app,
      });

      return { _id: name, ...app };
    },
    updateApplication: async (
      _,
      {
        _id,
        input,
      }: {
        _id: string;
        input: Omit<Application, keyof BaseUserChangeableType>;
      },
      context
    ) => {
      ok(
        await elasticsearchClient.exists({
          index: 'metabase_application',
          id: _id,
        }),
        `Application with id '${_id}' does not exists!`
      );

      const result = await elasticsearchClient
        .get<Application>({
          index: 'metabase_application',
          id: _id,
        })
        .then(hit => ({ _id: hit._id, ...hit._source }));

      const _changed = new Date();
      const _changedBy = context.user._id;

      const { _id: id, ...app } = {
        ...result,
        ...input,
        _changed,
        _changedBy,
      };

      await elasticsearchClient.index<Omit<Application, '_id'>>({
        index: 'metabase_application',
        id: id,
        document: app,
      });

      return { _id: id, ...app };
    },
    deleteApplication: (_, { _id }: Pick<Application, keyof BaseType>) => {
      return elasticsearchClient.delete({
        index: 'metabase_application',
        id: _id,
      });
    },
  },
  Rule: {
    application: (rule: Rule) =>
      elasticsearchClient
        .get<Omit<Application, '_id'>>({
          index: 'metabase_application',
          id: rule.applicationId,
        })
        .then(hit => ({ _id: hit._id, ...hit._source })),
  },
  User: {
    applications: async (user: User) => {
      user = await elasticsearchClient
        .get<Omit<User, '_id'>>({
          index: 'metabase_user',
          id: user._id,
        })
        .then(hit => ({ _id: hit._id, ...hit._source }));

      if (!user.rules) return undefined;

      const promises = user.rules.map(_id =>
        elasticsearchClient
          .get<Rule>({
            index: 'metabase_rule',
            id: _id,
          })
          .then(hit => ({ _id: hit._id, ...hit._source }))
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
            .get<Omit<Application, '_id'>>({
              index: 'metabase_application',
              id: app,
            })
            .then(hit => ({ _id: hit._id, ...hit._source }))
        )
      );
    },
  },
};

export default resolvers;
