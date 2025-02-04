import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { GraphQLRuleType } from '../rule/types.js';

export type User = Base & {
  oauthId: string;
  email: string;
  firstName: string;
  lastName: string;
  rules: Array<string>;
};

export type UserAddInput = Pick<User, 'email' | 'firstName' | 'lastName'>;
export type UserEditInput = Partial<UserAddInput>;

export const GraphQLUserType = new GraphQLObjectType<User>({
  name: 'User',
  description: 'A user with rules for applications',
  fields() {
    return {
      ...baseFields(),
      oauthId: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      rules: {
        type: new GraphQLList(GraphQLRuleType),
        async resolve(user: User) {
          const promises = user.rules.map(ruleId =>
            createRepository<Partial<User>>('meta', 'rule').then(repo =>
              repo.get(ruleId)
            )
          );

          return Promise.all(promises);
        },
      },
      addRule: {
        type: GraphQLRuleType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(
          root: User,
          { id }: { id: string },
          { rules, user }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit rules');
          }

          if (
            !rules ||
            !rules.some(
              rule => rule.subject == 'rule' && ['edit'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to edit rules');

          return createRepository<Partial<User>>('meta', 'user').then(repo =>
            repo.edit(
              {
                ...root,
                rules: [...root.rules, id],
              },
              root.id
            )
          );
        },
      },
    };
  },
});

export const GraphQLUserAddInputType = new GraphQLInputObjectType({
  name: 'UserAddInput',
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const GraphQLUserEditInputType = new GraphQLInputObjectType({
  name: 'UserEditInput',
  fields: {
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
  },
});
