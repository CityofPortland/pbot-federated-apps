import bbox from '@turf/bbox';
import turf, { BBox, Feature, Geometry, GeometryCollection, LineString } from '@turf/helpers';
import { GraphQLFloat, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import proj4 from 'proj4';

import axios from './api/arcgis';
import { GeometryObject } from './geojson';
import { Street } from './street';

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));
proj4.defs('EPSG:102100', proj4.defs('EPSG:3857'));

const URLS = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24'
];

export type Project = {
  id: string;
  name: string;
  number?: number;
  location?: string;
  description?: string;
  agency?: string;
  estimatedCost?: number;
  estimatedTimeframe?: string;
  district?: string;
  facilityOwner?: string;
  patternArea?: string;
  fundingCategory?: string;
  geometry: Geometry | GeometryCollection;
};

export const projectType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Project',
  description: 'A transportation project in the City of Portland',
  fields: {
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The planning id of the project.'
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name given to of the project.'
    },
    geometry: {
      type: GeometryObject,
      description: 'The GeoJSON object representing the project'
    },
    number: {
      type: GraphQLFloat,
      description: 'The internal number of the project'
    },
    location: {
      type: GraphQLString,
      description: 'An internal location description of the project'
    },
    description: {
      type: GraphQLString,
      description: 'The description of what the project will accomplish when completed'
    },
    agency: {
      type: GraphQLString,
      description: 'The agency in charge of the project'
    },
    estimatedCost: {
      type: GraphQLFloat,
      description: 'An estimated cost to complete the project'
    },
    estimatedTimeframe: {
      type: GraphQLString,
      description: 'The 10 year estimate group for when this project will be completed'
    },
    district: {
      type: GraphQLString,
      description: ''
    },
    facilityOwner: {
      type: GraphQLString,
      description: 'The agency that controls the facility affected by this project'
    },
    patternArea: {
      type: GraphQLString,
      description: 'Which pattern area this project affects'
    },
    fundingCategory: {
      type: GraphQLString,
      description: ''
    }
  }
});

function parseProject(feature: Feature): Project {
  if (!feature.properties) {
    return {
      id: 'null',
      name: 'null',
      geometry: feature.geometry
    };
  }

  return {
    id: feature.properties.TranPlanID,
    name: feature.properties.ProjectName,
    geometry: feature.geometry,
    number: feature.properties.ProjectNumber,
    location: feature.properties.ProjectLocation,
    description: feature.properties.ProjectDescription,
    agency: feature.properties.LeadAgency,
    estimatedCost: feature.properties.EstimatedCost,
    estimatedTimeframe: feature.properties.EstimatedTimeframe,
    district: feature.properties.TSPDistrict,
    facilityOwner: feature.properties.FacilityOwner,
    patternArea: feature.properties.PatternArea,
    fundingCategory: feature.properties.TSPFundingCategory
  };
}

export async function getProjects(street: Street): Promise<Project[]> {
  const box = bbox(street.geometry);

  const projects = new Array<Project>();

  for (const url of URLS) {
    const res = await axios
      .get<turf.FeatureCollection<turf.Geometry>>(`${url}/query`, {
        params: {
          f: 'geojson',
          geometryType: 'esriGeometryEnvelope',
          geometry: box.join(','),
          spatialRel: 'esriSpatialRelIntersects',
          inSR: '4326',
          outSR: '4326',
          outFields: '*'
        }
      })
      .catch((err) => {
        throw new Error(err);
      });

    if (res.status == 200 && res.data && res.data.features) {
      const data: Feature<Geometry>[] = res.data.features;

      projects.push(...data.map((value) => parseProject(value)));
    }
  }

  return projects;
}

export async function getProjectsById(id: string): Promise<Project[]> {
  const projects = new Array<Project>();

  for (const url of URLS) {
    const res = await axios
      .get<turf.FeatureCollection<turf.Geometry>>(`${url}/query`, {
        params: {
          f: 'geojson',
          where: `TranPlanID='${id}'`,
          outSR: '4326',
          outFields: '*'
        }
      })
      .catch((err) => {
        throw new Error(err);
      });

    if (res.status == 200 && res.data && res.data.features) {
      const data: Feature<Geometry>[] = res.data.features;

      projects.push(...data.map((value) => parseProject(value)));
    }
  }

  return projects;
}

/**
 * Helper function to get a streets within a bounding box.
 */
export async function getProjectsByBBox(bbox: BBox, spatialReference: number): Promise<Project[] | null> {
  if (spatialReference != 4326) {
    [bbox[0], bbox[1]] = proj4(`${spatialReference}`, 'EPSG:4326', [bbox[0], bbox[1]]);
    [bbox[2], bbox[3]] = proj4(`${spatialReference}`, 'EPSG:4326', [bbox[2], bbox[3]]);
  }

  const projects = new Array<Project>();

  for (const url of URLS) {
    const res = await axios
      .get(`${url}/query`, {
        params: {
          f: 'geojson',
          geometryType: 'esriGeometryEnvelope',
          geometry: bbox.join(','),
          spatialRel: 'esriSpatialRelIntersects',
          inSR: '4326',
          outSR: '4326',
          outFields: '*'
        }
      })
      .catch((err) => {
        throw new Error(err);
      });

    if (res.status == 200 && res.data && res.data.features) {
      const data: Feature<LineString>[] = res.data.features;

      projects.push(
        ...data.map((value: Feature<LineString>) => {
          return parseProject(value);
        })
      );
    }
  }

  return projects;
}
