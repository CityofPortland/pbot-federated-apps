import { Field, ObjectType } from 'type-graphql';
import { Schema } from '../schema/entity';

const zones = ['enriched', 'raw'] as const;

export type ZoneType = typeof zones[number];

@ObjectType()
export class Zone {
  @Field()
  name: ZoneType;

  @Field(() => [Schema], { nullable: true })
  schemas?: Promise<Schema[]>;
}
