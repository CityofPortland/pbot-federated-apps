import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('TBLS', { schema: 'public' })
@ObjectType()
export class Table {
  @PrimaryColumn({ name: 'TBL_ID', type: 'bigint' })
  id: number;

  @Column('character varying', {
    name: 'TBL_NAME',
    nullable: true,
    unique: true,
    length: 256,
    default: () => 'NULL::character varying',
  })
  @Field()
  name: string;

  @Column('bigint', { name: 'CREATE_TIME' })
  @Field()
  created: number;

  @Column('bigint', { name: 'LAST_ACCESS_TIME' })
  @Field()
  accessed: number;
}
