import { BaseEntityUserChanges } from '@pbotapps/common';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Application extends BaseEntityUserChanges {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;
}
