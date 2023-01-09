import { createBaseResolver, User } from '@pbotapps/common';
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
import { Rule } from '../rule/entity.js';
import { Application } from './entity.js';
import { NewApplicationInput, UpdateApplicationInput } from './input';

const TABLE_NAME = 'application';

const BaseResolver = createBaseResolver(Application, knex, {
  tableName: 'application',
});

@Resolver(() => Application)
export class ApplicationResolver extends BaseResolver {
  @Mutation(() => Application, { name: `addApplication` })
  @Authorized()
  async create(
    @Arg('data') data: NewApplicationInput,
    @Ctx('user') user: User
  ): Promise<Application> {
    const application = await knex<Application>(TABLE_NAME)
      .insert({
        ...data,
        createdBy: user.uuid,
        changedBy: user.uuid,
      })
      .returning('uuid');

    return knex<Application>(TABLE_NAME)
      .where({ uuid: application[0].uuid })
      .first();
  }

  @Mutation(() => Application, { name: `updateApplication` })
  @Authorized()
  async update(
    @Arg('data') data: UpdateApplicationInput,
    @Ctx('user') user: User
  ): Promise<Application> {
    const { uuid, ...rest } = data;

    const application = await knex<Application>(TABLE_NAME)
      .update({
        ...rest,
        changed: new Date(),
        changedBy: user.uuid,
      })
      .where({ uuid })
      .returning('uuid')
      .first();

    return knex<Application>(TABLE_NAME)
      .where({ uuid: application.uuid })
      .first();
  }

  @FieldResolver(() => [Rule], { nullable: true })
  async rules(@Root() app: Application): Promise<Array<Rule> | undefined> {
    return knex<Rule>('rule').where({ application_uuid: app.uuid }).select('*');
  }
}
