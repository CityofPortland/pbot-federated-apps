import { defineStore } from 'pinia';
import { markRaw, onScopeDispose, reactive, shallowRef, toRaw } from 'vue';
import debounce from 'lodash-es/debounce';

import { watch as esriWatch } from '@arcgis/core/core/reactiveUtils';
import Extent from '@arcgis/core/geometry/Extent';
import Point from '@arcgis/core/geometry/Point';
import Layer from '@arcgis/core/layers/Layer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import type { GoToTarget2D } from '@arcgis/core/views/types';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import Graphic from '@arcgis/core/Graphic';

import type { Location } from './portlandMaps';

export const defaultExtent = new Extent({
  spatialReference: { wkid: 102100 },
  xmin: -13674088.5469,
  ymin: 5689892.284199998,
  xmax: -13633591.503800001,
  ymax: 5724489.626800001,
});

// debounced so rapid layer visibility toggles don't thrash the map
const applyLayers = debounce((map: Map, layers: Layer[]) => {
  map.layers.removeAll();
  map.layers.addMany(layers);
  map.layers.push(
    new TileLayer({
      url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Labels/MapServer',
    })
  );
}, 10);

export const useMapStore = defineStore('map', () => {
  const map = markRaw(
    new Map({
      basemap: {
        baseLayers: [
          new TileLayer({
            url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color/MapServer',
          }),
          new TileLayer({
            url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Taxlot_Labels/MapServer',
          }),
        ],
      },
    })
  );

  const extent = shallowRef(defaultExtent.clone());
  const view = shallowRef<MapView>();
  let viewWatch: __esri.WatchHandle | undefined;

  onScopeDispose(() => viewWatch?.remove());

  const zoom = reactive({
    current: 6,
    focus: 18,
    max: 20,
    min: 4,
  });

  const layers = reactive([] as Layer[]);

  const focusLevel = () => zoom.focus;

  function setView(newView: MapView) {
    viewWatch?.remove();
    view.value = markRaw(newView);
    viewWatch = esriWatch(
      () => [newView.zoom, newView.extent] as const,
      ([currentZoom, currentExtent]) => {
        if (currentZoom >= 0) zoom.current = currentZoom;
        if (currentExtent) extent.value = currentExtent;
      },
      { initial: true }
    );
  }

  function setLayers(layers: Layer[]) {
    const rawLayers = layers.map(layer => markRaw(toRaw(layer)));
    layers = rawLayers;
    applyLayers(map as unknown as Map, rawLayers);
  }

  function goTo(target: GoToTarget2D) {
    view.value?.goTo(target, {
      animate: true,
      duration: 500,
      easing: 'ease-out',
    });
  }
  function resetExtent() {
    setExtent(defaultExtent);
  }

  function setExtent(newExtent: Extent) {
    if (!view.value) extent.value = newExtent;
    goTo({ target: newExtent });
  }

  function setLayerVisibility({
    layerId,
    visible,
  }: {
    layerId: string;
    visible: boolean;
  }) {
    const layer = layers?.find(l => l.id === layerId);
    if (layer) layer.visible = visible;
  }

  function setZoom({ value, move }: { value: number; move: boolean }): void {
    if (!view.value || !Number.isFinite(value)) return;
    if (move) {
      goTo({
        center: view.value.center,
        zoom: Math.min(zoom.max, Math.max(zoom.min, value)),
      });
    } else {
      zoom.current = value;
    }
  }

  function setLocation(location: Location | __esri.Point) {
    goTo({
      target: new Point({
        x: location.x,
        y: location.y,
        spatialReference: location.spatialReference,
      }),
      zoom: zoom.focus,
    });
  }

  function clearGraphics() {
    setGraphics([]);
  }

  function setGraphics(graphics: Graphic[]) {
    if (view.value) {
      view.value.graphics.removeAll();
      view.value.graphics.addMany(graphics);
    }
  }
  function addGraphic(graphic: Graphic) {
    if (view.value) {
      view.value.graphics.add(graphic);
    }
  }

  function setFilter({
    layer,
    filter,
  }: {
    layer: FeatureLayer;
    filter: FeatureFilter;
  }) {
    view.value?.whenLayerView(layer).then(layerView => {
      layerView.filter = filter;
    });
  }

  return {
    map,
    view,
    extent,
    layers,
    zoom,
    addGraphic,
    clearGraphics,
    goTo,
    focusLevel,
    resetExtent,
    setExtent,
    setFilter,
    setGraphics,
    setLayerVisibility,
    setLayers,
    setLocation,
    setView,
    setZoom,
  };
});
