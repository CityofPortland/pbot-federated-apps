import { ArgsType, Field, InputType } from 'type-graphql';
import { ZoneType } from '../zone/entity';

@InputType()
@ArgsType()
export class FindSchemaInput {
  @Field({ nullable: true })
  zone?: ZoneType;

  @Field({ nullable: true })
  schema?: string;
}
