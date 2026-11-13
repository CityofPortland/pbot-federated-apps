<template>
  <main
    class="flex flex-col-reverse sm:flex-row md:flex-col-reverse lg:flex-row"
  >
    <h1 class="sr-only">Area plans</h1>
    <section
      class="w-full sm:w-1/3 md:w-full lg:w-1/3 xl:w-1/4 h-full sm:h-screen md:h-full lg:h-(screen-16) overflow-y-auto border-t sm:border-t-0 md:border-t lg:border-t-0 sm:border-r md:border-r-0 lg:border-r border-black"
    >
      <section v-if="!$route.params.id" class="m-2">
        <header>
          <address-suggest v-on:candidate-select="goToAddress" />
        </header>
        <section
          id="filters"
          class="my-2 border border-gray-500 rounded shadow bg-gray-100 text-gray-900"
        >
          <header :class="{ 'border-b': showFilters }">
            <button
              class="p-2 w-full flex items-center justify-between"
              @click="showFilters = !showFilters"
            >
              <h2 class="flex items-center">
                <Icon type="solid" name="cog" class="w-5 h-5" />
                <span class="px-2">Settings</span>
              </h2>
              <Icon
                type="solid"
                :name="showFilters ? 'chevron-up' : 'chevron-down'"
                class="w-5 h-5"
              />
            </button>
          </header>
          <main
            v-show="showFilters"
            :aria-expanded="`${showFilters}`"
            class="p-2"
          >
            <form class="grid grid-cols-1 gap-1" @submit.prevent>
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    id="filterExtent"
                    v-model="filterExtent"
                  />

                  <span class="px-2">Filter plans by map extent</span>
                </label>
              </div>
              <div class="my-2">
                <button
                  class="px-2 py-1 border border-blue-900 rounded-md bg-blue-500 text-blue-100 flex items-center"
                  @click="map.resetExtent"
                >
                  <Icon type="solid" name="external-link" class="w-5 h-5" />
                  <span class="pl-2">Reset map extent</span>
                </button>
              </div>
            </form>
          </main>
        </section>
        <ul class="list-none">
          <li v-for="plan in filteredPlans" :key="plan.id">
            <plan-listing :plan="plan">
              <template v-slot>
                <h3 class="text-lg">{{ plan.name }}</h3>
              </template>
            </plan-listing>
          </li>
        </ul>
      </section>
      <section v-else class="m-2">
        <div>
          <router-link
            to="/area-plans"
            class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
            >Back to results</router-link
          >
        </div>
        <pager
          class="my-3"
          v-if="plansList && plansList.length > 1"
          :value="selectionIndex"
          :list="plansList"
          @select="handlePlanChange($event.index)"
        />
        <main v-if="selectedPlan">
          <plan-full :plan="selectedPlan" />
        </main>
      </section>
    </section>
    <section class="w-full h-screen-50 lg:h-(screen-16)">
      <app-map :layers="layers" v-on:click="handleClick" />
    </section>
  </main>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import type { GraphicHit } from '@arcgis/core/views/types';
import type { ClickEvent } from '@arcgis/core/views/input/types.js';
import bboxPolygon from '@turf/bbox-polygon';
import intersects from '@turf/boolean-intersects';
import { feature } from '@turf/helpers';
import proj4 from 'proj4';
import { Icon } from '@pbotapps/components';

import AddressSuggest from '../components/AddressSuggest.vue';
import AppMap from '../components/Map.vue';
import Pager from '../components/Pager.vue';
import PlanFull from '../components/area_plans/Full.vue';
import PlanListing from '../components/area_plans/List.vue';
import { useAreaPlanStore } from '../store/areaPlans';
import { useMapStore } from '../store/map';

const route = useRoute();
const router = useRouter();
const areaPlans = useAreaPlanStore();
const map = useMapStore();
const showFilters = ref(true);
const filterExtent = ref(true);
const plansList = ref<number[]>([]);
const selectionIndex = ref(0);
const layers =
  areaPlans.layers as unknown as import('@arcgis/core/layers/Layer').default[];
const selectedPlan = computed(() => areaPlans.selected);
const filteredPlans = computed(() => {
  if (!filterExtent.value) return areaPlans.list;
  let { xmin, ymin, xmax, ymax } = map.extent;
  [xmin, ymin] = proj4('EPSG:3857', 'EPSG:4326', [xmin, ymin]);
  [xmax, ymax] = proj4('EPSG:3857', 'EPSG:4326', [xmax, ymax]);
  const polygon = bboxPolygon([xmin, ymin, xmax, ymax]);
  return areaPlans.list.filter(plan =>
    intersects(polygon, feature(plan.geometry))
  );
});

function handlePlanChange(index: number) {
  selectionIndex.value = index;
  router.push({ name: 'area-plans', params: { id: plansList.value[index] } });
}

function handleClick(event: ClickEvent) {
  map.view?.hitTest(event).then(response => {
    const ids = new Set<number>();
    response.results.forEach(result => {
      const attributes = (result as GraphicHit).graphic?.attributes;
      if (attributes?.TranPlanID) ids.add(attributes.TranPlanID);
    });
    plansList.value = Array.from(ids);
    selectionIndex.value = 0;
    if (plansList.value[0])
      router.push({ name: 'area-plans', params: { id: plansList.value[0] } });
  });
}

function goToAddress(address: {
  location: {
    x: number;
    y: number;
    spatialReference: Partial<SpatialReference>;
  };
}) {
  map.setLocation(address.location);
}

watch(
  () => route.params.id,
  async id => {
    if (areaPlans.list.length === 0) await areaPlans.findPlans();
    if (id) {
      const plan = { id: Number(id) } as any;
      await areaPlans.selectPlan(plan);
      await areaPlans.highlightPlan({ plan, move: true });
    } else {
      areaPlans.unselectPlan();
    }
  },
  { immediate: true }
);
</script>
