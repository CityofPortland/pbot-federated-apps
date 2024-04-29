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
} from './types.js';

export const GraphQLApplicationSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        applications: {
          type: new GraphQLList(GraphQLApplicationType),
          async resolve(_parent, _args, { rules }: Context) {
            if (
              !rules ||
              !rules.some(
                rule =>
                  rule.subject == 'application' &&
                  ['add', 'edit', 'read'].includes(rule.action)
              )
            )
              throw new Error('Unauthorized to list appliations');

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
          args: { payload: Pick<Application, 'name' | 'description'> },
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

          const hotel: Partial<Application> = {
            created: new Date(),
            creator: user._id,
            updated: new Date(),
            updater: user._id,
            ...args.payload,
          };

          return createRepository<Partial<Application>>('meta', 'application')
            .then(repo => repo.add(hotel))
            .then(hotel => hotel);
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
            payload: Pick<Application, 'description' | 'name'>;
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

          const app = {
            updated: new Date(),
            updater: user._id,
            ...args.payload,
          };

          return createRepository<Partial<Application>>(
            'meta',
            'application'
          ).then(repo => repo.edit(app, args.id));
        },
      },
    },
  }),
  types: [GraphQLApplicationType],
});
