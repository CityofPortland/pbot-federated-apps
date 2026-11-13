import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSchema, graphql, parse, print } from 'graphql';
import { createApp } from 'vue';
import { createPinia, disposePinia } from 'pinia';
import { PiniaColada, useQueryCache } from '@pinia/colada';
import { query, type QueryOptions } from '../queries/query';
import { masterStreetPlansQuery } from '../queries/masterStreetPlans';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@pbotapps/components', () => ({ query: mocks.query }));
vi.mock('../store/map', () => ({
  defaultExtent: {
    xmin: 1,
    ymin: 2,
    xmax: 3,
    ymax: 4,
    spatialReference: { wkid: 3857 },
  },
}));

beforeEach(() => {
  mocks.query.mockReset();
  mocks.query.mockResolvedValue({ data: {} });
});

describe('structured GraphQL queries', () => {
  it('builds recursive fields with arguments, conditional selections and transport options', async () => {
    const response = { data: { masterStreetPlans: [] } };
    mocks.query.mockResolvedValue(response);
    expect(
      await query({
        field: 'masterStreetPlans',
        args: {
          bbox: [1, 2, 3.5, -4],
          spatialReference: 4326,
          unused: undefined,
        },
        select: {
          id: true,
          name: false,
          geometry: { select: { type: true, coordinates: true } },
          features: {
            args: { limit: 2 },
            select: { id: true, description: false },
          },
        },
        cache: false,
        url: '/graphql',
        headers: { authorization: 'test-token' },
      })
    ).toBe(response);

    expect(mocks.query).toHaveBeenCalledWith({
      operation: print(
        parse(`{
        masterStreetPlans(bbox: [1, 2, 3.5, -4], spatialReference: 4326) {
          id
          geometry { type coordinates }
          features(limit: 2) { id }
        }
      }`)
      ),
      cache: false,
      url: '/graphql',
      headers: { authorization: 'test-token' },
    });
  });

  it('executes escaped strings and recursive input values without changing their meaning', async () => {
    const schema = buildSchema(`
      input Filter {
        search: String!
        active: Boolean!
        count: Int!
        ratio: Float!
        optional: String
        omitted: String
        child: Filter
        values: [String]
      }
      type Query { echo(filter: Filter!): String! }
    `);
    const filter = {
      search: 'quotes " slash \\ newline\n\t } otherField { secret',
      active: false,
      count: 0,
      ratio: 1e-7,
      optional: null,
      omitted: undefined,
      child: { search: 'child', active: true, count: -2, ratio: 1.5 },
      values: ['one', null, 'two'],
    };
    mocks.query.mockImplementation(options =>
      graphql({
        schema,
        source: options.operation,
        rootValue: {
          echo: ({ filter }: { filter: unknown }) => JSON.stringify(filter),
        },
      })
    );

    const response = await query<{ echo: string }>({
      field: 'echo',
      args: { filter },
    });
    expect(response.errors).toBeUndefined();
    expect(response.data).toEqual({ echo: JSON.stringify(filter) });
  });

  it('preserves the plan list operation, response handling and cache bypass', async () => {
    const pinia = createPinia();
    createApp({}).use(pinia).use(PiniaColada);
    const cache = useQueryCache(pinia);
    const entry = cache.ensure(masterStreetPlansQuery);
    try {
      mocks.query.mockResolvedValueOnce({ data: { masterStreetPlans: [] } });
      expect(await cache.fetch(entry)).toMatchObject({
        data: [],
        status: 'success',
      });
      expect(mocks.query).toHaveBeenLastCalledWith({
        cache: false,
        operation: print(
          parse(`{
        masterStreetPlans(bbox: [1, 2, 3, 4], spatialReference: 3857) {
          id name description adopted document
          features { id }
          geometry { type coordinates }
        }
      }`)
        ),
      });
      mocks.query.mockResolvedValueOnce({
        data: { masterStreetPlans: [] },
        errors: [{ message: 'partial failure' }],
      });
      await expect(cache.fetch(entry)).rejects.toThrow('Unable to retrieve');
    } finally {
      disposePinia(pinia);
    }
  });

  it.each<QueryOptions>([
    { field: 'invalid field', select: { id: true } },
    { field: 'plans', args: { 'invalid-arg': 1 }, select: { id: true } },
    {
      field: 'plans',
      args: { filter: { 'invalid-key': 1 } },
      select: { id: true },
    },
    { field: 'plans', args: { bbox: [NaN] }, select: { id: true } },
    { field: 'plans', args: { limit: Infinity }, select: { id: true } },
    { field: 'plans', select: { 'invalid-field': true } },
    { field: 'plans', select: {} },
    { field: 'plans', select: { id: false } },
    { field: 'plans', select: { geometry: { select: {} } } },
  ])('rejects invalid query objects before transport: %j', async options => {
    await expect(query(options)).rejects.toThrow();
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
