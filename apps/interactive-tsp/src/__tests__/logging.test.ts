import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureSync, resetSync, type LogRecord } from '@logtape/logtape';
import { createApp } from 'vue';
import { createPinia, defineStore, disposePinia } from 'pinia';
import { configureLogging, getLogger, traceStoreActions } from '../logging';
import { query } from '../queries/query';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@pbotapps/components', () => ({ query: mocks.query }));

describe('application logging', () => {
  let records: LogRecord[];

  beforeEach(() => {
    records = [];
    vi.clearAllMocks();
    configureSync({
      reset: true,
      sinks: { capture: record => records.push(record) },
      loggers: [
        {
          category: 'interactive-tsp',
          lowestLevel: 'debug',
          sinks: ['capture'],
        },
        { category: ['logtape', 'meta'], lowestLevel: null },
      ],
    });
  });

  afterEach(() => {
    resetSync();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('keeps GraphQL responses and transport options unchanged without logging their contents', async () => {
    const options = {
      field: 'address',
      args: { search: 'private-search' },
      select: { name: true },
      headers: { authorization: 'private-token' },
    };
    const response = {
      data: { address: [{ name: 'private-address' }] },
      errors: [{ message: 'private-error' }],
    };
    mocks.query.mockResolvedValue(response);
    expect(await query(options)).toBe(response);
    expect(mocks.query).toHaveBeenCalledWith({
      operation: '{\n  address(search: "private-search") {\n    name\n  }\n}',
      headers: options.headers,
    });
    expect(records.map(record => record.level)).toEqual(['debug', 'warning']);
    expect(records[1].properties).toMatchObject({
      field: 'address',
      errorCount: 1,
      hasData: true,
      durationMs: expect.any(Number),
    });
    expect(JSON.stringify(records)).not.toContain('private-');
  });

  it('logs and rethrows transport failures, and warns about missing data', async () => {
    const error = new Error('private-error');
    mocks.query.mockRejectedValueOnce(error);
    await expect(
      query({ field: 'streets', select: { id: true } })
    ).rejects.toBe(error);
    expect(records.at(-1)).toMatchObject({
      level: 'error',
      properties: { field: 'streets', errorType: 'Error' },
    });
    expect(JSON.stringify(records)).not.toContain('private-error');
    mocks.query.mockResolvedValueOnce({});
    expect(await query({ field: 'streets', select: { id: true } })).toEqual({});
    expect(records.at(-1)?.level).toBe('warning');
  });

  it('traces async store actions and failures without arguments, results or state', async () => {
    const pinia = createPinia().use(traceStoreActions);
    createApp({}).use(pinia);
    const error = new Error('private-error');
    const useStore = defineStore('test', {
      actions: {
        async load(search: string) {
          return search;
        },
        async fail() {
          throw error;
        },
      },
    });
    const store = useStore(pinia);
    expect(await store.load('private-search')).toBe('private-search');
    await expect(store.fail()).rejects.toBe(error);
    expect(records.map(record => record.level)).toEqual([
      'debug',
      'debug',
      'debug',
      'error',
    ]);
    expect(records[1].properties).toMatchObject({
      action: 'load',
      durationMs: expect.any(Number),
    });
    expect(JSON.stringify(records)).not.toContain('private-');
    disposePinia(pinia);
  });

  it.each([
    [true, undefined, true, true],
    [false, undefined, false, true],
    [false, 'debug', true, true],
    [true, 'off', false, false],
  ])(
    'filters by environment and explicit level: %s %s',
    (dev, level, debug, info) => {
      vi.stubEnv('DEV', dev);
      vi.stubEnv('VITE_LOG_LEVEL', level);
      const debugOutput = vi
        .spyOn(console, 'debug')
        .mockImplementation(() => undefined);
      const infoOutput = vi
        .spyOn(console, 'info')
        .mockImplementation(() => undefined);
      configureLogging();
      const logger = getLogger(['interactive-tsp', 'test']);
      logger.debug('debug event');
      logger.info('info event');
      expect(debugOutput.mock.calls.length > 0).toBe(debug);
      expect(infoOutput.mock.calls.length > 0).toBe(info);
    }
  );

  it('rejects invalid level overrides', () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'invalid');
    expect(configureLogging).toThrow('Invalid VITE_LOG_LEVEL');
  });
});
