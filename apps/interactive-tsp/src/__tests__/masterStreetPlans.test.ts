import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope, isProxy } from 'vue';
import { createPinia, disposePinia, setActivePinia } from 'pinia';
import { PiniaColada, useQuery, useQueryCache } from '@pinia/colada';
import { createMemoryHistory, createRouter } from 'vue-router';
import { masterStreetPlansQuery } from '../queries/masterStreetPlans';
import { useMasterStreetPlanStore } from '../store/masterStreetPlans';
import { initializeStores } from '../router/initialize-stores';

const mocks = vi.hoisted(() => ({ query: vi.fn(), map: vi.fn() }));

vi.mock('@pbotapps/components', () => ({ query: mocks.query }));
vi.mock('../store/map', () => ({
  defaultExtent: {
    xmin: 1,
    ymin: 2,
    xmax: 3,
    ymax: 4,
    spatialReference: { wkid: 3857 },
  },
  useMapStore: mocks.map,
}));
vi.mock('../store/message', () => ({ useMessageStore: vi.fn() }));
vi.mock('../store/utils', () => ({
  esriGeometry: vi.fn(),
  esriGraphics: vi.fn(),
}));
vi.mock('@arcgis/core/geometry/Polygon', () => ({ default: class {} }));
vi.mock('@arcgis/core/layers/Layer', () => ({ default: class {} }));
vi.mock('@arcgis/core/layers/FeatureLayer', () => ({ default: class {} }));
vi.mock('@arcgis/core/layers/GraphicsLayer', () => ({ default: class {} }));
vi.mock('@arcgis/core/layers/GroupLayer', () => ({ default: class {} }));
vi.mock('@arcgis/core/layers/support/FeatureFilter', () => ({
  default: class {},
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('master street plan loading', () => {
  let pinia: ReturnType<typeof createPinia>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createPinia();
    app = createApp({}).use(pinia).use(PiniaColada);
    setActivePinia(pinia);
  });

  afterEach(() => {
    disposePinia(pinia);
  });

  it('shares concurrent requests and treats an empty list as successfully loaded', async () => {
    const response = deferred<{ data: { masterStreetPlans: [] } }>();
    mocks.query.mockReturnValueOnce(response.promise);
    const store = useMasterStreetPlanStore();
    const first = store.initialize();
    const second = store.initialize();
    expect(mocks.query).toHaveBeenCalledTimes(1);
    response.resolve({ data: { masterStreetPlans: [] } });
    await Promise.all([first, second]);
    await store.initialize();
    expect(store.list).toEqual([]);
    expect(mocks.query).toHaveBeenCalledTimes(1);
    expect(mocks.query.mock.calls[0][0].cache).toBe(false);
    expect(store.layers).toHaveLength(3);
    expect(isProxy(store.layers[0])).toBe(false);
  });

  it('manual refresh updates the list and a failed refresh retains existing data', async () => {
    mocks.query.mockResolvedValueOnce({
      data: { masterStreetPlans: [{ id: 1 }] },
    });
    const store = useMasterStreetPlanStore();
    await store.initialize();
    const cache = useQueryCache();
    const entry = cache.ensure(masterStreetPlansQuery);
    mocks.query.mockResolvedValueOnce({
      data: { masterStreetPlans: [{ id: 2 }] },
    });
    await cache.fetch(entry);
    expect(store.list).toEqual([{ id: 2 }]);
    mocks.query.mockRejectedValueOnce(new Error('offline'));
    await expect(cache.fetch(entry)).rejects.toThrow('offline');
    expect(store.list).toEqual([{ id: 2 }]);
  });

  it.each([
    {},
    { errors: [{ message: 'unavailable' }] },
    { data: { masterStreetPlans: null } },
    {
      data: { masterStreetPlans: [] },
      errors: [{ message: 'partial failure' }],
    },
  ])(
    'rejects unusable GraphQL results and allows retry: %j',
    async response => {
      mocks.query.mockResolvedValueOnce(response);
      const store = useMasterStreetPlanStore();
      await expect(store.initialize()).rejects.toThrow('Unable to retrieve');
      mocks.query.mockResolvedValueOnce({ data: { masterStreetPlans: [] } });
      await store.initialize();
      expect(mocks.query).toHaveBeenCalledTimes(2);
    }
  );

  it('waits for initialization before navigating and reuses data for parameter changes', async () => {
    const response = deferred<{ data: { masterStreetPlans: [] } }>();
    mocks.query.mockReturnValueOnce(response.promise);
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: {} },
        {
          path: '/master-street-plans/:id?',
          name: 'master-street-plans',
          component: {},
        },
      ],
    });
    router.beforeEach(initializeStores);
    await router.push('/');
    expect(mocks.query).not.toHaveBeenCalled();
    const navigation = router.push('/master-street-plans');
    await vi.waitFor(() => expect(mocks.query).toHaveBeenCalledTimes(1));
    expect(router.currentRoute.value.name).toBe('home');
    response.resolve({ data: { masterStreetPlans: [] } });
    await navigation;
    expect(router.currentRoute.value.name).toBe('master-street-plans');
    await router.push('/master-street-plans/1');
    expect(mocks.query).toHaveBeenCalledTimes(1);
    expect(mocks.map).toHaveBeenCalled();
  });

  it('allows navigation on failure and leaves an error in the query cache', async () => {
    mocks.query.mockRejectedValueOnce(new Error('offline'));
    await initializeStores({ name: 'master-street-plans' });
    const entry = useQueryCache().ensure(masterStreetPlansQuery);
    expect(entry.state.value.status).toBe('error');
    expect(entry.state.value.error?.message).toBe('offline');
  });

  it('observes navigation results without automatically fetching and reloads after eviction', async () => {
    mocks.query.mockResolvedValue({ data: { masterStreetPlans: [] } });
    const store = useMasterStreetPlanStore();
    await store.initialize();
    const scope = effectScope();
    try {
      const result = scope.run(() =>
        app.runWithContext(() => useQuery(masterStreetPlansQuery))
      );
      expect(result?.state.value.status).toBe('success');
      expect(mocks.query).toHaveBeenCalledTimes(1);
      await result?.refetch();
      expect(mocks.query).toHaveBeenCalledTimes(2);
    } finally {
      scope.stop();
    }
    const cache = useQueryCache();
    cache.remove(cache.ensure(masterStreetPlansQuery));
    await store.initialize();
    expect(mocks.query).toHaveBeenCalledTimes(3);
  });
});
