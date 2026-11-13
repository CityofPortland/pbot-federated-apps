import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
type Geometry = any;

import Polygon from '@arcgis/core/geometry/Polygon';
import Layer from '@arcgis/core/layers/Layer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import { query } from '../queries/query';

import { esriGeometry, esriGraphics } from './utils';
import { defaultExtent, useMapStore } from './map';
import { useMessageStore } from './message';

export interface AreaPlan {
  id: number;
  name: string;
  description?: string;
  manager: string;
  requirements: string;
  adopted: string;
  document: string;
  geometry: Geometry;
}

const LAYER_URLS = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/26',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/27',
];

function initialLayers(): Layer[] {
  return [
    ...LAYER_URLS.map(url =>
      markRaw(
        new FeatureLayer({
          url,
          outFields: ['TranPlanID'],
          opacity: 0.5,
        })
      )
    ),
    markRaw(
      new GraphicsLayer({
        id: 'plan-selection',
      })
    ),
  ];
}

export const useAreaPlanStore = defineStore('areaPlans', {
  state: () => ({
    list: new Array<AreaPlan>(),
    selected: undefined as AreaPlan | undefined,
    layers: initialLayers(),
  }),
  actions: {
    async findPlans() {
      const messages = useMessageStore();
      const extent = defaultExtent;
      const { xmin, ymin, xmax, ymax } = extent;

      messages.removeMessage('area-plans-retrieving');
      messages.addMessage({
        id: 'area-plans-retrieving',
        type: 'info',
        text: 'Retrieving area plans...',
        dismissible: false,
      });

      try {
        const res = await query<{ areaPlans?: AreaPlan[] }>({
          field: 'areaPlans',
          args: {
            bbox: [xmin, ymin, xmax, ymax],
            spatialReference: extent.spatialReference.wkid,
          },
          select: {
            id: true,
            name: true,
            description: true,
            geometry: { select: { type: true, coordinates: true } },
          },
        });

        messages.removeMessage('area-plans-retrieving');

        if (res.errors) {
          messages.addMessage({
            id: 'area-plans-graphql-error',
            type: 'warning',
            text: 'Some data may contain errors...',
            dismissible: true,
          });
        }

        if (res.data?.areaPlans) this.list = res.data.areaPlans;
      } catch (err) {
        messages.removeMessage('area-plans-retrieving');
        messages.addMessage({
          id: 'area-plans-error-retrieving',
          type: 'error',
          text: 'Error retrieving area plans!',
          dismissible: true,
        });
        throw err;
      }
    },
    async selectPlan(plan: AreaPlan | undefined) {
      const messages = useMessageStore();

      messages.addMessage({
        id: 'area-plans-retrieving',
        type: 'info',
        text: `Retrieving area plan ${plan?.id}...`,
        dismissible: false,
      });

      this.selected = undefined;

      try {
        const res = await query<{ areaPlan?: AreaPlan[] }>({
          field: 'areaPlan',
          args: { id: plan ? String(plan.id) : '' },
          select: {
            id: true,
            name: true,
            description: true,
            manager: true,
            adopted: true,
            requirements: true,
            document: true,
            geometry: { select: { type: true, coordinates: true } },
          },
        });

        if (res.errors) {
          messages.addMessage({
            id: 'area-plans-graphql-error',
            type: 'warning',
            text: 'Some data may contain errors...',
            dismissible: true,
          });
        }

        if (res.data?.areaPlan) {
          this.selected = res.data.areaPlan.find(value => plan?.id == value.id);
        }
      } catch {
        messages.addMessage({
          id: 'area-plans-error-retrieving',
          type: 'error',
          text: 'Error retrieving the selected plan!',
          dismissible: true,
        });
      }

      messages.removeMessage('area-plans-retrieving');
    },
    unselectPlan() {
      const graphicsLayer = this.layers.find(
        layer => layer.id == 'plan-selection'
      ) as GraphicsLayer | undefined;
      graphicsLayer?.removeAll();
    },
    async highlightPlan({ plan, move }: { plan: AreaPlan; move: boolean }) {
      const map = useMapStore();
      let p: AreaPlan | undefined = plan;

      if (!plan.geometry) {
        if (this.list.length == 0) await this.findPlans();
        p = this.list.find(value => plan.id == value.id);
      }

      if (p?.geometry) {
        const graphics = esriGraphics(p.geometry);
        const graphicsLayer = this.layers.find(
          layer => layer.id == 'plan-selection'
        ) as GraphicsLayer;
        graphicsLayer.removeAll();
        graphicsLayer.addMany(graphics);

        if (move) {
          const extent = new Polygon(
            esriGeometry(bboxPolygon(bbox(p.geometry)).geometry)
          );
          map.goTo({ target: extent } as __esri.GoToTarget2D);
        }
      }
    },
  },
});
