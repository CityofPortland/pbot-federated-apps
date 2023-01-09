import { MaxLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType()
export class NewApplicationInput {
  @Field()
  @MaxLength(50)
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateApplicationInput {
  @Field()
  uuid: string;

  @Field({ nullable: true })
  @MaxLength(50)
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class AddRuleInput {
  @Field()
  applicationUuid: string;

  @Field()
  ruleUuid: string;
}
