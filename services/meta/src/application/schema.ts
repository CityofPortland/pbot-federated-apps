import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import {
  GraphQLApplicationAddInputType,
  GraphQLApplicationEditInputType,
  GraphQLApplicationType,
  Application,
  ApplicationAddInput,
  ApplicationEditInput,
} from './types.js';

export const GraphQLApplicationSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        application: {
          type: GraphQLApplicationType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
          },
          async resolve(_parent, { id }: { id: string }) {
            const repo = await createRepository<Application>(
              'meta',
              'application'
            );

            return repo.get(id);
          },
        },
        applications: {
          type: new GraphQLList(GraphQLApplicationType),
          async resolve() {
            const repo = await createRepository<Application>(
              'meta',
              'application'
            );

            return repo.getAll();
          },
        },
      };
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addApplication: {
        type: GraphQLApplicationType,
        args: {
          payload: {
            type: new GraphQLNonNull(GraphQLApplicationAddInputType),
          },
        },
        async resolve(
          _,
          args: { payload: ApplicationAddInput },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to add applications');
          }

          if (
            !rules ||
            !rules.some(
              rule =>
                rule.subject == 'application' && ['add'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to add applications');

          const repo = await createRepository<Partial<Application>>(
            'meta',
            'application'
          );

          const existing = await repo.query(
            'select a.id from a where a.name = @name',
            [{ name: '@name', value: args.payload.name }]
          );

          if (existing.length > 0) {
            throw new Error(
              `An application with the name ${args.payload.name} already exists!`
            );
          }

          const hotel: Partial<Application> = {
            created: new Date(),
            creator: user.id,
            updated: new Date(),
            updater: user.id,
            ...args.payload,
          };

          return repo.add(hotel);
        },
      },
      editApplication: {
        type: GraphQLApplicationType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLApplicationEditInputType),
          },
        },
        async resolve(
          _,
          args: {
            id: string;
            payload: ApplicationEditInput;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit applications');
          }

          if (
            !rules ||
            !rules.some(
              rule =>
                rule.subject == 'application' && ['edit'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to edit applications');

          return createRepository<Partial<Application>>(
            'meta',
            'application'
          ).then(repo =>
            repo.edit(
              {
                updated: new Date(),
                updater: user.id,
                ...args.payload,
              },
              args.id
            )
          );
        },
      },
    },
  }),
  types: [GraphQLApplicationType],
});
