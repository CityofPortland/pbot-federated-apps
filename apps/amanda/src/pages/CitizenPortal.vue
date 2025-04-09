<script setup lang="js">

import MapComponent from '../components/Map.vue';

let layers = [];

function selectInBuffer(response) {
  console.debug('selectInBuffer', response);

  const feature = response.features[0];

  window.scrollBy(0, 700);
  const pinInputContainer = window.parent.document.getElementsByClassName("gismap-pin-input")[0];
  if (pinInputContainer) {
    const inputElement = pinInputContainer.getElementsByTagName("INPUT")[0];
    if (inputElement) {
      inputElement.value = feature.attributes.PROPGISID1 + '-ADD';
    } else {
      console.error("Input element not found");
    }
  } else {
    console.error("Pin input container not found");
  }

  const pinButton = window.parent.document.getElementsByClassName("gismap-pin-button")[0];
  if (pinButton) {
    pinButton.click();
  } else {
    console.error("Pin button not found");
  }
}

const handleLayers = (newLayers) => {
  console.debug('layers added', newLayers);
  layers = newLayers;
};

const handleMap = (map) => {
  require([
    'esri/geometry/Circle',
    'esri/tasks/query',
  ], function (Circle, Query) {
    console.debug('citizen portal initialiizing...');
    // When the map is clicked create a buffer around the click point of the specified distance
    map.on("click", function(evt){
      const circle = new Circle({
        center: evt.mapPoint,
        geodesic: true,
        radius: 2,
      });

      const query = new Query();

      query.geometry = circle.getExtent();

      // Use a fast bounding box query. It will only go to the server if bounding box is outside of the visible map.
      layers.forEach(layer => layer.queryFeatures(query, selectInBuffer));
    });
  });
};
</script>

<template>
  <MapComponent @map-ready="handleMap" @layers-added="handleLayers" />
</template>
