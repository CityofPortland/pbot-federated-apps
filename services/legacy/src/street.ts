/* eslint-disable @typescript-eslint/naming-convention */
import { GraphQLBoolean, GraphQLFloat } from 'graphql';
// @flow strict
import along from '@turf/along';
import bboxf from '@turf/bbox';
import buffer from '@turf/buffer';
import distance from '@turf/distance';
import { feature, Units } from '@turf/helpers';
import length from '@turf/length';
import { BBox, Feature, FeatureCollection, LineString, Point } from 'geojson';
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { arcgisToGeoJSON } from '@terraformer/arcgis';
import Graphic from '@arcgis/core/Graphic.js';

import axios from './api/arcgis.js';
import { errorProperties, getLogger } from './logging.js';
import { esriGeometry, esriGeometryType } from './common/geojson.js';
import { GeometryObject } from './geojson.js';
import {
  AreaPlan,
  areaPlanType,
  getAreaPlansByBBox,
} from './plan/area-plan.js';
import {
  getMasterStreetPlansByBBox,
  masterStreetPlanType,
} from './plan/master-street-plan.js';
import { MasterStreetPlan } from './plan/types.js';
import proj4 from './proj4.js';
import { getProjects, Project, projectType } from './project.js';

const URLS = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/15',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/16',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/16',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/22',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/24',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/27',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Planning/MapServer/31',
];

export type Street = {
  id?: string;
  name?: string;
  block?: number;
  width?: number;
  classifications?: Classification;
  projects?: Array<string>;
  midpoint: Point;
  geometry: LineString;
};

export type Classification = {
  traffic?: string;
  transit?: string;
  bicycle?: string;
  pedestrian?: string;
  freight?: string;
  emergency?: string;
  design?: string;
  greenscape?: string;
};

const midpoint = (geometry: LineString) =>
  along(geometry, length(feature(geometry), { units: 'meters' }) / 2, {
    units: 'meters',
  }).geometry;

const buffered = (
  geometry: LineString,
  distance: number,
  unit: Units = 'meters'
) => {
  const value = buffer(geometry, distance, { units: unit });

  if (!value) {
    throw new EvalError('Failed to buffer geometry');
  }

  return value.geometry;
};

export const classificationType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Classification',
  description:
    'An object describing the combined classifications of a street in the City of Portland',
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fields: () => ({
    traffic: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
    transit: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
    bicycle: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
    pedestrian: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
    freight: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
    emergency: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
    design: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
    greenscape: {
      type: GraphQLString,
      description: 'The planning id of the street.',
    },
  }),
});

/**
 * Streets combine segments that have a planning ID associated with them from the Transportation System Plan
 *
 */
export const streetType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Street',
  description: 'A segment in the City of Portland',
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The PBOT planning id of the street.',
    },
    name: {
      type: GraphQLString,
      description: 'The full name of the street.',
    },
    geometry: {
      type: GeometryObject,
      description: 'The GeoJSON LineString representing the street',
    },
    block: {
      type: GraphQLInt,
      description: 'The block number of the street.',
      resolve: async (street: Street): Promise<number | undefined> => {
        const url =
          'https://www.portlandmaps.com/arcgis/rest/services/Public/Street_Centerlines/MapServer/0';

        try {
          const res = await axios.get(`${url}/query`, {
            params: {
              f: 'geojson',
              geometryType: esriGeometryType(street.geometry),
              geometry: esriGeometry(street.geometry),
              spatialRel: 'esriSpatialRelEnvelopeIntersects',
              inSR: 4326,
              outSR: 4326,
              outFields: 'FULL_NAME, LEFTADD1, LEFTADD2, RGTADD1, RGTADD2',
            },
          });

          if (
            res.status == 200 &&
            res.data &&
            res.data.features &&
            res.data.features.length > 0
          ) {
            // sort the features by distance
            // find midpoints
            // sort array by distance
            const features: Array<
              Feature<
                LineString,
                {
                  LEFTADD1: number;
                  LEFTADD2: number;
                  RGTADD1: number;
                  RGTADD2: number;
                }
              >
            > = res.data.features
              .filter((f: Feature<LineString, { FULL_NAME: string }>) =>
                street.name?.startsWith(f.properties.FULL_NAME)
              )
              .map((f: Feature<LineString, { distance: number }>) => {
                f.properties.distance = distance(
                  street.midpoint,
                  midpoint(f.geometry),
                  { units: 'meters' }
                );

                return f;
              })
              .sort(
                (
                  a: Feature<LineString, { distance: number }>,
                  b: Feature<LineString, { distance: number }>
                ) => a.properties.distance - b.properties.distance
              );

            const feature = features.shift();

            if (feature) {
              return Math.min(
                feature.properties.LEFTADD1,
                feature.properties.LEFTADD2,
                feature.properties.RGTADD1,
                feature.properties.RGTADD2
              );
            }
          }
        } catch (err) {
          getLogger(['legacy', 'streets']).warning(
            'Unable to resolve street block',
            errorProperties(err)
          );
        }

        return undefined;
      },
    },
    width: {
      type: GraphQLFloat,
      description: 'Street width in feet',
      resolve: async (street: Street): Promise<number | undefined> => {
        const url =
          'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Assets/MapServer/139';

        const geometry = buffered(street.geometry, 10);

        if (geometry) {
          try {
            const res = await axios.get<
              FeatureCollection<
                LineString,
                { distance: number; RoadWidth: number; Streetname: string }
              >
            >(`${url}/query`, {
              params: {
                f: 'geojson',
                geometryType: esriGeometryType(geometry),
                geometry: esriGeometry(geometry),
                spatialRel: 'esriSpatialRelEnvelopeIntersects',
                inSR: 4326,
                outSR: 4326,
                outFields: 'Streetname, RoadWidth',
              },
            });

            if (
              res.status == 200 &&
              res.data &&
              res.data.features &&
              res.data.features.length > 0
            ) {
              // Attempt to filter the list down so we're not calculating midpoint of too many streets //
              const features = res.data.features
                .filter(f => street.name?.startsWith(f.properties?.Streetname))
                .map(f => {
                  f.properties.distance = distance(
                    street.midpoint,
                    midpoint(f.geometry),
                    { units: 'meters' }
                  );

                  return f;
                })
                .sort((a, b) => a.properties.distance - b.properties.distance);

              return features.shift()?.properties.RoadWidth;
            }
          } catch (err) {
            getLogger(['legacy', 'streets']).warning(
              'Unable to resolve street width',
              errorProperties(err)
            );
          }
        }

        return undefined;
      },
    },
    oneWay: {
      type: GraphQLBoolean,
      description: 'Whether this street is one-way',
      resolve: async (street: Street): Promise<boolean | undefined> => {
        const url =
          'https://www.portlandmaps.com/arcgis/rest/services/Public/COP_OpenData_Transportation/MapServer/68';

        const bbox = bboxf(buffered(street.geometry, 10));

        if (bbox) {
          const [xmin, ymin, xmax, ymax] = bbox;
          try {
            const res = await axios.get<
              FeatureCollection<
                LineString,
                { DIRECTION: number; distance: number; FULL_NAME: string }
              >
            >(`${url}/query`, {
              params: {
                f: 'geojson',
                geometryType: 'esriGeometryEnvelope',
                geometry: {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  spatialReference: {
                    wkid: 4326,
                  },
                },
                spatialRel: 'esriSpatialRelEnvelopeIntersects',
                inSR: 4326,
                outSR: 4326,
                outFields: 'FULL_NAME, DIRECTION',
              },
            });

            if (
              res.status == 200 &&
              res.data &&
              res.data.features &&
              res.data.features.length > 0
            ) {
              // Attempt to filter the list down so we're not calculating midpoint of too many streets //
              const features = res.data.features
                .filter(f => street.name?.startsWith(f.properties?.FULL_NAME))
                .map(f => {
                  f.properties.distance = distance(
                    street.midpoint,
                    midpoint(f.geometry),
                    { units: 'meters' }
                  );

                  return f;
                })
                .sort((a, b) => a.properties.distance - b.properties.distance);

              const direction = features.shift()?.properties.DIRECTION;

              return direction ? new Set([2, 3]).has(direction) : undefined;
            }
          } catch (err) {
            getLogger(['legacy', 'streets']).warning(
              'Unable to resolve street direction',
              errorProperties(err)
            );
          }
        }

        return undefined;
      },
    },
    centroid: {
      type: GeometryObject,
      description: 'The midpoint of the street',
      resolve: (street: Street): Point => {
        return along(street.geometry, length(feature(street.geometry)) / 2)
          .geometry;
      },
    },
    classifications: {
      type: classificationType,
      description: 'The list of classifications associated with this street',
    },
    projects: {
      type: new GraphQLList(projectType),
      description:
        'The projects that intersect with the bounding box of this street',
      resolve: (street: Street): Promise<Project[]> => getProjects(street),
    },
    areaPlans: {
      type: new GraphQLList(areaPlanType),
      description:
        'The area plans that intersect with the bounding box of this street',
      resolve: (street: Street): Promise<AreaPlan[] | null> =>
        getAreaPlansByBBox(bboxf(street.geometry), 4326),
    },
    masterStreetPlans: {
      type: new GraphQLList(masterStreetPlanType),
      description:
        'The master street plans that intersect with the bounding box of this street',
      resolve: (street: Street): Promise<MasterStreetPlan[] | null> =>
        getMasterStreetPlansByBBox(bboxf(street.geometry), 4326),
    },
    relatedStreets: {
      type: new GraphQLList(streetType),
      description: 'The street segments that adjoin this street segment',
      resolve: async (street: Street): Promise<Street[] | null> => {
        return getStreets(bboxf(street.geometry), 4326);
      },
    },
  }),
});

/**
 * Transform a GeoJSON street feature into an internal Street object
 * @param feature GeoJSON Feature from a portlandmaps ArcGIS REST API
 */
export function parseStreet(feature: Graphic): Street {
  const geometry = arcgisToGeoJSON(feature.geometry) as LineString;

  if (!feature.attributes) {
    return {
      geometry,
      midpoint: midpoint(geometry),
    };
  }

  return {
    id: feature.attributes.TranPlanID,
    name: feature.attributes.StreetName
      ? feature.attributes.StreetName.trim()
      : 'Unnamed segment',
    geometry,
    midpoint: midpoint(geometry),
    classifications: {
      traffic: feature.attributes.Traffic,
      transit: feature.attributes.Transit,
      bicycle: feature.attributes.Bicycle,
      pedestrian: feature.attributes.Pedestrian,
      freight: feature.attributes.Freight,
      emergency: feature.attributes.Emergency,
      design: feature.attributes.Design,
      greenscape: feature.attributes.Greenscape,
    },
  };
}

/**
 * Helper function to get a street by ID.
 */
export async function getStreet(id: string): Promise<Street | null> {
  // Returning a promise just to illustrate GraphQL.js's support.
  for (const url of URLS) {
    const res = await axios.get(`${url}/query`, {
      params: {
        f: 'json',
        where: `TranPlanID='${id}'`,
        outSR: '4326',
        outFields: '*',
      },
    });

    if (res.status == 200 && res.data && res.data.features) {
      const data = res.data.features;

      if (data) {
        return data.map((value: Graphic) => {
          return parseStreet(value);
        });
      }
    }
  }

  return null;
}

/**
 * Helper function to get a streets within a bounding box.
 */
export async function getStreets(
  bbox: BBox,
  spatialReference: number
): Promise<Street[] | null> {
  if (spatialReference != 4326) {
    [bbox[0], bbox[1]] = proj4(`EPSG:${spatialReference}`, 'EPSG:4326', [
      bbox[0],
      bbox[1],
    ]);
    [bbox[2], bbox[3]] = proj4(`EPSG:${spatialReference}`, 'EPSG:4326', [
      bbox[2],
      bbox[3],
    ]);
  }

  for (const url of URLS) {
    const res = await axios.get(`${url}/query`, {
      params: {
        f: 'json',
        geometryType: 'esriGeometryEnvelope',
        geometry: bbox.join(','),
        spatialRel: 'esriSpatialRelIntersects',
        inSR: '4326',
        outSR: '4326',
        outFields: '*',
      },
    });

    if (res.status == 200 && res.data && res.data.features) {
      const data = res.data.features;

      return data.map((value: Graphic) => {
        return parseStreet(value);
      });
    }
  }

  return null;
}
