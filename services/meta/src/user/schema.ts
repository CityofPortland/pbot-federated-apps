import { createRepository, Repository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import {
  GraphQLUserAddInputType,
  GraphQLUserEditInputType,
  GraphQLUserType,
  User,
  UserAddInput,
  UserEditInput,
} from './types.js';
import { Rule } from '../rule/types.js';

export const GraphQLUserSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        me: {
          type: GraphQLUserType,
          async resolve(_root, _args, { user }: Context) {
            const repo = await createRepository<User>('meta', 'user');

            return repo.get(user.id);
          },
        },
        users: {
          type: new GraphQLList(GraphQLUserType),
          async resolve() {
            const repo = await createRepository<User>('meta', 'user');

            return repo.getAll();
          },
        },
      };
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addUser: {
        type: GraphQLUserType,
        args: {
          applicationId: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLUserAddInputType),
          },
        },
        async resolve(
          _,
          {
            payload,
          }: {
            payload: UserAddInput;
          },
          { rules, user }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to add users');
          }

          if (
            !rules ||
            !rules.some(
              rule => rule.subject == 'user' && ['add'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to add users');

          const u: Partial<User> = {
            created: new Date(),
            creator: user.id,
            updated: new Date(),
            updater: user.id,
            ...payload,
          };

          return createRepository<Partial<User>>('meta', 'user').then(repo =>
            repo.add(u)
          );
        },
      },
      addRuleToUser: {
        type: GraphQLUserType,
        args: {
          ruleId: { type: new GraphQLNonNull(GraphQLID) },
          userId: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(
          _,
          { ruleId, userId }: { ruleId: string; userId: string },
          { rules: userRules }
        ) {
          const rules = await createRepository<Rule>('meta', 'rule');
          const rule = await rules.get(ruleId);

          // does the current user have permission to assign rules
          // either for this application or for all applications?
          if (
            !userRules ||
            !userRules
              .filter(
                r =>
                  r.application == undefined ||
                  r.application?.id == rule.applicationId
              )
              .some(r => r.subject == 'rule' && ['assign'].includes(r.action))
          )
            throw new Error('Unauthorized to assign rules');

          const users = await createRepository<User>('meta', 'user');
          const user = await users.get(userId);

          user.rules = Array.from(new Set<string>([...user.rules, rule.id]));

          return users.edit(user, user.id);
        },
      },
      editUser: {
        type: GraphQLUserType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLUserEditInputType),
          },
        },
        async resolve(
          _,
          {
            id,
            payload,
          }: {
            id: string;
            payload: UserEditInput;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit users');
          }

          if (
            !rules ||
            !rules
              .filter(
                rule => rule.subject == 'user' && ['edit'].includes(rule.action)
              )
              .some(
                rule =>
                  rule.conditions == undefined ||
                  rule.conditions['id'] == undefined ||
                  rule.conditions['id'] == id
              )
          )
            throw new Error('Unauthorized to edit user');

          const u = {
            updated: new Date(),
            updater: user.id,
            ...payload,
          };

          return createRepository<Partial<User>>('meta', 'user').then(repo =>
            repo.edit(u, id)
          );
        },
      },
      removeRuleFromUser: {
        type: GraphQLUserType,
        args: {
          ruleId: { type: new GraphQLNonNull(GraphQLID) },
          userId: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(
          _,
          { ruleId, userId }: { ruleId: string; userId: string },
          { rules }
        ) {
          const ruleRepository: Repository<Rule> = await createRepository<Rule>(
            'meta',
            'rule'
          );

          const rule = await ruleRepository.get(ruleId);

          if (
            !rules ||
            !rules
              .filter(
                r =>
                  // can assign rules for any application
                  r.conditions == undefined ||
                  r.conditions['id'] == undefined ||
                  // can asign rules for this rule's application
                  r.conditions['id'] == rule.applicationId
              )
              .some(r => r.subject == 'rule' && ['assign'].includes(r.action))
          )
            throw new Error('Unauthorized to edit user');

          const userRepository = await createRepository<User>('meta', 'user');

          const user = await userRepository.get(userId);

          user.rules = user.rules.filter(rule => rule != ruleId);

          return userRepository.edit(user, user.id);
        },
      },
    },
  }),
  types: [GraphQLUserType],
});
