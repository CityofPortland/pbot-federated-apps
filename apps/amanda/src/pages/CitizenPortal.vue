<script setup lang="js">
var map;
require([
  'esri/map',
  'esri/dijit/Basemap',
  'esri/geometry/Circle',
  'esri/geometry/Extent',
  'esri/tasks/query',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/layers/FeatureLayer',
  'esri/SpatialReference',
], function (Map, Basemap, Circle, Extent, Query, TileLayer, FeatureLayer, SpatialReference) {
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

  const featureLayer = new FeatureLayer(
      'https://www.portlandmaps.com/arcgis/rest/services/Public/BDS_Property/FeatureServer/0'
    );
  map.addLayer(
    featureLayer
  );

        var circle;

        // When the map is clicked create a buffer around the click point of the specified distance
        map.on("click", function(evt){
          circle = new Circle({
            center: evt.mapPoint,
            geodesic: true,
            radius: 10,
            radiusUnit: "esriFeet"
          });

          var query = new Query();
          query.geometry = circle.getExtent();
          // Use a fast bounding box query. It will only go to the server if bounding box is outside of the visible map.
          featureLayer.queryFeatures(query, selectInBuffer);
        });

        function selectInBuffer(response){
          var feature = response.features[0];

          window.scrollBy(0, 700);
          const pinInputContainer = window.parent.document.getElementsByClassName("gismap-pin-input")[0];
          if (pinInputContainer) {
            const inputElement = pinInputContainer.getElementsByTagName("INPUT")[0];
            if (inputElement) {
              inputElement.value = feature.attrs.PROPGISID1 + '-ADD';
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
});
</script>

<template>
  <div id="map" class="h-screen"></div>
</template>
