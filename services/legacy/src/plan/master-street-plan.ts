import bboxf from '@turf/bbox';
import { BBox, Feature, Geometry, Polygon } from 'geojson';
import { AxiosError } from 'axios';
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import axios from '../api/arcgis.js';
import { GeometryObject } from '../geojson.js';
import proj4 from '../proj4.js';
import { MasterStreetPlan, MasterStreetPlanFeature } from './types.js';

const PLANS_URL =
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/31';

const FEATURES_URL = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/29',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/30',
];

/**
 * Helper function to get a streets within a bounding box.
 */
export async function getMasterStreetPlansByBBox(
  bbox: BBox,
  spatialReference: number
): Promise<MasterStreetPlan[] | null> {
  if (spatialReference != 4326) {
    [bbox[0], bbox[1]] = proj4(`${spatialReference}`, 'EPSG:4326', [
      bbox[0],
      bbox[1],
    ]);
    [bbox[2], bbox[3]] = proj4(`${spatialReference}`, 'EPSG:4326', [
      bbox[2],
      bbox[3],
    ]);
  }

  let plans = new Array<MasterStreetPlan>();

  const res = await axios
    .get(`${PLANS_URL}/query`, {
      params: {
        f: 'geojson',
        geometryType: 'esriGeometryEnvelope',
        geometry: bbox.join(','),
        spatialRel: 'esriSpatialRelIntersects',
        inSR: '4326',
        outSR: '4326',
        outFields: '*',
      },
    })
    .catch((err: AxiosError) => {
      throw err;
    });

  if (res.status == 200 && res.data && res.data.features) {
    const data: Feature<Polygon>[] = res.data.features;

    plans = data.map(feature => {
      if (feature.properties) {
        return {
          id: feature.properties.TranPlanID,
          name: feature.properties.PlanArea,
          description: feature.properties.Description,
          manager: feature.properties.ProjectManager,
          adopted: feature.properties.AdoptedYear,
          document: feature.properties.DocumentLink,
          geometry: feature.geometry,
          bbox: bboxf(feature),
        };
      } else
        return {
          id: 'null',
          name: 'null',
          geometry: feature.geometry,
          bbox,
        };
    });
  }

  return plans;
}

/**
 * Helper function to get a streets within a bounding box.
 */
export async function getMasterStreetPlansById(
  id: string
): Promise<MasterStreetPlan[] | null> {
  let plans = new Array<MasterStreetPlan>();

  const res = await axios
    .get(`${PLANS_URL}/query`, {
      params: {
        f: 'geojson',
        where: `TranPlanID='${id}'`,
        outSR: '4326',
        outFields: '*',
      },
    })
    .catch((err: AxiosError) => {
      throw err;
    });

  if (res.status == 200 && res.data && res.data.features) {
    const data: Feature<Polygon>[] = res.data.features;

    plans = data.map(feature => {
      if (feature.properties) {
        return {
          id: feature.properties.TranPlanID,
          name: feature.properties.PlanArea,
          description: feature.properties.Description,
          manager: feature.properties.ProjectManager,
          adopted: feature.properties.AdoptedYear,
          document: feature.properties.DocumentLink,
          geometry: feature.geometry,
          bbox: bboxf(feature),
        };
      } else
        return {
          id: 'null',
          name: 'null',
          geometry: feature.geometry,
          bbox: bboxf(feature),
        };
    });
  }

  return plans;
}

async function getPlanFeatures(
  plan: MasterStreetPlan
): Promise<Array<MasterStreetPlanFeature>> {
  const features = new Array<MasterStreetPlanFeature>();

  const promises = FEATURES_URL.map(async url => {
    const res = await axios
      .get(`${url}/query`, {
        params: {
          f: 'geojson',
          where: `PlanArea='${plan.name}'`,
          outSR: '4326',
          outFields: '*',
        },
      })
      .catch((err: AxiosError) => {
        throw err;
      });

    if (res.status == 200 && res.data && res.data.features) {
      const data: Feature<Geometry>[] = res.data.features;

      features.push(
        ...data.map(feature => {
          if (feature.properties) {
            return {
              id: feature.properties.TranPlanID,
              type: feature.properties.Type,
              alignment: feature.properties.Alignment,
              geometry: feature.geometry,
            };
          } else
            return {
              id: 'null',
              geometry: feature.geometry,
            };
        })
      );
    }
  });

  await Promise.all(promises);

  return features;
}

export const masterStreetPlanFeatureType: GraphQLObjectType =
  new GraphQLObjectType({
    name: 'MasterStreetPlanFeature',
    description:
      "A feature of a documented plan for a section of Portland's streets",
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'An integer identifer for the plan.',
      },
      type: {
        type: GraphQLString,
        description: 'The type of feature',
      },
      alignment: {
        type: GraphQLString,
        description:
          'The description of the alignment characteristics of the feature',
      },
      geometry: {
        type: GeometryObject,
        description: 'The GeoJSON object representing the project',
      },
    }),
  });

export const masterStreetPlanType: GraphQLObjectType = new GraphQLObjectType({
  name: 'MasterStreetPlan',
  description: "A documented plan for a section of Portland's streets",
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'An identifer for the plan.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A friendly name for the plan',
    },
    description: {
      type: GraphQLString,
      description: 'A friendly description of this plan for user consumption',
    },
    manager: {
      type: GraphQLString,
      description: 'The name of the manager for this plan',
    },
    adopted: {
      type: GraphQLString,
      description: 'The year in which this plan was adopted',
    },
    document: {
      type: GraphQLString,
      description: 'A URL for viewing a document associated with the plan',
    },
    features: {
      type: new GraphQLList(masterStreetPlanFeatureType),
      description: 'The features related to the plan',
      resolve: async (
        plan: MasterStreetPlan
      ): Promise<Array<MasterStreetPlanFeature>> => {
        return getPlanFeatures(plan);
      },
    },
    geometry: {
      type: GeometryObject,
      description: 'The GeoJSON object representing the project',
    },
    bbox: {
      type: new GraphQLList(GraphQLFloat),
      description: 'The bounding box of the plan, in ESPG:4326',
    },
  }),
});
