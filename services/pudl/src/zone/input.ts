import { ArgsType, Field, InputType } from 'type-graphql';

@InputType()
@ArgsType()
export class FindZoneInput {
  @Field({ nullable: true })
  zone: string;
}
