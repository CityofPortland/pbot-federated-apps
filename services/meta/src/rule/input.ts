import { ObjectScalarType } from '@pbotapps/common';
import { MaxLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType()
export class NewRuleInput {
  @Field({ defaultValue: false })
  inverted: boolean;

  @Field()
  @MaxLength(50)
  action: string;

  @Field()
  @MaxLength(50)
  subject: string;

  @Field(_type => ObjectScalarType, { nullable: true })
  conditions?: any;

  @Field(_type => ObjectScalarType, { nullable: true })
  fields?: any;

  @Field()
  applicationUuid: string;
}

@InputType()
export class UpdateRuleInput {
  @Field()
  uuid: string;

  @Field({ nullable: true })
  inverted?: boolean;

  @Field({ nullable: true })
  @MaxLength(50)
  action?: string;

  @Field({ nullable: true })
  @MaxLength(50)
  subject?: string;

  @Field(_type => ObjectScalarType, { nullable: true })
  conditions?: any;

  @Field(_type => ObjectScalarType, { nullable: true })
  fields?: any;

  @Field({ nullable: true })
  applicationUuid?: string;
}
