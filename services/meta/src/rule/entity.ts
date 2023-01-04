import { BaseEntityUserChanges, ObjectScalarType } from '@pbotapps/common';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Rule extends BaseEntityUserChanges {
  /**
   * Whether the rule is to be considered 'cannot' instead of 'can'.
   */
  @Field({ defaultValue: false })
  inverted: boolean;

  /**
   * What action the user can or cannot perform.
   */
  @Field()
  action: string;

  /**
   * What object this rule applies to.
   */
  @Field()
  subject: string;

  /**
   * Template to evaluate on the context to determine if this rule applies.
   */
  @Field()
  conditions?: string;

  /**
   * Whether this rule is restricted to any fields.
   */
  @Field(_type => ObjectScalarType, { nullable: true })
  fields?: any;

  application_uuid: string;
}
