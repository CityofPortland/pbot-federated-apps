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
  });
}
</script>

<template>
  <MapComponent @map-ready="handleMap" />
</template>
