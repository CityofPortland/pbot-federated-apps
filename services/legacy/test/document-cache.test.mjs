import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDocumentCache } from '../dist/document/cache.js';

const settle = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

function fixture() {
  const state = { time: 0, revision: 'a', reads: 0, builds: 0, errors: [] };
  const options = {
    refreshInterval: 100,
    now: () => state.time,
    readRevision: async () => {
      state.reads++;
      return state.revision;
    },
    compile: async name => {
      state.builds++;
      return [`${name}:${state.revision}`];
    },
    onError: (name, error) => state.errors.push({ name, error }),
  };
  return { state, options };
}

test('concurrent first requests share one load, and documents have separate caches', async () => {
  const { state, options } = fixture();
  const gate = deferred();
  options.compile = async name => {
    state.builds++;
    await gate.promise;
    return [name];
  };
  const get = createDocumentCache(options);
  const requests = [get('one'), get('one'), get('one')];
  await settle();
  assert.equal(state.reads, 1);
  assert.equal(state.builds, 1);
  gate.resolve();
  const values = await Promise.all(requests);
  assert.strictEqual(values[0], values[1]);
  assert.deepEqual(await get('two'), ['two']);
  assert.equal(state.builds, 2);
});

test('cached reads are throttled and unchanged commits do not recompile', async () => {
  const { state, options } = fixture();
  const get = createDocumentCache(options);
  const original = await get('one');
  state.time = 99;
  assert.strictEqual(await get('one'), original);
  assert.equal(state.reads, 1);
  state.time = 100;
  await Promise.all([get('one'), get('one')]);
  await settle();
  assert.equal(state.reads, 2);
  assert.equal(state.builds, 1);
  await get('one');
  assert.equal(state.reads, 2);
});

test('changed commits compile in the background and replace content only on success', async () => {
  const { state, options } = fixture();
  const gate = deferred();
  const get = createDocumentCache(options);
  const original = await get('one');
  state.time = 100;
  state.revision = 'b';
  options.compile = async () => {
    state.builds++;
    return gate.promise;
  };
  assert.strictEqual(await get('one'), original);
  await settle();
  assert.strictEqual(await get('one'), original);
  assert.equal(state.builds, 2);
  gate.resolve(['updated']);
  await settle();
  assert.deepEqual(await get('one'), ['updated']);
});

for (const stage of ['readRevision', 'compile']) {
  test(`${stage} failure retains content and throttles retries`, async () => {
    const { state, options } = fixture();
    const get = createDocumentCache(options);
    const original = await get('one');
    const success = options[stage];
    const error = new Error('refresh failed');
    options[stage] = async () => {
      throw error;
    };
    state.revision = 'b';
    state.time = 100;
    assert.strictEqual(await get('one'), original);
    await settle();
    assert.deepEqual(state.errors, [{ name: 'one', error }]);
    assert.strictEqual(await get('one'), original);
    await settle();
    assert.equal(state.errors.length, 1);
    options[stage] = success;
    state.time = 200;
    await get('one');
    await settle();
    assert.deepEqual(await get('one'), ['one:b']);
  });
}

test('first-load failures reject callers and allow an immediate shared retry', async () => {
  const { state, options } = fixture();
  const compile = options.compile;
  options.compile = async () => {
    throw new Error('initial failure');
  };
  const get = createDocumentCache(options);
  await assert.rejects(get('one'), /initial failure/);
  options.compile = compile;
  const results = await Promise.all([get('one'), get('one')]);
  assert.strictEqual(results[0], results[1]);
  assert.equal(state.reads, 2);
  assert.equal(state.builds, 1);
});
