import { createBaseResolver } from '@pbotapps/common';
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from 'type-graphql';
import knex from '../data-source.js';
import { Rule } from './entity.js';
import { User } from '../user/entity';
import { NewRuleInput, UpdateRuleInput } from './input';

const BaseResolver = createBaseResolver(Rule, knex, {
  tableName: 'rule',
});

@Resolver(() => Rule)
export class RuleResolver extends BaseResolver {
  @Mutation(() => Rule, { name: `addRule` })
  @Authorized<Partial<Rule>>([{ subject: 'rule', action: 'create' }])
  async create(
    @Arg('data') data: NewRuleInput,
    @Ctx('user') user: User
  ): Promise<Rule> {
    const { applicationUuid, ...rest } = data;

    const rule = await knex<Rule>('rule')
      .insert({
        ...rest,
        application_uuid: applicationUuid,
        createdBy: user.uuid,
        changedBy: user.uuid,
      })
      .returning('uuid');

    return knex<Rule>('rule').select('*').where({ uuid: rule[0].uuid }).first();
  }

  @Mutation(() => Rule, { name: `updateRule` })
  @Authorized()
  async update(
    @Arg('data') data: UpdateRuleInput,
    @Ctx('user') user: User
  ): Promise<Rule> {
    const { uuid, applicationUuid, ...rest } = data;

    const rule = await knex<Rule>('rule')
      .where({ uuid })
      .update({ ...rest, changed: new Date(), changedBy: user.uuid })
      .returning('uuid');

    return knex<Rule>('rule').where({ uuid: rule[0].uuid }).select('*').first();
  }

  @FieldResolver(() => [User], { nullable: true })
  async users(@Root() rule: Rule): Promise<Array<User> | undefined> {
    return knex('user_rule')
      .where('rule_uuid', rule.uuid)
      .leftJoin('user', builder => {
        builder.on('user.uuid', '=', 'user_rule.user_uuid');
      })
      .select('user.*');
  }
}
