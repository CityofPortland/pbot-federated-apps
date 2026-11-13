import assert from 'node:assert/strict';
import { Console } from 'node:console';
import { once } from 'node:events';
import { request } from 'node:http';
import { Writable } from 'node:stream';
import { setTimeout } from 'node:timers/promises';
import { afterEach, test } from 'node:test';
import { createApp } from '../dist/app.js';
import { resetSync } from '@logtape/logtape';
import axios, { AxiosError } from 'axios';
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import {
  configureLogging,
  getLogger,
  traceResolvers,
} from '../dist/logging.js';
import { traceRequests } from '../dist/api/logging.js';

const originalLevel = process.env.LOG_LEVEL;
const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  resetSync();
  if (originalLevel === undefined) delete process.env.LOG_LEVEL;
  else process.env.LOG_LEVEL = originalLevel;
  if (originalEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnv;
});

function capture(level, environment = 'production') {
  if (level === undefined) delete process.env.LOG_LEVEL;
  else process.env.LOG_LEVEL = level;
  process.env.NODE_ENV = environment;
  const records = [];
  const logger = configureLogging(
    new Console(
      new Writable({
        write(line, _encoding, done) {
          records.push(JSON.parse(line));
          done();
        },
      })
    )
  );
  return { logger, records };
}

test('defaults to quiet production logs, debug in development, and honors overrides', () => {
  for (const [level, environment, expected] of [
    [undefined, 'production', ['INFO', 'WARN']],
    [undefined, 'development', ['DEBUG', 'INFO', 'WARN']],
    ['warning', 'development', ['WARN']],
    ['warn', 'development', ['WARN']],
    ['off', 'development', []],
    ['silent', 'development', []],
  ]) {
    const { records } = capture(level, environment);
    const logger = getLogger(['legacy', 'test']);
    logger.debug('debug event');
    logger.info('info event');
    logger.warning('warning event');
    assert.deepEqual(
      records.map(record => record.level),
      expected
    );
  }
  process.env.LOG_LEVEL = 'invalid';
  assert.throws(() => configureLogging(), /Invalid LOG_LEVEL/);
});

for (const level of ['debug', 'info']) {
  test(`correlates concurrent requests at ${level} without logging private data`, async () => {
    const { records } = capture(level);
    const upstream = axios.create({
      adapter: async config => {
        await setTimeout(config.params.delay);
        if (config.params.fail) {
          throw new AxiosError(
            'private-error',
            'ERR_BAD_RESPONSE',
            config,
            undefined,
            { status: 503, data: 'private-body', headers: {}, config }
          );
        }
        return { data: { value: 7 }, status: 200, headers: {}, config };
      },
    });
    traceRequests(upstream, 'test');
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          slow: {
            type: GraphQLInt,
            args: { secret: { type: GraphQLString } },
            resolve: async (_root, _args, context) => {
              context.logger.info('Resolver context log');
              const result = await upstream.get('/private-url', {
                params: { delay: 30, key: 'private-key' },
                headers: { authorization: 'private-token' },
              });
              return result.data.value;
            },
          },
          broken: {
            type: GraphQLInt,
            resolve: () =>
              upstream.get('/private-url', {
                params: { delay: 1, fail: true },
              }),
          },
        },
      }),
    });
    traceResolvers(schema);
    const app = createApp(schema);
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
      const url = `http://127.0.0.1:${server.address().port}/`;
      const [slow, broken] = await Promise.all([
        fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-request-id': 'private-client-id',
          },
          body: JSON.stringify({ query: '{ slow(secret:"private-search") }' }),
        }),
        fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ query: '{ broken }' }),
        }),
      ]);
      assert.deepEqual(await slow.json(), { data: { slow: 7 } });
      assert.equal((await broken.json()).errors.length, 1);
      const slowId = slow.headers.get('x-request-id');
      const brokenId = broken.headers.get('x-request-id');
      assert.notEqual(slowId, brokenId);
      assert.match(slowId, /^[0-9a-f-]{36}$/);
      assert.match(brokenId, /^[0-9a-f-]{36}$/);
      for (const [field, id] of [
        ['Query.slow', slowId],
        ['Query.broken', brokenId],
      ]) {
        const fieldLogs = records.filter(record => record.field === field);
        assert.ok(fieldLogs.length >= (level === 'debug' ? 4 : 1));
        assert.ok(fieldLogs.every(record => record.reqId === id));
        assert.ok(
          records.some(
            record =>
              record.reqId === id &&
              record.message === 'Request completed' &&
              record.durationMs >= 0
          )
        );
      }
      assert.ok(
        records.some(
          record => record.field === 'Query.slow' && record.level === 'INFO'
        )
      );
      assert.ok(
        records.some(
          record => record.status === 503 && record.level === 'ERROR'
        )
      );
      assert.ok(
        records.some(
          record =>
            record.message === 'GraphQL operation failed' &&
            record.errorType === 'AxiosError' &&
            record.reqId === brokenId
        )
      );
      assert.ok(
        records.some(
          record =>
            record.message === 'Resolver context log' && record.reqId === slowId
        )
      );
      assert.ok(
        records.every(
          record =>
            record.application === 'legacy' && record.pid === process.pid
        )
      );
      assert.ok(!JSON.stringify(records).includes('private-'));
    } finally {
      server.closeAllConnections();
      await new Promise((resolve, reject) =>
        server.close(error => (error ? reject(error) : resolve()))
      );
    }
  });
}

test('upstream HTTP 200 application errors are warnings and preserve responses', async () => {
  const { records } = capture();
  const data = { error: { message: 'private-payload' } };
  const client = axios.create({
    adapter: async config => ({ data, status: 200, headers: {}, config }),
  });
  traceRequests(client, 'arcgis');
  const response = await client.get('/private-url');
  assert.equal(response.data, data);
  assert.equal(records.length, 1);
  assert.equal(records[0].level, 'WARN');
  assert.equal(records[0].status, 200);
  assert.ok(records[0].durationMs >= 0);
  assert.ok(!JSON.stringify(records).includes('private-'));
});

test('native HTTP logging covers GET, health, CORS, invalid input and missing routes', async () => {
  const { records } = capture();
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: { hello: { type: GraphQLString, resolve: () => 'hello' } },
    }),
  });
  const server = createApp(schema).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const url = `http://127.0.0.1:${server.address().port}/`;
    const hello = await fetch(
      `${url}?query=${encodeURIComponent('{ hello }')}&private=private-query`
    );
    assert.deepEqual(await hello.json(), { data: { hello: 'hello' } });
    assert.equal(hello.headers.get('access-control-allow-origin'), '*');
    assert.equal(
      hello.headers.get('access-control-expose-headers'),
      'X-Request-Id'
    );
    assert.equal(await (await fetch(`${url}probe`)).text(), 'Success!');
    assert.equal((await fetch(url, { method: 'OPTIONS' })).status, 204);
    const malformed = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{ "private-body":',
    });
    assert.equal(malformed.status, 400);
    assert.deepEqual(await malformed.json(), { error: 'Bad request' });
    const invalid = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/graphql-response+json',
      },
      body: JSON.stringify({ query: '{ missing }' }),
    });
    assert.equal(invalid.status, 400);
    const missing = await fetch(`${url}missing`);
    assert.equal(missing.status, 404);
    const completed = records.filter(
      record => record.message === 'Request completed'
    );
    assert.equal(completed.length, 6);
    assert.equal(new Set(completed.map(record => record.reqId)).size, 6);
    assert.ok(completed.every(record => record.durationMs >= 0));
    assert.ok(
      completed
        .filter(record => record.status >= 400)
        .every(record => record.level === 'WARN')
    );
    assert.ok(
      records.some(
        record =>
          record.message === 'Request failed' &&
          record.reqId === malformed.headers.get('x-request-id')
      )
    );
    assert.ok(!JSON.stringify(records).includes('private-'));
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
});

test('unexpected GraphQL handler failures produce sanitized, correlated 500 errors', async () => {
  const { records } = capture();
  const server = createApp(new GraphQLSchema({})).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ privateField }' }),
    });
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: 'Internal server error',
    });
    const reqId = response.headers.get('x-request-id');
    assert.ok(
      records.some(
        record =>
          record.reqId === reqId &&
          record.message === 'Request failed' &&
          record.errorType === 'Error'
      )
    );
    assert.ok(
      records.some(
        record =>
          record.reqId === reqId &&
          record.message === 'Request completed' &&
          record.status === 500 &&
          record.level === 'ERROR'
      )
    );
    assert.ok(!JSON.stringify(records).includes('privateField'));
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
});

test('native HTTP logging records aborted requests once', async () => {
  const { records } = capture();
  let release;
  let started;
  const pending = new Promise(resolve => {
    release = resolve;
  });
  const resolving = new Promise(resolve => {
    started = resolve;
  });
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        slow: {
          type: GraphQLString,
          resolve: async () => {
            started();
            await pending;
            return 'done';
          },
        },
      },
    }),
  });
  const server = createApp(schema).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const connected = once(server, 'connection');
    const client = request({
      hostname: '127.0.0.1',
      port: server.address().port,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    });
    client.on('error', () => undefined);
    client.end(JSON.stringify({ query: '{ slow }' }));
    const [socket] = await connected;
    await resolving;
    const closed = once(socket, 'close');
    client.destroy();
    await closed;
    const aborted = records.filter(
      record => record.message === 'Request aborted'
    );
    assert.equal(aborted.length, 1);
    assert.equal(aborted[0].level, 'WARN');
    assert.ok(aborted[0].reqId);
    assert.ok(aborted[0].durationMs >= 0);
    assert.ok(!records.some(record => record.message === 'Request completed'));
  } finally {
    release();
    server.closeAllConnections();
    await new Promise((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
});
