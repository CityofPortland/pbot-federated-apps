import {
  GraphQLFieldConfig,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import type { Logger } from './logging.js';

export type ResolverContext = {
  logger: Logger;
};

import { addressType, searchAddress, searchTaxLot } from './address/index.js';
import { Address } from './address/types.js';
import { getDocument, sectionType } from './document/index.js';
import {
  AreaPlan,
  areaPlanType,
  getAreaPlansByBBox,
  getAreaPlansById,
} from './plan/area-plan.js';
import {
  getMasterStreetPlansByBBox,
  getMasterStreetPlansById,
  masterStreetPlanType,
} from './plan/master-street-plan.js';
import { MasterStreetPlan } from './plan/types.js';
import {
  getProjectsByBBox,
  getProjectsById,
  Project,
  projectType,
} from './project.js';
import { getStreet, getStreets, Street, streetType } from './street.js';
import { AreaPermit, AreaPermitZone } from './area-permit/types.js';
import { areaPermitType, lookupAreaPermit } from './area-permit/area-permit.js';
import {
  areaPermitZoneType,
  getAreaPermitZones,
} from './area-permit/area-permit-zone.js';

/**
 * This is the type that will be the root of our query, and the
 * entry point into our schema. It gives us the ability to fetch
 * objects by their IDs, as well as to fetch the undisputed hero
 * of the Star Wars trilogy, R2-D2, directly.
 *
 * This implements the following type system shorthand:
 *   type Query {
 *
 *   }
 *
 */
const queryType = new GraphQLObjectType<unknown, ResolverContext>({
  name: 'Query',
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fields: {
    document: {
      type: new GraphQLList(sectionType),
      description:
        'Retrieves a series of HTML sections that make up a document',
      args: {
        name: {
          description: 'The name of the document to retrieve',
          type: GraphQLString,
        },
      },
      resolve: async (_, { name }) => name && getDocument(name),
    } as GraphQLFieldConfig<unknown, ResolverContext, { name?: string }>,
    address: {
      type: new GraphQLList(addressType),
      description: 'Use portlandmaps.com geocoding to search Portland',
      args: {
        search: {
          description: 'search string to pass to the geocoding APIs',
          type: new GraphQLNonNull(GraphQLString),
        },
        city: {
          description: 'Limit the results to a specific city.',
          type: GraphQLString,
        },
      },
      resolve: async (
        _,
        { search, city }
      ): Promise<Array<Address> | undefined> => {
        return await searchAddress(search, city);
      },
    },
    taxLot: {
      type: new GraphQLList(addressType),
      description: 'Use portlandmaps.com assessor API to search Portland',
      args: {
        search: {
          description: 'search string to pass to the geocoding APIs',
          type: new GraphQLNonNull(GraphQLString),
        },
        city: {
          description: 'Limit the results to a specific city.',
          type: GraphQLString,
        },
      },
      resolve: async (_root, { search, city }): Promise<Array<Address>> => {
        return await searchTaxLot(search, city);
      },
    },
    masterStreetPlan: {
      type: new GraphQLList(masterStreetPlanType),
      description: 'Find a master street plan in Portland by id value',
      args: {
        id: {
          description: 'Value that is the TranPlanID of the master street plan',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (
        _root,
        { id }
      ): Promise<Array<MasterStreetPlan> | null | undefined> => {
        return await getMasterStreetPlansById(id);
      },
    },
    masterStreetPlans: {
      type: new GraphQLList(masterStreetPlanType),
      description:
        'Find master street plans in Portland by using a bounding box',
      args: {
        bbox: {
          description:
            'Array of numbers representing a bounding box to return streets for',
          type: new GraphQLNonNull(new GraphQLList(GraphQLFloat)),
        },
        spatialReference: {
          description: 'The spatial reference well-known ID ("wkid").',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (
        _root,
        { bbox, spatialReference }
      ): Promise<Array<MasterStreetPlan> | null> | undefined => {
        return getMasterStreetPlansByBBox(bbox, spatialReference);
      },
    },
    areaPlan: {
      type: new GraphQLList(areaPlanType),
      description: 'Find an area plan in Portland by planning id value',
      args: {
        id: {
          description: 'PBOT planning ID of the area plan',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (
        _root,
        { id }
      ): Promise<Array<AreaPlan> | null | undefined> => {
        return await getAreaPlansById(id);
      },
    },
    areaPlans: {
      type: new GraphQLList(areaPlanType),
      description:
        'Find master street plans in Portland by using a bounding box',
      args: {
        bbox: {
          description:
            'Array of numbers representing a bounding box to return streets for',
          type: new GraphQLNonNull(new GraphQLList(GraphQLFloat)),
        },
        spatialReference: {
          description: 'The spatial reference well-known ID ("wkid").',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (
        _root,
        { bbox, spatialReference }
      ): Promise<Array<AreaPlan> | null> | undefined => {
        return getAreaPlansByBBox(bbox, spatialReference);
      },
    },
    project: {
      type: new GraphQLList(projectType),
      description: 'Find a project in Portland by a PBOT planning ID',
      args: {
        id: {
          description: 'Transportation planning id of the project',
          type: GraphQLString,
        },
      },
      resolve: (_root, { id }): Promise<Array<Project>> => {
        return getProjectsById(id);
      },
    },
    projects: {
      type: new GraphQLList(projectType),
      description: 'Find streets in Portland by using a bounding box',
      args: {
        bbox: {
          description:
            'Array of numbers representing a bounding box to return streets for',
          type: new GraphQLNonNull(new GraphQLList(GraphQLFloat)),
        },
        spatialReference: {
          description: 'The spatial reference well-known ID ("wkid").',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (
        _root,
        { bbox, spatialReference }
      ): Promise<Array<Project> | null> | undefined => {
        return getProjectsByBBox(bbox, spatialReference);
      },
    },
    street: {
      type: new GraphQLList(streetType),
      description: 'Find a street in Portland by a PBOT planning ID',
      args: {
        id: {
          description: 'Transportation planning id of the street',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_root, { id }): Promise<Street | null> | undefined => {
        return getStreet(id);
      },
    },
    streets: {
      type: new GraphQLList(streetType),
      description: 'Find streets in Portland by using a bounding box',
      args: {
        bbox: {
          description:
            'Array of numbers representing a bounding box to return streets for',
          type: new GraphQLNonNull(new GraphQLList(GraphQLFloat)),
        },
        spatialReference: {
          description: 'The spatial reference well-known ID ("wkid").',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (
        _root,
        { bbox, spatialReference }
      ): Promise<Array<Street> | null> | undefined => {
        return getStreets(bbox, spatialReference);
      },
    },
    areaPermit: {
      type: new GraphQLNonNull(areaPermitType),
      description:
        'Query whether a license plate has a valid area parking permit in the specified zone.',
      args: {
        licensePlate: {
          description: 'License plate being queried',
          type: new GraphQLNonNull(GraphQLString),
        },
        zone: {
          description:
            'Permit zone being queried. Should be a valid areaPermitZone value.',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (
        _root,
        { licensePlate, zone }
      ): Promise<AreaPermit | null> | undefined =>
        lookupAreaPermit(licensePlate, zone),
    },
    areaPermitZone: {
      type: new GraphQLList(areaPermitZoneType),
      description: 'The list of all area parking permit zones.',
      resolve: (): Promise<AreaPermitZone[] | null> | undefined =>
        getAreaPermitZones(),
    },
  },
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export default new GraphQLSchema({
  query: queryType,
  types: [
    streetType,
    addressType,
    projectType,
    sectionType,
    areaPermitType,
    areaPermitZoneType,
  ],
});
