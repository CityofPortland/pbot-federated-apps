import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Zone } from '../zone/entity';

@Entity('DBS', { schema: 'public' })
@ObjectType()
export class Schema {
  @PrimaryColumn({ name: 'DB_ID', type: 'bigint' })
  id: number;

  @Column('character varying', {
    name: 'NAME',
    nullable: true,
    unique: true,
    length: 128,
    default: () => 'NULL::character varying',
  })
  @Field()
  name: string;

  @Column('character varying', {
    name: 'DESC',
    nullable: true,
    length: 4000,
    default: () => 'NULL::character varying',
  })
  @Field()
  description: string | null;

  @Column('character varying', { name: 'DB_LOCATION_URI', length: 4000 })
  @Field()
  locationUri: string;

  @Field(() => Zone, { nullable: true })
  zone?: Promise<Zone>;
}
