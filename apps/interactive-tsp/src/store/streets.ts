import area from '@turf/area';
import bboxPolygon from '@turf/bbox-polygon';
import * as turf from '@turf/helpers';
import length from '@turf/length';
import axios from 'axios';
import { rgb, HSLColor, RGBColor } from 'd3-color';
import { LineString } from 'geojson';
import { defineStore } from 'pinia';
import proj4 from 'proj4';
import { v4 as uuidv4 } from 'uuid';
import { markRaw } from 'vue';

import Layer from '@arcgis/core/layers/Layer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import UniqueValueInfo from '@arcgis/core/renderers/support/UniqueValueInfo';
import { GoToTarget2D } from '@arcgis/core/views/types';

import { query, type QuerySelection } from '../queries/query';
import { getLogger } from '../logging';

import { esriGraphics } from './utils';
import { useMapStore } from './map';
import { useMessageStore } from './message';
import type { AreaPlan } from './areaPlans';
import type { MasterStreetPlan } from './masterStreetPlans';
import type { Project } from './projects';

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));

const logger = getLogger(['interactive-tsp', 'streets']);

const classificationSelection = {
  pedestrian: true,
  bicycle: true,
  transit: true,
  freight: true,
  design: true,
  emergency: true,
  traffic: true,
  greenscape: true,
} satisfies QuerySelection;

export interface Street {
  uuid: string;
  id: string;
  name?: string;
  block?: number;
  classifications?: { [key: string]: string };
  projects?: Array<Project>;
  areaPlans?: Array<AreaPlan>;
  masterStreetPlans?: Array<MasterStreetPlan>;
  geometry?: LineString;
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export interface BaseSymbol {
  type: 'color' | 'image';
  value: RGBColor | HSLColor | string | null;
}

export interface ImageSymbol extends BaseSymbol {
  mime: string;
  value: string;
}

export interface StreetViewModel {
  value: string;
  group: string;
  enabled: boolean;
  label: string;
  symbol?: BaseSymbol | ImageSymbol;
  layer?: Layer;
}

const districts = new Map([
  [
    'pedestrian',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/16',
  ],
  [
    'bicycle',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/13',
  ],
  [
    'freight',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/20',
  ],
]);

const classifications = new Map([
  [
    'pedestrian',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15',
  ],
  [
    'bicycle',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12',
  ],
  [
    'transit',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3',
  ],
  [
    'freight',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19',
  ],
  [
    'design',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10',
  ],
  [
    'emergency',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7',
  ],
  [
    'traffic',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4',
  ],
]);

export const useStreetStore = defineStore('streets', {
  state: () => ({
    list: undefined as Street[] | undefined,
    selected: undefined as Street[] | undefined,
    models: new Array<StreetViewModel>(),
  }),
  getters: {
    classificationLabel: state => (type: string, value: string) => {
      return (
        state.models?.find(val => {
          return val.group === type && val.value === value;
        })?.label || 'N/A'
      );
    },
    classificationColor: state => (type: string, value: string) => {
      const info = state.models?.find(val => {
        return val.group === type && val.value === value;
      });
      return info?.symbol?.value || rgb(255, 255, 255, 0);
    },
  },
  actions: {
    // populates the district and classification view models/layers used to color streets
    async loadModels() {
      if (this.models.length > 0) return;

      const models = new Array<StreetViewModel>();

      await Promise.all(
        Array.from(districts).map(async ([group, url]) => {
          const res = await axios.get(url, { params: { f: 'json' } });

          if (res.data) {
            const layer = res.data;
            models.push({
              group,
              value: 'undefined',
              enabled: false,
              label: layer.name,
              symbol: {
                type: 'image',
                mime: layer.drawingInfo.renderer.symbol.contentType,
                value: layer.drawingInfo.renderer.symbol.imageData,
              },
              layer: markRaw(
                new FeatureLayer({
                  url,
                  visible: false,
                })
              ),
            });
          }
        })
      );

      await Promise.all(
        Array.from(classifications).map(async ([group, url]) => {
          const res = await axios.get(url, { params: { f: 'json' } });

          if (res.data) {
            models.push(
              ...res.data.drawingInfo.renderer.uniqueValueInfos.map(
                (json: UniqueValueInfo): StreetViewModel => {
                  const info = UniqueValueInfo.fromJSON(json);
                  const { r, g, b, a } = info.symbol.color;
                  return {
                    group,
                    value: info.value.toString(),
                    enabled: false,
                    label: info.label,
                    symbol: { type: 'color', value: rgb(r, g, b, a) },
                    layer: markRaw(
                      new FeatureLayer({
                        url,
                        outFields: ['*'],
                        definitionExpression: `${group} = '${info.value.toString()}'`,
                        visible: false,
                      })
                    ),
                  };
                }
              )
            );
          }
        })
      );

      models.push({
        group: 'greenscape',
        value: 'Y',
        enabled: false,
        label: 'Yes',
      });

      this.models = models;
    },
    async findStreets(extent: __esri.Extent) {
      const messages = useMessageStore();

      let { xmin, ymin, xmax, ymax } = extent;

      if (
        extent.spatialReference.wkid &&
        extent.spatialReference.wkid != 4326
      ) {
        [xmin, ymin] = proj4(
          extent.spatialReference.wkid.toString(),
          'EPSG:4326',
          [xmin, ymin]
        );
        [xmax, ymax] = proj4(
          extent.spatialReference.wkid.toString(),
          'EPSG:4326',
          [xmax, ymax]
        );
      }

      if (area(bboxPolygon([xmin, ymin, xmax, ymax])) > 1250000) {
        logger.debug('Street lookup skipped: extent exceeds area limit');
        messages.addMessage({
          id: 'streets-zoom-in',
          type: 'info',
          text: 'Zoom in or search for an address to see available streets...',
          dismissible: true,
        });
        return;
      }

      messages.removeMessage('streets-zoom-in');
      messages.addMessage({
        id: 'streets-retrieving',
        type: 'info',
        text: 'Retrieving streets...',
        dismissible: false,
      });

      try {
        const res = await query<{ streets?: Street[] }>({
          field: 'streets',
          args: { bbox: [xmin, ymin, xmax, ymax], spatialReference: 4326 },
          select: {
            id: true,
            name: true,
            block: true,
            classifications: { select: classificationSelection },
            geometry: { select: { type: true, coordinates: true } },
          },
        });

        if (res.errors) {
          messages.addMessage({
            id: 'streets-graphql-error',
            type: 'warning',
            text: 'Some data may contain errors...',
            dismissible: true,
          });
        }

        if (res.data?.streets) {
          // sort by name then block number
          const streets = res.data.streets.sort((a, b) => {
            const nameA = a.name?.toUpperCase();
            const nameB = b.name?.toUpperCase();

            if (!nameA || !nameB) return Number.MAX_SAFE_INTEGER;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return (
              (a.block || Number.MAX_SAFE_INTEGER) -
              (b.block || Number.MIN_SAFE_INTEGER)
            );
          });

          streets.forEach(street => {
            street.uuid = uuidv4();
          });

          this.list = streets;
          logger.debug('Street list updated', { count: streets.length });
        }
      } catch {
        messages.addMessage({
          id: 'streets-error-retrieving',
          type: 'error',
          text: 'Error retrieving streets!',
          dismissible: true,
        });
      }

      messages.removeMessage('streets-retrieving');
    },
    async selectStreet(street: Street) {
      const messages = useMessageStore();

      messages.addMessage({
        id: 'streets-retrieving-street',
        type: 'info',
        text: `Retrieving street ${street.id}...`,
        dismissible: false,
      });
      this.selected = undefined;

      try {
        const res = await query<{ street?: Street[] }>({
          field: 'street',
          args: { id: street ? street.id : '' },
          select: {
            id: true,
            name: !street.name,
            block: !street.block,
            geometry: !street.geometry && {
              select: { type: true, coordinates: true },
            },
            classifications: !street.classifications && {
              select: classificationSelection,
            },
            projects: !street.projects && {
              select: {
                id: true,
                name: true,
                number: true,
                description: true,
                estimatedCost: true,
                estimatedTimeframe: true,
              },
            },
            masterStreetPlans: !street.masterStreetPlans && {
              select: {
                id: true,
                name: true,
                description: true,
                adopted: true,
              },
            },
            areaPlans: !street.areaPlans && {
              select: {
                id: true,
                name: true,
                description: true,
                adopted: true,
              },
            },
          },
        });

        if (res.errors) {
          messages.addMessage({
            id: 'streets-graphql-error',
            type: 'warning',
            text: 'Some data may contain errors...',
            dismissible: true,
          });
        }

        if (res.data?.street) {
          this.selected = res.data.street;
          this.highlightStreet({ street: res.data.street[0], move: true });
        }
      } catch {
        messages.addMessage({
          id: 'streets-error-retrieving-street',
          type: 'error',
          text: 'Error retrieving the selected street!',
          dismissible: true,
        });
      }

      messages.removeMessage('streets-retrieving-street');
    },
    highlightStreet({ street, move }: { street: Street; move: boolean }) {
      const map = useMapStore();

      if (street.geometry) {
        const graphics = esriGraphics(street.geometry);
        map.setGraphics(graphics);

        if (move) {
          const target: GoToTarget2D = {
            target: graphics,
          };
          // for small features, don't zoom in too close
          const l = length(turf.feature(street.geometry), { units: 'meters' });
          if (l < 200) {
            target.zoom = map.zoom.focus;
          }
          map.goTo(target);
        }
      }
    },
  },
});
