import { ArgsType, Field, InputType } from 'type-graphql';

@InputType()
@ArgsType()
export class FindTableInput {
  @Field({ nullable: true })
  name?: string;
}
