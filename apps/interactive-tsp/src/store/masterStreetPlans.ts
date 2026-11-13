import { defineStore } from 'pinia';
import { computed, markRaw, ref } from 'vue';
import { useQueryCache } from '@pinia/colada';
import { masterStreetPlansQuery } from '../queries/masterStreetPlans';
import { query } from '../queries/query';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import type { Geometry } from 'geojson';

import Polygon from '@arcgis/core/geometry/Polygon';
import Layer from '@arcgis/core/layers/Layer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';

import { esriGeometry, esriGraphics } from './utils';
import { useMapStore } from './map';
import { useMessageStore } from './message';

export interface MasterStreetPlanFeature {
  id: string;
  type: string;
  alignment: string;
  count: number;
  enabled: boolean;
}

export interface MasterStreetPlan {
  id: number;
  name: string;
  description: string;
  manager: string;
  adopted: string;
  document: string;
  features?: Array<MasterStreetPlanFeature>;
  geometry: Geometry;
}

const LAYER_URLS = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/29',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/30',
];

export const useMasterStreetPlanStore = defineStore('masterStreetPlans', () => {
  const queryCache = useQueryCache();
  const list = computed(
    () => queryCache.getQueryData(masterStreetPlansQuery.key) ?? []
  );
  const selected = ref<MasterStreetPlan | undefined>(undefined);
  const layers = ref([
    new FeatureLayer({
      id: 'plan-areas',
      url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/31',
      outFields: ['TranPlanID'],
    }),
    new GraphicsLayer({
      id: 'plan-selection',
    }),
    new GroupLayer({
      id: 'plan-features',
      visibilityMode: 'inherited',
      visible: false,
      layers: LAYER_URLS.map(url =>
        markRaw(
          new FeatureLayer({
            url,
            outFields: ['TranPlanID', 'Type', 'Alignment'],
          })
        )
      ),
    }),
  ]);

  async function initialize(): Promise<void> {
    await queryCache.refresh(queryCache.ensure(masterStreetPlansQuery));
  }

  async function selectPlan(plan: Pick<MasterStreetPlan, 'id'>) {
    const messages = useMessageStore();

    messages.addMessage({
      id: 'master-street-plans-retrieving-street',
      type: 'info',
      text: `Retrieving master street plan ${plan.id}...`,
      dismissible: false,
    });

    selected.value = undefined;

    try {
      const res = await query<{ masterStreetPlan?: MasterStreetPlan[] }>({
        field: 'masterStreetPlan',
        args: { id: plan ? String(plan.id) : '' },
        select: {
          id: true,
          name: true,
          description: true,
          adopted: true,
          document: true,
          geometry: { select: { type: true, coordinates: true } },
          features: { select: { id: true, type: true, alignment: true } },
        },
      });

      if (res.errors) {
        messages.addMessage({
          id: 'master-street-plans-graphql-error',
          type: 'warning',
          text: 'Some data may contain errors...',
          dismissible: true,
        });
      }

      if (res.data?.masterStreetPlan) {
        const p = res.data.masterStreetPlan[0];

        p.features = p.features?.reduce((prev, curr) => {
          const feature = prev.find(
            value =>
              value.type == curr.type && value.alignment == curr.alignment
          );
          if (!feature) {
            prev.push({
              id: `${curr.type?.toLowerCase()}-${curr.alignment?.toLowerCase()}`,
              type: curr.type,
              alignment: curr.alignment,
              count: 1,
              enabled: true,
            });
          } else {
            feature.count = feature.count + 1;
          }
          return prev;
        }, new Array<MasterStreetPlanFeature>());

        selected.value = p;

        const map = useMapStore();
        map.setLayerVisibility({ layerId: 'plan-features', visible: true });
      }
    } catch {
      messages.addMessage({
        id: 'master-street-plans-error-retrieving',
        type: 'error',
        text: 'Error retrieving the selected master street plan!',
        dismissible: true,
      });
    } finally {
      messages.removeMessage('master-street-plans-retrieving-street');
    }
  }

  function unselectPlan() {
    const map = useMapStore();
    map.setLayerVisibility({ layerId: 'plan-features', visible: false });
  }

  function toggleFeature({
    feature,
    value,
  }: {
    feature: MasterStreetPlanFeature;
    value: boolean;
  }) {
    if (selected.value?.features) {
      selected.value.features = selected.value.features.map(f => {
        if (f.id == feature.id) f.enabled = value;
        return f;
      });

      filterPlanFeatures();
    }
  }
  function filterPlanFeatures() {
    const map = useMapStore();

    if (selected.value?.features) {
      const enabledFeatures = selected.value.features.filter(
        val => val.enabled
      );

      const typeRange = enabledFeatures.map(val => `'${val.type}'`).join(',');
      const alignmentRange = enabledFeatures
        .reduce((acc, curr) => {
          if (curr.alignment) acc.push(`'${curr.alignment}'`);
          return acc;
        }, new Array<string>())
        .join(',');

      const filter = new FeatureFilter({
        where: [
          `PlanArea = '${selected.value?.name}'`,
          `Type IN (${typeRange})`,
          alignmentRange.length > 0
            ? `(Alignment IS NULL OR Alignment IN (${alignmentRange}))`
            : undefined,
        ].reduce((acc, curr, idx) => {
          if (curr) {
            acc = acc?.concat(idx > 0 ? ' AND ' : '', curr);
          }
          return acc;
        }, ''),
      });

      const featuresLayer = layers.value.find(
        layer => layer.id === 'plan-features'
      ) as GroupLayer;

      featuresLayer?.layers.forEach((layer: Layer) => {
        map.setFilter({ layer: layer as FeatureLayer, filter });
      });
    }
  }

  async function highlightPlan({
    plan,
    move,
  }: {
    plan: Partial<MasterStreetPlan>;
    move: boolean;
  }) {
    const map = useMapStore();

    if (!plan.geometry) {
      await initialize();
      plan = list.value.find(value => value.id == plan.id) ?? plan;
    }

    if (plan?.geometry) {
      const graphics = esriGraphics(plan.geometry);
      const graphicsLayer = layers.value.find(
        layer => layer.id == 'plan-selection'
      ) as GraphicsLayer;
      graphicsLayer.removeAll();
      graphicsLayer.addMany(graphics);

      if (move) {
        const extent = new Polygon(
          esriGeometry(bboxPolygon(bbox(plan.geometry)).geometry)
        );
        map.goTo({ target: extent } as __esri.GoToTarget2D);
      }
    }
  }

  return {
    filterPlanFeatures,
    highlightPlan,
    initialize,
    layers,
    list,
    selected,
    selectPlan,
    toggleFeature,
    unselectPlan,
  };
});
