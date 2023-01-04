import { IsEmail, MaxLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class NewUserInput {
  @Field()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @Field()
  @MaxLength(50)
  firstName: string;

  @Field()
  @MaxLength(50)
  lastName: string;
}

@InputType()
export class UpdateUserInput {
  @Field()
  uuid: string;

  @Field({ nullable: true })
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @Field({ nullable: true })
  @MaxLength(50)
  firstName?: string;

  @Field({ nullable: true })
  @MaxLength(50)
  lastName?: string;
}

@InputType()
export class UserRuleInput {
  @Field()
  userUuid: string;

  @Field()
  ruleUuid: string;
}
