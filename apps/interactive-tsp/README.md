# Interactive Transportation System Plan

Run these commands from the repository root using the pnpm version specified in the root `package.json`.

## Project setup

```sh
pnpm install --frozen-lockfile
pnpm --filter './apps/interactive-tsp^...' run build
```

The second command builds the app's shared workspace dependencies.

## Development server

```sh
pnpm --filter './apps/interactive-tsp' run dev
```

## Production build

```sh
pnpm --filter './apps/interactive-tsp' run build
```

This runs `vue-tsc --noEmit` and then builds the app with Vite.

## Preview the production build

After building:

```sh
pnpm --filter './apps/interactive-tsp' run preview
```

## Lint and fix source files

```sh
pnpm --filter './apps/interactive-tsp' run lint
```

## Format source files

```sh
pnpm --filter './apps/interactive-tsp' run prettier
```

Both linting and formatting commands modify source files.

## Structured GraphQL queries

The app's `src/queries/query.ts` accepts one object separating the root `field`,
its `args`, and the return `select` tree:

```ts
const response = await query<{ masterStreetPlans?: MasterStreetPlan[] }>({
  field: 'masterStreetPlans',
  args: { bbox: [xmin, ymin, xmax, ymax], spatialReference: 4326 },
  select: {
    id: true,
    name: true,
    features: { select: { id: true } },
    geometry: { select: { type: true, coordinates: true } },
  },
  cache: false,
});
```

Select scalar fields with `true` and omit conditional fields with `false`.
Nested fields use the same `args`/`select` structure. Omit `select` for scalar
return values. Arguments support strings, finite numbers, booleans, null,
arrays and recursive input objects; undefined argument/input-object entries are
omitted. Strings are escaped by GraphQL's AST printer, not interpolated into
query text. GraphQL enums, variables, aliases, directives and fragments are not
part of this object API.

The wrapper preserves the shared transport's `{ data, errors }` response and
`cache`, `url` and `headers` options. Cache identity still includes serialized
argument values. Logging derives the field name from the object and never logs
argument values or selections. The generic describes the expected response; it
does not validate selections against the server schema.

## Cached plan lists and navigation

Pinia and Pinia Colada are installed before the router. The guard in `src/router/initialize-stores.ts` initializes the map and master street plan stores and waits for the master street plan list before navigation, including direct links and changes to the plan ID. Other routes retain their current loading behavior.

The list query in `src/queries/masterStreetPlans.ts` includes its bounding box and spatial reference in its cache key. Concurrent loads share one request, and successful results (including empty lists) stay fresh until manually refreshed or evicted from the cache. There is no automatic refetch on mount, window focus, or reconnect. The page observes the cached query and provides a Refresh plans button. Inactive query data can be evicted five minutes after leaving the page, so a later visit may fetch again. The store reads the cache directly rather than retaining a second copy of the list.

Navigation still completes if the list request fails, with the error and retry control displayed on the page. Failed refreshes preserve previous results. GraphQL errors or missing list data reject the query instead of being cached as a successful empty response. Selection, feature toggles, and ArcGIS layers remain in Pinia.

## Tests

```sh
pnpm --filter './apps/interactive-tsp' run test
```

These tests mock GraphQL and ArcGIS and cover cache reuse, concurrent initialization, refresh failures, and navigation timing.
