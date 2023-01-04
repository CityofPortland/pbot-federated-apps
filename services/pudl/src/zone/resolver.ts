import { Args, Ctx, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { Schema } from '../schema/entity';
import { findSchema } from '../schema/resolver';
import { Zone } from './entity';
import { FindZoneInput } from './input';

@Resolver(() => Zone)
export class ZoneResolver {
  @Query(() => [Zone])
  findZone(@Ctx() ctx, @Args() args: FindZoneInput): Zone[] {
    let zones: Array<Zone> = [{ name: 'raw' }, { name: 'enriched' }];

    if (!args.zone) {
      throw new Error('Zone argument is required!');
    }

    zones = zones.filter(z => z.name == args.zone);

    ctx.zone = zones.map(z => z.name);

    return zones;
  }

  @FieldResolver(() => [Schema], { nullable: true })
  async schemas(@Ctx() ctx, @Root() zone: Zone): Promise<Schema[]> {
    return findSchema(ctx, { zone: zone.name });
  }
}
