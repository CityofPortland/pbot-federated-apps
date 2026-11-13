<template>
  <div class="h-full">
    <section class="h-full">
      <div ref="mapElement" class="relative h-full w-full"></div>
    </section>
    <div class="h-full w-full" ref="manualElement">
      <slot name="manual"></slot>
    </div>
    <div ref="topLeftElement">
      <slot name="top-left">
        <div class="flex flex-col shadow-lg">
          <button
            title="Zoom in"
            class="p-2 bg-white border-2 border-b rounded-t border-fog-900 focus:outline-none focus:shadow-outline"
            @click="incrementZoom"
          >
            <Icon type="solid" name="plus" class="w-5 h-5" />
          </button>
          <button
            title="Zoom out"
            class="p-2 bg-white border-2 border-t rounded-b border-fog-900 focus:outline-none focus:shadow-outline"
            @click="decrementZoom"
          >
            <Icon type="solid" name="minus" class="w-5 h-5" />
          </button>
        </div>
      </slot>
    </div>
    <div ref="topRightElement">
      <slot name="top-right"></slot>
    </div>
    <div ref="bottomLeftElement">
      <slot name="bottom-left"></slot>
    </div>
    <div ref="bottomRightElement">
      <slot name="bottom-right"></slot>
    </div>
    <div ref="legendElement"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import debounce from 'lodash-es/debounce';

import { watch as esriWatch } from '@arcgis/core/core/reactiveUtils';
import Extent from '@arcgis/core/geometry/Extent';
import Layer from '@arcgis/core/layers/Layer';
import MapView from '@arcgis/core/views/MapView';
import Legend from '@arcgis/core/widgets/Legend';

import { Icon } from '@pbotapps/components';

import { getLogger } from '../logging';
import { useMapStore } from '../store/map';

const props = withDefaults(
  defineProps<{ legend?: boolean; layers?: Layer[] }>(),
  {
    legend: true,
    layers: () => [],
  }
);

const emit = defineEmits<{
  (e: 'click', event: __esri.ViewClickEvent): void;
  (e: 'pointer-hit', results: any[]): void;
  (e: 'extent-change', extent: __esri.Extent): void;
}>();

const map = useMapStore();

const mapElement = ref<HTMLDivElement>();
const manualElement = ref<HTMLDivElement>();
const topLeftElement = ref<HTMLDivElement>();
const topRightElement = ref<HTMLDivElement>();
const bottomLeftElement = ref<HTMLDivElement>();
const bottomRightElement = ref<HTMLDivElement>();
const legendElement = ref<HTMLDivElement>();

const logger = getLogger(['interactive-tsp', 'map']);

watch(
  () => props.layers,
  layers => map.setLayers(layers)
);

function incrementZoom() {
  map.setZoom({ value: map.zoom.current + 1, move: true });
}

function decrementZoom() {
  map.setZoom({ value: map.zoom.current - 1, move: true });
}

onMounted(() => {
  const view = new MapView({
    container: mapElement.value,
    map: map.map,
    extent: map.extent as Extent,
  });

  view.ui.remove('zoom');

  view.ui.add(topLeftElement.value as HTMLDivElement, {
    position: 'top-left',
    index: 2,
  });
  view.ui.add(topRightElement.value as HTMLDivElement, {
    position: 'top-right',
    index: 2,
  });
  view.ui.add(bottomLeftElement.value as HTMLDivElement, {
    position: 'bottom-left',
    index: 2,
  });
  view.ui.add(bottomRightElement.value as HTMLDivElement, {
    position: 'bottom-right',
    index: 2,
  });
  view.ui.add(manualElement.value as HTMLDivElement, {
    position: 'manual',
    index: 2,
  });

  esriWatch(
    () => view.extent,
    debounce(newExtent => {
      logger.trace('extent changed');
      emit('extent-change', newExtent);
    }, 500)
  );

  map.setView(view);

  view.on('click', event => {
    emit('click', event);
  });

  view.on('pointer-move', event => {
    view.hitTest(event).then(response => {
      emit('pointer-hit', response.results);
    });
  });

  map.setLayers(props.layers);
});
</script>

<style>
.esri-ui {
  @apply text-base;
}

.esri-ui .esri-ui-corner .esri-component {
  @apply m-0 shadow-none;
}

.esri-ui .esri-ui-corner .esri-component .esri-widget--panel {
  @apply w-full;
}

.esri-ui .esri-ui-manual-container .esri-component {
  @apply pointer-events-none;
}

.esri-ui .esri-widget {
  font-family: inherit;
  @apply text-base;
}

.esri-ui .esri-widget .esri-legend__service {
  @apply p-2;
}

.esri-ui .esri-widget .esri-widget__heading {
  @apply text-base;
}

.esri-ui .esri-widget .esri-legend__layer-cell--info {
  @apply text-sm;
}

@media print {
  .esri-ui {
    display: none;
  }

  .esri-view-user-storage {
    display: none;
  }
}
</style>
