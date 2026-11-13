# PBOT GraphQL Server

This service provides GraphQL data for PBOT web applications.

Run these commands from the repository root using the pnpm version specified in the root `package.json`.

## Development

### Install dependencies

```sh
pnpm install --frozen-lockfile
```

### Start a development server

```sh
pnpm --filter './services/legacy' run dev
```

Nodemon watches the service source, builds the service and its workspace dependencies, and starts `dist/server.js` after each change.

The GraphQL endpoint is http://localhost:4000/ by default; set `PORT` to change the port. The health endpoint is http://localhost:4000/probe. The service does not provide an interactive GraphQL browser UI.

### Create a production-ready build

```sh
pnpm --filter './services/legacy...' run build
```

This builds the service and its workspace dependencies. The service's `postbuild` script copies its static document JSON files into `dist/document`.

## Document content

Documents are cloned and compiled on their first GraphQL request. Concurrent initial requests share the same load. Rendered sections are cached in memory per document and per service process; Metalsmith processes the content without writing a build directory.

After five minutes, the next request starts a background Git update while returning cached sections. Only a changed commit triggers compilation. Successful compilation replaces the cache; failed updates or compilation retain the previous content and are retried after the refresh interval. First-load failures reject the request and can be retried on the next request.

Set `DOCUMENT_REFRESH_INTERVAL_MS` to a positive number of milliseconds to change the interval. Missing or invalid values use five minutes. Refreshes are driven by requests, with at most one update/compilation in flight per document. Existing checkouts use fast-forward-only pulls.

After building, run the isolated document cache regression tests:

```sh
node --test services/legacy/test/document-cache.test.mjs
```
