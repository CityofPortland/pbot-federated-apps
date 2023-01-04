# PBOT GraphQL Server

This repository is a GraphQL server to power PBOT web applications

## Development

### Install dependencies

```
pnpm install
```

### Start a development server

```
pnpm dev
```

This will create a `nodemon` process to watch the source code and re-build on changes. Once the build has been completed after each change, you can reach the interactive GraphQL server at http://localhost:4000/graphql

### Create a production-ready build

```
pnpm build
```
