import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TableColumn } from '../column/entity.js';
import { getDataSource } from '../data-source.js';
import { Table } from './entity.js';

@Resolver(() => Table)
export class TableResolver {
  @FieldResolver(() => [TableColumn], { nullable: true })
  async columns(
    @Ctx() ctx,
    @Root() table: Table
  ): Promise<Array<TableColumn> | undefined> {
    const columns = await Promise.all(
      getDataSource(ctx.zone).map(
        async source =>
          await source
            .getRepository(TableColumn)
            .createQueryBuilder('col')
            .innerJoin('CDS', 'cds', '"cds"."CD_ID" = "col"."CD_ID"')
            .innerJoin('SDS', 'sds', '"sds"."CD_ID" = "cds"."CD_ID"')
            .innerJoin('TBLS', 'tbls', '"tbls"."SD_ID" = "sds"."SD_ID"')
            .where('"tbls"."TBL_ID" = :id', { id: table.id })
            .getMany()
      )
    ).then(columns => columns.flat());

    return columns;
  }
}
