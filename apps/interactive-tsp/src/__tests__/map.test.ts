import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, disposePinia, setActivePinia } from 'pinia';
import { isProxy } from 'vue';
import type MapView from '@arcgis/core/views/MapView';
import Extent from '@arcgis/core/geometry/Extent';
import { useMapStore } from '../store/map';

const mocks = vi.hoisted(() => ({ watch: vi.fn() }));

vi.mock('@arcgis/core/core/reactiveUtils', () => ({ watch: mocks.watch }));
vi.mock('@arcgis/core/geometry/Extent', () => ({
  default: class {
    constructor(properties: object) {
      Object.assign(this, properties);
    }
    clone() {
      return new Extent(this);
    }
  },
}));
vi.mock('@arcgis/core/geometry/Point', () => ({ default: class {} }));
vi.mock('@arcgis/core/layers/TileLayer', () => ({ default: class {} }));
vi.mock('@arcgis/core/Map', () => ({ default: class {} }));

function createView(zoom = 12) {
  return {
    zoom,
    extent: new Extent({ xmin: 1, ymin: 2, xmax: 3, ymax: 4 }),
    center: { x: 2, y: 3 },
    goTo: vi.fn(),
  };
}

describe('map navigation state', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.watch.mockImplementation((getValue, callback) => {
      callback(getValue());
      return { remove: vi.fn() };
    });
    pinia = createPinia();
    setActivePinia(pinia);
  });

  afterEach(() => disposePinia(pinia));

  it('exposes the raw view and its initial zoom and extent', () => {
    const store = useMapStore();
    const view = createView();
    store.setView(view as unknown as MapView);
    expect(isProxy(store.map)).toBe(false);
    expect(store.view).toBe(view);
    expect(isProxy(store.view)).toBe(false);
    expect(store.zoom.current).toBe(12);
    expect(store.extent).toBe(view.extent);
    expect(mocks.watch.mock.calls[0][2]).toEqual({ initial: true });
  });

  it('reflects repeated view changes without issuing navigation commands', () => {
    const store = useMapStore();
    const view = createView();
    store.setView(view as unknown as MapView);
    const [getValue, synchronize] = mocks.watch.mock.calls[0];
    for (const zoom of [14, 9.5]) {
      view.zoom = zoom;
      view.extent = new Extent({ xmin: zoom });
      synchronize(getValue());
      expect(store.zoom.current).toBe(zoom);
      expect(store.extent).toBe(view.extent);
    }
    expect(view.goTo).not.toHaveBeenCalled();
  });

  it('lets the view fit an extent and reports the resulting zoom and extent', () => {
    const store = useMapStore();
    const view = createView();
    store.setView(view as unknown as MapView);
    const target = new Extent({ xmin: 10, ymin: 20, xmax: 30, ymax: 40 });
    store.setExtent(target);
    expect(view.goTo).toHaveBeenCalledWith({ target }, expect.any(Object));
    expect(store.zoom.current).toBe(12);
    view.zoom = 8;
    view.extent = new Extent({ xmin: 9, ymin: 20, xmax: 31, ymax: 40 });
    const [getValue, synchronize] = mocks.watch.mock.calls[0];
    synchronize(getValue());
    expect(store.zoom.current).toBe(8);
    expect(store.extent).toBe(view.extent);
  });

  it.each([11, 3, 21])(
    'allows zoom out and clamps requested zoom %s',
    value => {
      const store = useMapStore();
      const view = createView();
      store.setView(view as unknown as MapView);
      store.setZoom({ value, move: true });
      expect(view.goTo).toHaveBeenCalledWith(
        { center: view.center, zoom: Math.min(20, Math.max(4, value)) },
        expect.any(Object)
      );
      expect(store.zoom.current).toBe(12);
    }
  );

  it('does not navigate when reporting an observed zoom outside button limits', () => {
    const store = useMapStore();
    const view = createView();
    store.setView(view as unknown as MapView);
    store.setZoom({ value: 3, move: false });
    expect(store.zoom.current).toBe(3);
    expect(view.goTo).not.toHaveBeenCalled();
  });

  it('preserves an extent requested before the view is attached', () => {
    const store = useMapStore();
    const target = new Extent({ xmin: 10 });
    store.setExtent(target);
    expect(store.extent).toBe(target);
  });

  it('removes the previous watcher on replacement and disposal', () => {
    const store = useMapStore();
    store.setView(createView() as unknown as MapView);
    const firstHandle = mocks.watch.mock.results[0].value;
    store.setView(createView() as unknown as MapView);
    expect(firstHandle.remove).toHaveBeenCalledOnce();
    const secondHandle = mocks.watch.mock.results[1].value;
    disposePinia(pinia);
    expect(secondHandle.remove).toHaveBeenCalledOnce();
  });
});
