import { createBaseResolver } from '@pbotapps/common';
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import knex from '../data-source.js';
import { Rule } from '../rule/entity.js';
import { User } from './entity.js';
import { NewUserInput, UpdateUserInput, UserRuleInput } from './input';

const tableName = 'user';

const BaseResolver = createBaseResolver(User, knex, { tableName });

export async function me(_root, _args, context) {
  return knex<User>(tableName).where({ oauth_id: context.token.oid }).first();
}

export const resolverMap = {
  Query: {
    me,
  },
  Mutation: {
    createUser: async (_mutation, data: NewUserInput, _context) => {
      const { uuid } = await knex<User>(tableName)
        .insert({ ...data })
        .returning('uuid')
        .first();

      return knex<User>(tableName).where({ uuid }).first();
    },
  },
};

@Resolver(() => User)
export class UserResolver extends BaseResolver {
  @Query(() => User)
  @Authorized()
  async me(@Ctx() context) {
    return context.user;
  }

  @Mutation(() => User, { name: `addUser` })
  @Authorized<Partial<Rule>>([{ action: 'create', subject: 'user' }])
  async create(@Arg('data') data: NewUserInput) {
    const user = await knex<User>(tableName)
      .insert({ ...data })
      .returning('uuid')
      .first();

    return knex<User>(tableName).where({ uuid: user.uuid }).first();
  }

  @Mutation(() => User, { name: `updateUser` })
  @Authorized()
  async update(@Arg('data') data: UpdateUserInput) {
    const { uuid, ...rest } = data;

    await knex<User>(tableName)
      .where({ uuid })
      .update({ ...rest });

    return knex<User>(tableName).where({ uuid }).first();
  }

  @FieldResolver(() => [Rule])
  async rules(
    @Root() user: User,
    @Arg('application_uuid') application?: string
  ) {
    let query = knex('user_rule').where({
      user_uuid: user.uuid,
    });

    if (application) {
      query = query.where({
        application_uuid: application,
      });
    }

    return query
      .join('rule', builder => {
        builder.on('rule.uuid', '=', 'user_rule.rule_uuid');
      })
      .select<Rule[]>('rule.*');
  }

  @Mutation(() => User)
  @Authorized()
  async addRuleToUser(@Arg('data') data: UserRuleInput): Promise<User> {
    const { userUuid, ruleUuid } = data;

    const op = knex('user_rule').insert({
      user_uuid: userUuid,
      rule_uuid: ruleUuid,
    });

    const user = knex<User>(tableName)
      .select('*')
      .where({ uuid: userUuid })
      .first();

    await op;

    return user;
  }

  @Mutation(() => User)
  @Authorized()
  async removeRuleFromUser(@Arg('data') data: UserRuleInput): Promise<User> {
    const { userUuid, ruleUuid } = data;

    const op = knex('user_rule')
      .where({
        user_uuid: userUuid,
        rule_uuid: ruleUuid,
      })
      .delete();

    const user = knex<User>(tableName)
      .select('*')
      .where({ uuid: userUuid })
      .first();

    await op;

    return user;
  }
}
