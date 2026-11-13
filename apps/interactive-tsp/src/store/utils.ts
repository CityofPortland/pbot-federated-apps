import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Multipoint from '@arcgis/core/geometry/Multipoint';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { Geometry } from 'geojson';
import { Builder, Token } from 'lunr';
import lunr from 'lunr';
import ArcGISParser from 'terraformer-arcgis-parser';

export function esriGeometry(geometry: Geometry): ArcGISParser.Geometry {
  return ArcGISParser.convert(geometry);
}

export const lightColor = [76, 69, 79];
export const darkColor = [26, 19, 29];

export function esriGraphics(geometry: Geometry): Graphic[] {
  switch (geometry.type) {
    case 'Point':
      return [
        new Graphic({
          geometry: new Point(esriGeometry(geometry)),
          symbol: new SimpleMarkerSymbol({
            color: [...lightColor, 0.5],
            outline: {
              color: darkColor,
              width: 2,
            },
          }),
        }),
      ];
    case 'MultiPoint':
      return [
        new Graphic({
          geometry: new Multipoint(esriGeometry(geometry)),
          symbol: new SimpleMarkerSymbol({
            color: [...lightColor, 0.5],
            outline: {
              color: darkColor,
              width: 2,
            },
          }),
        }),
      ];
    case 'LineString':
    case 'MultiLineString':
      return [
        new Graphic({
          geometry: new Polyline(esriGeometry(geometry)),
          symbol: new SimpleLineSymbol({
            color: [...darkColor, 0.3],
            width: 10,
          }),
        }),
      ];
    case 'Polygon':
    case 'MultiPolygon':
      return [
        new Graphic({
          geometry: new Polygon(esriGeometry(geometry)),
          symbol: new SimpleFillSymbol({
            color: [...lightColor, 0.3],
            outline: {
              color: darkColor,
              width: 4,
            },
          }),
        }),
      ];
    default:
      return [];
  }
}

const customWordMap = new Map<string, string>([
  ['bicycle', 'bike'],
  ['bikeway', 'bike'],
  ['walkway', 'walk'],
]);

export function customStemming(builder: Builder) {
  // Define a pipeline function that converts 'gray' to 'grey'
  const pipelineFunction = function (token: Token) {
    if (customWordMap.has(token.toString())) {
      return token.update(function () {
        return customWordMap.get(token.toString());
      });
    } else {
      return token;
    }
  };

  // Register the pipeline function so the index can be serialised
  lunr.Pipeline.registerFunction(pipelineFunction, 'customStemming');

  // Add the pipeline function to both the indexing pipeline and the
  // searching pipeline
  builder.pipeline.before(lunr.stemmer, pipelineFunction);
  builder.searchPipeline.before(lunr.stemmer, pipelineFunction);
}

export function hash(title: string) {
  let hash = 0,
    i,
    chr;
  for (i = 0; i < title.length; i++) {
    chr = title.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
