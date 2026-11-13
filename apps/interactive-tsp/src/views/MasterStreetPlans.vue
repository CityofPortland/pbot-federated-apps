<template>
  <main
    class="flex flex-col-reverse sm:flex-row md:flex-col-reverse lg:flex-row"
  >
    <h1 class="sr-only">Master street plans</h1>
    <section
      class="w-full sm:w-1/3 md:w-full lg:w-1/3 xl:w-1/4 h-full sm:h-screen md:h-full lg:h-(screen-16) overflow-y-auto border-t sm:border-t-0 md:border-t lg:border-t-0 sm:border-r md:border-r-0 lg:border-r border-black"
    >
      <div class="my-2">
        <button
          class="px-2 py-1 border rounded"
          :disabled="asyncStatus === 'loading'"
          @click="refetch()"
        >
          {{ asyncStatus === 'loading' ? 'Loading plans...' : 'Refresh plans' }}
        </button>
        <p v-if="plansState.error" role="alert" class="my-2">
          Unable to retrieve master street plans. Refresh plans to try again.
        </p>
      </div>
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
            <plan-listing :plan="plan" :show-type="false" />
          </li>
        </ul>
      </section>
      <section v-else class="m-2">
        <div>
          <router-link
            to="/master-street-plans"
            class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
            >Back to results</router-link
          >
        </div>
        <main v-if="selectedPlan">
          <plan-full :plan="selectedPlan" />
        </main>
      </section>
    </section>
    <section class="w-full h-screen-50 lg:h-(screen-16)">
      <app-map
        :layers="masterStreetPlans.layers"
        v-on:click="handleClick"
        @pointer-hit="handlePointerHit"
      >
        <template v-slot:top-right>
          <section
            v-if="selectedFeature"
            class="p-4 border-2 border-black rounded shadow bg-white"
          >
            <div>{{ selectedFeature.type }}</div>
            <div
              v-if="selectedFeature.alignment"
              class="text-base text-gray-700"
            >
              {{ selectedFeature.alignment }}
            </div>
          </section>
        </template>
      </app-map>
    </section>
  </main>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuery } from '@pinia/colada';
import { masterStreetPlansQuery } from '../queries/masterStreetPlans';
import { useRoute, useRouter } from 'vue-router';

import bboxPolygon from '@turf/bbox-polygon';
import intersects from '@turf/boolean-intersects';
import { feature } from '@turf/helpers';
import { Icon } from '@pbotapps/components';

import AddressSuggest from '../components/AddressSuggest.vue';
import AppMap from '../components/Map.vue';
import PlanFull from '../components/master_street_plans/Full.vue';
import PlanListing from '../components/master_street_plans/List.vue';
import proj4 from '../proj4';
import { useMapStore } from '../store/map';
import { useMasterStreetPlanStore } from '../store/masterStreetPlans';

const route = useRoute();
const router = useRouter();
const map = useMapStore();
const masterStreetPlans = useMasterStreetPlanStore();
const {
  state: plansState,
  asyncStatus,
  refetch,
} = useQuery(masterStreetPlansQuery);
const showFilters = ref(true);
const filterExtent = ref(true);
const selectedFeature = ref<{ type: string; alignment?: string }>();
const selectedPlan = computed(() => masterStreetPlans.selected);
const filteredPlans = computed(() => {
  if (!filterExtent.value) return masterStreetPlans.list;
  let { xmin, ymin, xmax, ymax } = map.extent;
  [xmin, ymin] = proj4(
    map.extent.spatialReference.wkid?.toString(),
    'EPSG:4326',
    [xmin, ymin]
  );
  [xmax, ymax] = proj4(
    map.extent.spatialReference.wkid?.toString(),
    'EPSG:4326',
    [xmax, ymax]
  );
  const polygon = bboxPolygon([xmin, ymin, xmax, ymax]);
  return masterStreetPlans.list.filter(plan =>
    intersects(polygon, feature(plan.geometry))
  );
});

function handleClick(event: __esri.ViewClickEvent) {
  map.view?.hitTest(event).then(response => {
    const hit = response.results.find(result => {
      const graphic = (result as __esri.GraphicHit).graphic;
      return (
        graphic?.layer?.id === 'plan-areas' && graphic.attributes?.TranPlanID
      );
    }) as __esri.GraphicHit | undefined;
    const id = hit?.graphic?.attributes?.TranPlanID;
    if (id && id != route.params.id)
      router.push({ name: 'master-street-plans', params: { id } });
  });
}

function handlePointerHit(results: __esri.HitTestResult['results']) {
  if (!selectedPlan.value) return;
  const hit = results.find(
    result => (result as __esri.GraphicHit).graphic?.attributes?.Type
  ) as __esri.GraphicHit | undefined;
  if (hit) {
    selectedFeature.value = {
      type: hit.graphic.attributes.Type,
      alignment: hit.graphic.attributes.Alignment,
    };
  }
}

function goToAddress(address: {
  location: { x: number; y: number; spatialReference: __esri.SpatialReference };
}) {
  map.setLocation(address.location);
}

watch(
  () => route.params.id,
  async id => {
    if (id) {
      const plan = { id: Number(id) };
      await masterStreetPlans.selectPlan(plan);
      if (masterStreetPlans.selected?.id === plan.id) {
        await masterStreetPlans.highlightPlan({
          plan: masterStreetPlans.selected,
          move: true,
        });
      }
    } else {
      masterStreetPlans.unselectPlan();
    }
  },
  { immediate: true }
);
</script>
