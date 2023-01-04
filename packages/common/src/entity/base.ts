import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  uuid: string;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  changed: Date;
}

@ObjectType()
export class BaseEntityUserChanges extends BaseEntity {
  @Column({ length: 40 })
  @Field()
  createdBy: string;

  @Column()
  @Field()
  changedBy: string;
}
