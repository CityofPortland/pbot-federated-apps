import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import { AreaPermitZone } from './types';

let REFRESHING = false;

export const AREA_PERMIT_ZONE_REGEX = /^APP Zone ([A-Z]+)[\s\W]?(.*)/im;

export const areaPermitZones: Array<AreaPermitZone> | null = null;

export const areaPermitZoneType = new GraphQLObjectType({
  name: 'AreaPermitZone',
  description: 'AreaPermitZoneType',
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fields: {
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString,
      description: 'Name of the zone as it appears in the system of record'
    },
    displayName: {
      type: GraphQLString,
      description: 'String for use in things like labels or selections'
    },
    subSection: {
      type: GraphQLString,
      description: 'Portion of Zone name that signifies a sub-section of the larger zone'
    }
  }
});

async function refreshAreaPermitZones(): Promise<AreaPermitZone[] | null> {
  REFRESHING = true;

  try {
    if (!process.env.AREA_PERMIT_CALE_USERNAME || !process.env.AREA_PERMIT_CALE_PASSWORD) {
      throw Error('No API credentials found, unable to call Cale API');
    }

    // get Zones from Cale //
    const res = await axios.get(
      `${process.env.CALE_WEBOFFICE_HOST}/cwo2exportservice/Enforcement/1/EnforcementService.svc/getenforcementzones`,
      {
        auth: { username: process.env.AREA_PERMIT_CALE_USERNAME, password: process.env.AREA_PERMIT_CALE_PASSWORD },
        headers: {
          'content-type': 'application/json'
        }
      }
    );

    if (res.status == 200 && res.data) {
      const parser = new XMLParser();
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const zones: { Description: string; Name: string }[] = parser.parse(res.data).ArrayOfEnforcementZone
        .EnforcementZone;

      return zones
        .filter((zone) => AREA_PERMIT_ZONE_REGEX.test(zone.Name))
        .reduce((acc, curr) => {
          const matches = AREA_PERMIT_ZONE_REGEX.exec(curr.Name);

          if (matches) {
            // We only want to display the description of zones that are the 'main' section
            const displayName = () => {
              return `Zone ${matches[1]}${curr.Description && !matches[2] ? ' (' + curr.Description + ')' : ''}`;
            };

            const z = {
              id: matches[1].toUpperCase(),
              name: curr.Name,
              displayName: displayName(),
              subSection: matches[2]
            } as AreaPermitZone;

            acc.push(z);
          }

          return acc;
        }, new Array<AreaPermitZone>());
    }
  } catch (err) {
    throw err;
  } finally {
    REFRESHING = false;
  }

  return null;
}

export async function getAreaPermitZones(refreshFromSource = true): Promise<Array<AreaPermitZone> | null> {
  if (areaPermitZones == null) {
    // Haven't retrieved the zones yet...
    // look them up
    return await refreshAreaPermitZones();
  } else {
    // We have already retrieved the zones at least once...
    // if its refreshing, return in-memory zones //
    if (REFRESHING) {
      return areaPermitZones;
    } else {
      // Allow a toggle to prevent refreshing
      // Used when resolving a zone from another object
      if (refreshFromSource) {
        refreshAreaPermitZones();
      }
      return areaPermitZones;
    }
    // else return areaPermitZones then refresh in background //
  }
}
