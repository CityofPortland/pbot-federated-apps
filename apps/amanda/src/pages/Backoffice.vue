<script setup lang="js">
var map;
require([
  'esri/map',
  'esri/dijit/Basemap',
  'esri/geometry/Extent',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/layers/FeatureLayer',
  'esri/SpatialReference',
], function (Map, Basemap, Extent, TileLayer, FeatureLayer, SpatialReference) {
  const layers = [
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Complete/MapServer',
  ].map(url => new TileLayer(url));

  map = new Map('map', {
    basemap: new Basemap({
      layers,
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

  map.addLayer(
    new FeatureLayer(
      'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/0'
    )
  );

  map.addLayer(
    new FeatureLayer(
      'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/1'
    )
  );

  map.addLayer(
    new FeatureLayer(
      'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_AMANDA/MapServer/2'
    )
  );

  window.amanda.initialize(map, {
    serviceUrl: import.meta.env.AMANDA_SERVICE_URL,
    serviceToken: import.meta.env.AMANDA_SERVICE_TOKEN,
    pushpinImage: 'images/map-marker-red-32.png',
    highlightedPushpinImage: 'images/map-marker-blue-32.png',
    logLevel: 'DEBUG',
  });
});
</script>

<template>
  <div id="map" class="h-screen"></div>
</template>
