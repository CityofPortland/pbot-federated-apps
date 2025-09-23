<script setup lang="js">
import { reactive, defineEmits } from 'vue';
import { AddressSuggest, Candidate, CandidateList, query } from '@pbotapps/components';

const emit = defineEmits(['map-ready'])

let map = null;

const candidates = reactive([]);

require([
  'esri/map',
  'esri/dijit/Basemap',
  'esri/geometry/Extent',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/layers/FeatureLayer',
  'esri/SpatialReference',
], function (Map, Basemap, Extent, TileLayer, FeatureLayer, SpatialReference) {
  map = new Map('map', {
    basemap: new Basemap({
      layers: [
        'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Complete/MapServer',
      ].map(url => new TileLayer(url)),
    }),
    extent: new Extent({
      spatialReference: new SpatialReference(102100),
      xmin: -13674088.5469,
      ymin: 5689892.284199998,
      xmax: -13633591.503800001,
      ymax: 5724489.626800001,
    }),
    zoom: 13,
  });

  emit('map-ready', map);

  const layers = [
    'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/0',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/1',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/2'
  ].map(url => new FeatureLayer(url,
    {
      outFields: ['PROPGISID1']
    }
  ));

  map.addLayers(layers);
});

const handleSearch = async ({query: search,type}) => {
  candidates.length = 0;

  // send the query to our GraphQL server
  const res = await query({
    url: import.meta.env.VITE_GRAPHQL_URL,
    operation: `
      {
        ${type == 'address' ? 'address' : 'taxLot'}(search: "${search}", city: "Portland") {
          name
          location {
            x
            y
            spatialReference {
              wkid
              latestWkid
            }
          }
        }
      }
    `,
  });

  const { data } = res;

  require([
    'esri/SpatialReference',
  ], function (SpatialReference) {
    const newCandidates = data[type == 'address' ? 'address' : 'taxLot'].map(
      candidate => ({
        name: candidate.name,
        location: { ...candidate.location, spatialReference: new SpatialReference(candidate.location.spatialReference) },
      })
    );

    candidates.splice(0, newCandidates.length, ...newCandidates);
  });
};

const handleSelect = (candidate) => {
  map.centerAndZoom(candidate.location, 18);
  candidates.length = 0;
};
</script>

<template>
  <div id="map" class="h-screen">
    <div id="search">
      <AddressSuggest color="white" @search="handleSearch" />
      <CandidateList class="py-1" :open="candidates.length > 0">
        <Candidate
          v-for="(candidate, index) in candidates"
          :key="index"
          :candidate="candidate"
          color="white"
          @click="handleSelect(candidate)"
          @keydown.enter="handleSelect(candidate)"
        />
      </CandidateList>
    </div>
  </div>
</template>

<style lang="css" scoped>
#search {
  display: block;
  position: absolute;
  z-index: 2;
  top: 20px;
  left: 74px;
}
</style>
