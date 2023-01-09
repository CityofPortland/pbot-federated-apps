import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

@Entity('COLUMNS_V2', { schema: 'public' })
@ObjectType()
export class TableColumn {
  @Column('character varying', {
    name: 'COLUMN_NAME',
    primary: true,
    nullable: true,
    length: 767,
  })
  @Field()
  name: string;

  @Column({ name: 'CD_ID', primary: true })
  cdId: number;

  @Column('character varying', {
    name: 'COMMENT',
    nullable: true,
    length: 4000,
    default: () => 'NULL::character varying',
  })
  @Field({ nullable: true })
  description?: string | null;

  @Column('text', {
    name: 'TYPE_NAME',
    nullable: true,
  })
  @Field()
  type: string;

  @Column('int', {
    name: 'INTEGER_IDX',
    nullable: true,
  })
  @Field()
  index: number;
}
