<script setup lang="js">
import MapComponent from '../components/Map.vue';

const handleMap = (map) => {
  console.debug('amanda initializing....');

  window.amanda.initialize(map, {
    serviceUrl: import.meta.env.AMANDA_SERVICE_URL,
    serviceToken: import.meta.env.AMANDA_SERVICE_TOKEN,
    pushpinImage: 'images/map-marker-red-32.png',
    highlightedPushpinImage: 'images/map-marker-blue-32.png',
    logLevel: 'DEBUG',
    }).then(() => {
    require([
      'esri/layers/FeatureLayer',
    ], function (FeatureLayer) {
      map.addLayers([
        'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/0',
        'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/2',
        'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/1',
      ].map(url => new FeatureLayer(url,
        {
          outFields: ['PROPGISID1']
        }
      )));
    });
  });
}
</script>

<template>
  <MapComponent @map-ready="handleMap" />
</template>
