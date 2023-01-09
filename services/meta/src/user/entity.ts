import { BaseEntity } from '@pbotapps/common';
import { IsEmail } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class User extends BaseEntity {
  @IsEmail()
  @Field()
  email: string;

  @Field({ name: 'firstName' })
  first_name: string;

  @Field({ name: 'lastName' })
  last_name: string;

  @Field({ name: 'oauthId' })
  oauth_id: string;
}
