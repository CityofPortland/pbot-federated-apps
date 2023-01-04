import { Args, Ctx, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { getDataSource } from '../data-source.js';
import { Table } from '../table/entity.js';
import { ZoneType } from '../zone/entity.js';
import { Schema } from './entity.js';
import { FindSchemaInput } from './input.js';

export async function findSchema(
  context: { zone: string },
  args: FindSchemaInput
): Promise<Array<Schema>> {
  const { schema } = args;

  const zone = (args.zone || context.zone) as ZoneType;

  if (!zone)
    throw new Error(
      `Could not determine zone. Either pass a zone explicitly, or resolve this from a zone object.`
    );

  context.zone = zone;

  const schemas = await Promise.all(
    getDataSource(zone).map(source => {
      let query = source.getRepository(Schema).createQueryBuilder('schema');

      if (schema) {
        query = query.where('schema.name = :name', { name: schema });
      }

      return query
        .getMany()
        .then(schemas =>
          schemas.map(s => (s.zone = Promise.resolve({ name: zone })) && s)
        );
    })
  ).then(schemas => schemas.flat());

  return schemas || [];
}

@Resolver(() => Schema)
export class SchemaResolver {
  @Query(() => [Schema])
  findSchema(
    @Ctx() ctx,
    @Args() args: FindSchemaInput
  ): Promise<Array<Schema>> {
    return findSchema(ctx, args);
  }

  @FieldResolver(() => [Table])
  async tables(@Ctx() context, @Root() schema: Schema): Promise<Array<Table>> {
    const tables = await Promise.all(
      getDataSource(context.zone).map(
        async s =>
          await s
            .getRepository(Table)
            .createQueryBuilder('table')
            .innerJoin('DBS', 'dbs', 'dbs.DB_ID = "table"."DB_ID"')
            .where('dbs.DB_ID = :id', { id: schema.id })
            .getMany()
      )
    ).then(res => res.reduce((acc, curr) => acc.push(...curr) && acc, []));

    return tables || [];
  }
}
