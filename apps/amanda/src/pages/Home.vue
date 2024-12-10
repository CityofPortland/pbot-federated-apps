<script setup lang="js">
import { onMounted } from 'vue';

onMounted(() => {
  var map;
  require([
    'esri/map',
    'esri/dijit/Basemap',
    'esri/dijit/BasemapLayer',
    'esri/geometry/Extent',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/SpatialReference',
    'esri/dijit/BasemapGallery',
    'esri/arcgis/utils',
    'dojo/parser',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'dijit/TitlePane',
    'dojo/domReady!',
  ], function (
    Map,
    Basemap,
    BasemapLayer,
    Extent,
    TileLayer,
    SpatialReference,
    BasemapGallery,
    arcgisUtils,
    parser
  ) {
    parser.parse();

    const layers = [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Complete/MapServer'
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

    amanda.initialize(map, {
      "serviceUrl": "https://play.csdcsystems.com/axis",
      "serviceToken": "mG8kZXrbYQMHsADK3XHVDQieie",
      "pushpinImage": "widgets/AmandaGIS/images/map-marker-red-32.png",
      "highlightedPushpinImage": "widgets/AmandaGIS/images/map-marker-blue-32.png",
      "logLevel": "DEBUG"
    });
  });
})
</script>

<template>
  <div data-dojo-type="dijit/layout/BorderContainer" data-dojo-props="design:'headline', gutters:false"
    style="width: 100%; height: 100%; margin: 0">
    <div id="map" data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'center'" style="padding: 0">
    </div>
  </div>
</template>
