<template>
  <main
    class="flex flex-col-reverse sm:flex-row md:flex-col-reverse lg:flex-row"
  >
    <h1 class="sr-only">Street listings</h1>
    <section
      class="w-full sm:w-1/3 md:w-full lg:w-1/3 xl:w-1/4 h-full sm:h-screen md:h-full lg:h-(screen-16) overflow-y-auto border-t sm:border-t-0 md:border-t lg:border-t-0 sm:border-r md:border-r-0 lg:border-r border-black"
    >
      <section v-if="!route.params.id" class="m-2">
        <address-suggest v-on:candidate-select="goToAddress" />
        <section
          id="filters"
          class="my-2 border border-gray-500 rounded shadow bg-gray-100 text-gray-900"
        >
          <header
            class="border-gray-500"
            :class="{
              'border-b': showFilters,
            }"
          >
            <button
              class="p-2 w-full flex items-center justify-between focus:outline-none focus:shadow-outline"
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
          <main v-show="showFilters" :aria-expanded="showFilters" class="p-2">
            <div v-for="group in controllableModelGroups" :key="group">
              <classification
                :group="group"
                :dataset="modelsByGroup(group)"
                :total="streets.length"
              />
            </div>
          </main>
        </section>
        <section class="my-2">
          <Message
            v-if="streets.length > 0 && enabledModels.size == 0"
            color="orange"
          >
            Enable one or more classifications in the settings to display
            streets...
          </Message>
        </section>
        <div v-if="filteredStreets.length > 0">
          <ul class="list-none">
            <li
              v-for="street in filteredStreets"
              :key="street.uuid"
              class="my-2"
            >
              <router-link
                :to="{ name: 'streets', params: { id: street.id } }"
                @mouseover="
                  streetsStore.highlightStreet({ street, move: false })
                "
                @focus="streetsStore.highlightStreet({ street, move: false })"
                class="flex-shrink flex flex-col h-full px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
              >
                <div>{{ street.name?.trim() || 'Unnamed segment' }}</div>
                <div v-if="street.block" class="text-base text-gray-700">
                  {{ street.block }} block
                </div>
                <div
                  class="flex flex-row flex-wrap -mx-1 text-sm text-gray-600"
                >
                  <span
                    v-for="c in filteredClassifications(street.classifications)"
                    :key="`${c.group}-${c.value}`"
                    class="flex flex-row flex-wrap items-center mx-1"
                  >
                    <span
                      class="h-2 w-2 p-1 mr-1 border border-gray-900"
                      :style="{
                        'background-color': colorValue(c.group, c.value),
                      }"
                    ></span>
                    <span>{{
                      streetsStore.classificationLabel(c.group, c.value)
                    }}</span>
                  </span>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
      </section>
      <transition name="fade">
        <div class="m-2" v-if="route.params.id && selectedStreets">
          <header>
            <router-link
              to="/streets"
              class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
              >Back to results</router-link
            >
          </header>
          <Pager
            class="my-3"
            v-if="selectedStreets && selectedStreets.length > 1"
            :value="selectionIndex"
            :list="selectedStreets"
            @select="({ index }) => handleSelectionChange(index)"
          />
          <street-component v-if="selectedStreet" :street="selectedStreet" />
        </div>
      </transition>
    </section>
    <section
      class="w-full sm:w-2/3 md:w-full lg:w-2/3 xl:w-3/4 h-screen-50 sm:h-screen md:h-screen-50 lg:h-(screen-16) overflow-y-auto"
    >
      <app-map
        :layers="modelLayers"
        v-on:click="handleClick"
        v-on:extent-change="handleExtentChange"
      ></app-map>
    </section>
  </main>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon, Message } from '@pbotapps/components';
import { getLogger } from '../logging';

import AddressSuggest from '../components/AddressSuggest.vue';
import AppMap from '../components/Map.vue';
import Classification from '../components/streets/Classification.vue';
import Pager from '../components/Pager.vue';
import StreetComponent from '../components/Street.vue';

import { useMessageStore } from '../store/message';
import { useMapStore } from '../store/map';
import {
  usePortlandMapsStore,
  type AddressCandidate,
} from '../store/portlandMaps';
import {
  useStreetStore,
  type Street,
  type StreetViewModel,
} from '../store/streets';
import { useTextStore } from '../store/text';

const route = useRoute();
const router = useRouter();

const messages = useMessageStore();
const map = useMapStore();
const portlandMaps = usePortlandMapsStore();
const streetsStore = useStreetStore();
const textStore = useTextStore();
const logger = getLogger(['interactive-tsp', 'streets']);

const showFilters = ref(true);
const selectionIndex = ref(0);

const streets = computed(() => streetsStore.list || []);
const models = computed(() => streetsStore.models || []);
const selectedStreets = computed(() => streetsStore.selected);
const selectedStreet = computed(
  () => selectedStreets.value?.[selectionIndex.value]
);

const modelLayers = computed(
  () =>
    models.value.reduce((prev: __esri.Layer[], curr) => {
      if (curr.layer) prev.push(curr.layer as unknown as __esri.Layer);
      return prev;
    }, []) as unknown as import('@arcgis/core/layers/Layer').default[]
);

const controllableModelGroups = computed(() =>
  Array.from(
    models.value.reduce((prev, curr) => {
      if (curr.group != 'greenscape') prev.add(curr.group);
      return prev;
    }, new Set<string>())
  )
);

const enabledModels = computed(() =>
  models.value.reduce((prev, curr) => {
    if (curr.enabled) prev.add(curr);
    return prev;
  }, new Set<any>())
);

const filteredStreets = computed(() =>
  streets.value.reduce((prev: Street[], curr) => {
    if (
      models.value.find(value => {
        if (!curr.classifications || !value.enabled) return false;
        return curr.classifications[value.group] == value.value;
      })
    ) {
      prev.push(curr);
    }
    return prev;
  }, [])
);

function modelsByGroup(group: string) {
  return models.value.reduce((prev: any[], curr) => {
    if (curr.group === group) prev.push(curr as unknown as StreetViewModel);
    return prev;
  }, []) as unknown as StreetViewModel[];
}

function colorValue(group: string, value: string) {
  const color = streetsStore.classificationColor(group, value);
  return typeof color === 'string'
    ? color
    : color?.formatRgb?.() || 'transparent';
}

function filteredClassifications(classifications?: Record<string, string>) {
  if (!classifications) return [];

  return Array.from(enabledModels.value).reduce((prev, curr) => {
    if (classifications[curr.group] === curr.value) {
      prev.add({ group: curr.group, value: classifications[curr.group] });
    }
    return prev;
  }, new Set<{ group: string; value: string }>());
}

function handleClick(event: __esri.ViewClickEvent) {
  map.view?.hitTest(event).then(response => {
    response.results.some(result => {
      const graphic = (result as __esri.GraphicHit).graphic;

      if (!graphic?.attributes) return false;

      if (Object.keys(graphic.attributes).find(key => key === 'TranPlanID')) {
        if (graphic.attributes.TranPlanID != route.params.id)
          router.push({
            name: 'streets',
            params: { id: graphic.attributes.TranPlanID },
          });
        return true;
      }

      return false;
    });
  });
}

function goToAddress(address: AddressCandidate) {
  map.setLocation(address.location);
}

function handleExtentChange(extent: __esri.Extent) {
  logger.debug('Map extent changed', {
    lookup: !route.params.id,
    wkid: extent.spatialReference.wkid,
  });
  if (!route.params.id) {
    streetsStore.findStreets(extent);
  }
}

function handleSelectionChange(index: number) {
  selectionIndex.value = index;
  const street = selectedStreets.value?.[selectionIndex.value];
  if (street) streetsStore.highlightStreet({ street, move: true });
}

watch(
  () => route.params.id,
  id => {
    messages.clearMessages();
    streetsStore.loadModels();

    if (id) {
      selectionIndex.value = 0;
      textStore.findText();
      streetsStore.selectStreet({ id } as Street);
    } else {
      streetsStore.findStreets(map.extent as unknown as __esri.Extent);
    }
  },
  { immediate: true }
);
</script>
