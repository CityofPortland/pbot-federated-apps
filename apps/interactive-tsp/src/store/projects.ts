import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import axios from 'axios';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import { rgb, RGBColor } from 'd3-color';
import lunr from 'lunr';
type Geometry = any;

import Polygon from '@arcgis/core/geometry/Polygon';
import Layer from '@arcgis/core/layers/Layer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import UniqueValueInfo from '@arcgis/core/renderers/support/UniqueValueInfo';

import { query } from '../queries/query';

import { customStemming, esriGeometry, esriGraphics } from './utils';
import { defaultExtent, useMapStore } from './map';
import { useMessageStore } from './message';

export interface Project {
  id: string;
  name?: string;
  geometry?: Geometry;
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
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export interface ProjectViewModel {
  key: string;
  value: string;
  label: string;
  color: RGBColor;
  enabled: boolean;
  mapLayer: Layer;
  count: number;
}

const LAYER_URLS = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24',
];

const timeframeKeys = new Map<string, string>([
  ['1-10_YRS', 'projects-10'],
  ['11-20_YRS', 'projects-20'],
  ['NA', 'projects-NA'],
]);

export const useProjectStore = defineStore('projects', {
  state: () => ({
    models: new Array<ProjectViewModel>(),
    list: new Array<Project>(),
    candidates: undefined as Project[] | undefined,
    index: undefined as lunr.Index | undefined,
    selected: undefined as Project[][] | undefined,
  }),
  getters: {
    mapLayers(state) {
      return state.models.map(model => model.mapLayer);
    },
    filteredProjects(state) {
      return (text: string): Project[] => {
        let projects = state.list;

        const modelsByValue = new Map(
          state.models.map(model => [model.value, model])
        );

        if (text && state.index) {
          projects = state.index
            .search(text)
            .map(
              val =>
                state.list.find(proj => proj.id == val.ref) ||
                ({ id: val.ref } as Project)
            )
            .reduce((prev, curr) => {
              if (
                curr.estimatedTimeframe &&
                modelsByValue.has(curr.estimatedTimeframe)
              ) {
                prev.push(curr);
              }
              return prev;
            }, new Array<Project>());
        }

        return projects;
      };
    },
  },
  actions: {
    // populates the timeframe view models/map layers from the renderer of the TSP project layers
    async loadModels() {
      if (this.models.length > 0) return;

      const models = new Array<ProjectViewModel>();

      const res = await axios.get(LAYER_URLS[0], { params: { f: 'json' } });

      if (res.data) {
        models.push(
          ...res.data.drawingInfo.renderer.uniqueValueInfos.reduce(
            (prev: ProjectViewModel[], json: UniqueValueInfo) => {
              const info = UniqueValueInfo.fromJSON(json);
              const { r, g, b, a } = info.symbol.color;
              const key = timeframeKeys.get(info.value.toString());

              if (key) {
                prev.push({
                  key,
                  value: info.value.toString(),
                  label: info.label,
                  color: rgb(r, g, b, a),
                  enabled: true,
                  count: 0,
                  mapLayer: markRaw(
                    new GroupLayer({
                      id: key,
                      title: info.label,
                      visibilityMode: 'inherited',
                      visible: true,
                      layers: LAYER_URLS.map(url =>
                        markRaw(
                          new FeatureLayer({
                            url,
                            outFields: ['*'],
                            definitionExpression: `estimatedTimeFrame = '${info.value.toString()}'`,
                          })
                        )
                      ),
                    })
                  ),
                });
              }

              return prev;
            },
            new Array<ProjectViewModel>()
          )
        );
      }

      this.models = models;
    },
    async findProjects() {
      if (this.list.length > 0) return;

      const messages = useMessageStore();
      messages.addMessage({
        id: 'projects-retrieving',
        type: 'info',
        text: 'Retrieving projects...',
        dismissible: false,
      });

      let projects = new Array<Project>();

      const extent = defaultExtent;
      const { xmin, ymin, xmax, ymax } = extent;

      try {
        const res = await query<{ projects?: Project[] }>({
          field: 'projects',
          args: {
            bbox: [xmin, ymin, xmax, ymax],
            spatialReference: extent.spatialReference.wkid,
          },
          select: {
            id: true,
            name: true,
            number: true,
            location: true,
            description: true,
            agency: true,
            estimatedCost: true,
            estimatedTimeframe: true,
            district: true,
            facilityOwner: true,
            patternArea: true,
            fundingCategory: true,
            geometry: { select: { type: true, coordinates: true } },
          },
        });

        if (res.errors) {
          messages.addMessage({
            id: 'project-graphql-error',
            type: 'warning',
            text: 'Some projects may contain errors...',
            dismissible: true,
          });
        }

        if (res.data?.projects) {
          // sort by name then block number
          projects = [...res.data.projects].sort((a, b) => {
            const nameA = a.name?.toUpperCase();
            const nameB = b.name?.toUpperCase();

            if (!nameA || !nameB) return Number.MAX_SAFE_INTEGER;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
          });

          this.list = projects;

          this.analyzeProjects();

          messages.removeMessage('projects-retrieving');
        }
      } catch (err) {
        messages.addMessage({
          id: 'projects-find-error',
          type: 'error',
          text: 'Error retrieving projects...',
          dismissible: true,
        });
        throw err;
      }

      this.index = lunr(function () {
        this.ref('id');
        this.field('name');
        this.field('description');

        this.use(customStemming);

        projects.forEach(doc => this.add(doc));
      });
    },
    analyzeProjects() {
      this.models = this.list.reduce((prev, curr) => {
        const entry = prev.find(
          value => value.value === curr.estimatedTimeframe
        );
        if (entry) entry.count = entry.count + 1;
        return prev;
      }, this.models);
    },
    async highlightProject({
      project,
      move,
    }: {
      project: Project;
      move: boolean;
    }) {
      const map = useMapStore();
      let p: Project | undefined = project;

      if (!project.geometry) {
        await this.findProjects();
        p = this.list.find(value => value.id === project.id);
      }

      if (p?.geometry) {
        map.setGraphics(esriGraphics(p.geometry));

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
