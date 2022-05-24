<template>
  <MapVue
    :map="map"
    :extent="extent"
    :zoom="zoom"
    class="border border-current shadow-md"
    @zoom-change="handleZoom"
    @pointer-hit="handlePointer"
  >
    <template v-slot:top-right>
      <section
        v-if="pointer"
        class="p-2 border border-black rounded-md shadow bg-white overflow-auto"
      >
        <span class="font-semibold text-lg">{{ pointer.StreetName }}</span>
      </section>
    </template></MapVue
  >
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';

import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriMap from '@arcgis/core/Map';
import TileLayer from '@arcgis/core/layers/TileLayer';

import MapVue from '@/components/map/Map.vue';

const TYPE_MAP = new Map<string, string>([['civic-main-street', 'CIMS']]);

export default defineComponent({
  name: 'StreetTypeMap',
  components: {
    MapVue,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { type } = toRefs(props);

    const basemap = new Basemap({
      baseLayers: [
        new TileLayer({
          url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color/MapServer',
        }),
      ],
    });

    const layers = [
      new FeatureLayer({
        url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/22',
        outFields: ['*'],
        definitionExpression: `Design = '${TYPE_MAP.get(type.value)}'`,
      }),
      new TileLayer({
        url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Labels/MapServer',
      }),
    ];

    const extent = {
      spatialReference: { wkid: 102100 },
      xmin: -13674088.5469,
      ymin: 5689892.284199998,
      xmax: -13633591.503800001,
      ymax: 5724489.626800001,
    };

    const zoom = ref(12);

    const map = new EsriMap({ basemap, layers });

    const pointer = ref<unknown | undefined>(undefined);

    return {
      map,
      extent,
      zoom,
      pointer,
      handleZoom(z: number) {
        zoom.value = z;
      },
      handlePointer(event: Array<{ graphic: { attributes: unknown } }>) {
        if (event && event.length > 0) {
          pointer.value = event[0].graphic.attributes;
        } else {
          pointer.value = undefined;
        }
      },
    };
  },
});
</script>
