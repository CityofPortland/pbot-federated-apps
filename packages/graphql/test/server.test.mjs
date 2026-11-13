import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import test from 'node:test';
import { buildSchema } from 'graphql';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import pino from 'pino';
import { createApp, createServer } from '../dist/server.js';

async function start(t, options = {}) {
  const logs = [];
  const logger = pino(
    new Writable({
      write(chunk, _encoding, done) {
        logs.push(JSON.parse(chunk));
        done();
      },
    })
  );
  const schema = buildSchema('type Query { hello: String, fail: String }');
  schema.getQueryType().getFields().hello.resolve = () => 'hello';
  schema.getQueryType().getFields().fail.resolve = () => {
    throw new Error('resolver failed');
  };
  const service = await createServer({
    application: 'test',
    schema,
    port: 0,
    logger,
    ...options,
  });
  t.after(
    () =>
      new Promise((resolve, reject) => {
        service.server.close(err => (err ? reject(err) : resolve()));
        service.server.closeAllConnections();
      })
  );
  return { ...service, schema, logs };
}

function query(url, query = '{ hello }', headers = {}) {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query }),
  });
}

test('app creation does not listen; GET, POST, probe and request logs work', async t => {
  const { app } = createApp({
    application: 'test',
    schema: buildSchema('type Query { hello: String }'),
  });
  assert.equal(typeof app, 'function');
  const { logs } = await start(t);
  assert.deepEqual(await (await query(url)).json(), {
    data: { hello: 'hello' },
  });
  assert.deepEqual(
    await (
      await fetch(`${url}?query=${encodeURIComponent('{ hello }')}`)
    ).json(),
    { data: { hello: 'hello' } }
  );
  assert.equal(await (await fetch(`${url}probe`)).text(), 'Success!');
  const completed = logs.filter(log => log.msg === 'request completed');
  assert.equal(completed.length, 3);
  assert.equal(completed[0].application, 'test');
  assert.ok(completed[0].req.id);
  assert.equal(completed[1].req.path, '/');
  assert.equal(completed[1].req.headers, undefined);
});

test('middleware user/rules and custom context reach resolvers; loaders are per request', async t => {
  const contexts = [];
  const order = [];
  let loaderCount = 0;
  const { schema, url, logs } = await start(t, {
    handlers: [
      (req, _res, next) => {
        order.push('user');
        req.user = { id: 'user' };
        next();
      },
      async (req, _res, next) => {
        order.push('rules');
        req.rules = [{ action: 'read' }];
        next();
      },
    ],
    loaderCallback: () => ({ request: { id: ++loaderCount } }),
    context: async () => ({ client: 'custom-client' }),
  });
  schema.getQueryType().getFields().hello.resolve = (_root, _args, context) => {
    contexts.push(context);
    context.logger.info('resolver log');
    return context.user.id;
  };
  for (let i = 0; i < 2; i++) {
    assert.deepEqual(await (await query(url)).json(), {
      data: { hello: 'user' },
    });
  }
  assert.deepEqual(order, ['user', 'rules', 'user', 'rules']);
  assert.equal(contexts[0].client, 'custom-client');
  assert.equal(contexts[0].application, 'test');
  assert.deepEqual(contexts[0].rules, [{ action: 'read' }]);
  assert.notEqual(contexts[0].loaders, contexts[1].loaders);
  assert.equal(loaderCount, 2);
  assert.equal(
    logs.find(log => log.msg === 'resolver log').req.id,
    logs.find(log => log.msg === 'request completed').req.id
  );
});

test('required authentication blocks GraphQL but leaves health and preflight available', async t => {
  const { url } = await start(t, { requireToken: true });
  assert.equal((await query(url)).status, 401);
  assert.equal((await fetch(`${url}probe`)).status, 200);
  assert.equal(
    (
      await fetch(url, {
        method: 'OPTIONS',
        headers: { origin: 'https://example.com' },
      })
    ).status,
    204
  );
});

test('custom path and allowed origins are honored', async t => {
  const { url } = await start(t, {
    path: '/graphql',
    allowedOrigins: ['https://allowed.example'],
  });
  const allowed = await query(url, '{ hello }', {
    origin: 'https://allowed.example',
  });
  assert.equal(
    allowed.headers.get('access-control-allow-origin'),
    'https://allowed.example'
  );
  const denied = await query(url, '{ hello }', {
    origin: 'https://denied.example',
  });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  assert.equal((await fetch(new URL('/', url))).status, 404);
});

test('resolver failures are logged even with HTTP 200', async t => {
  const { url, logs } = await start(t);
  const response = await query(url, '{ fail }');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).errors[0].message, 'resolver failed');
  const error = logs.find(log => log.msg === 'GraphQL operation failed');
  assert.equal(error.err.message, 'resolver failed');
  assert.deepEqual(error.path, ['fail']);
  assert.ok(error.req.id);
});

test('rejected middleware and context callbacks yield logged 500 responses', async t => {
  for (const options of [
    {
      handlers: [
        async () => {
          throw new Error('middleware failed');
        },
      ],
    },
    {
      context: async () => {
        throw new Error('context failed');
      },
    },
  ]) {
    const { url, logs } = await start(t, options);
    const response = await query(url);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Internal server error' });
    assert.ok(logs.some(log => log.msg === 'Request failed'));
  }
});

test('custom multipart parser receives the raw request and response', async t => {
  const { url } = await start(t, {
    parseRequestParams: async req => {
      assert.ok(req.headers['content-type'].startsWith('multipart/'));
      assert.equal(req.context.res.req, req.raw);
      return { query: '{ hello }' };
    },
  });
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data; boundary=test' },
    body: '--test--',
  });
  assert.deepEqual(await response.json(), { data: { hello: 'hello' } });
});

test('malformed requests and invalid GraphQL receive errors', async t => {
  const { url } = await start(t);
  const malformed = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });
  assert.equal(malformed.status, 400);
  const invalid = await query(url, '{ missing }', {
    accept: 'application/graphql-response+json',
  });
  assert.equal(invalid.status, 400);
  assert.ok((await invalid.json()).errors.length);
});

test('federation schemas still expose _service', async t => {
  const schema = buildSubgraphSchema({
    typeDefs: gql`
      type Query {
        hello: String
      }
    `,
  });
  const { url } = await start(t, { schema });
  const result = await (await query(url, '{ _service { sdl } }')).json();
  assert.match(result.data._service.sdl, /type Query/);
});

test('listen errors reject startup', async t => {
  const { server, schema } = await start(t);
  await assert.rejects(
    createServer({
      application: 'test',
      schema,
      port: server.address().port,
      logger: pino({ enabled: false }),
    }),
    { code: 'EADDRINUSE' }
  );
});
