<template>
  <section>
    <main class="my-2 flex flex-col">
      <section class="flex items-center justify-between">
        <label :for="group" class="flex items-center">
          <input
            type="checkbox"
            :id="group"
            :checked="enabled"
            :title="group"
            @change="
              setGroupVisibility(($event.target as HTMLInputElement).checked)
            "
          />
          <span class="mx-2 flex">
            {{ group.charAt(0).toUpperCase() + group.slice(1) }}
            classifications
          </span>
        </label>
        <button class="flex-1 flex flex-col items-end" @click="show = !show">
          <Icon
            type="solid"
            :name="show ? 'chevron-up' : 'chevron-down'"
            class="w-5 h-5"
          />
        </button>
      </section>
    </main>
    <transition name="pop">
      <footer
        v-if="show"
        class="my-2 p-2 bg-fog-100 text-fog-900 border border-fog-900 rounded"
      >
        <label
          v-for="entry in dataset"
          :key="entry.value"
          :for="entry.value"
          class="flex items-center"
        >
          <input
            type="checkbox"
            :id="entry.value"
            :checked="entry.enabled"
            @change="
              setVisibility(entry, ($event.target as HTMLInputElement).checked)
            "
          />
          <div
            v-if="entry.symbol?.type == 'color'"
            class="h-4 w-4 px-2 mx-2 border border-gray-900"
            :style="{ 'background-color': (entry.symbol.value as RGBColor)?.formatRgb?.() }"
          ></div>
          <div
            v-if="entry.symbol?.type == 'image'"
            class="mx-2 border border-gray-900"
          >
            <img
              class="h-4 w-4"
              :src="`data:${(entry.symbol as ImageSymbol).mime};base64,${entry.symbol.value}`"
            />
          </div>
          <span class="px-2">
            <router-link
              :to="{
                name: 'text',
                hash: `#${entry.label.toLowerCase().split(' ').join('-')}`,
              }"
              class="border-current border-b-2 hover:text-blue-600 focus:text-blue-600"
              >{{ entry.label }}</router-link
            >
          </span>
        </label>
      </footer>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RGBColor } from 'd3-color';
import { Icon } from '@pbotapps/components';

import { useMapStore } from '../../store/map';
import type { StreetViewModel, ImageSymbol } from '../../store/streets';

const props = defineProps<{
  group: string;
  dataset: StreetViewModel[];
  total: number;
}>();

const show = ref(false);
const map = useMapStore();

const enabled = computed(() =>
  props.dataset.reduce((prev, curr) => prev || curr.enabled, false)
);

function setGroupVisibility(value: boolean) {
  for (const entry of props.dataset) {
    setVisibility(entry, value);
  }
}

function setVisibility(model: StreetViewModel, value: boolean) {
  model.enabled = value;
  if (model.layer) {
    model.layer.visible = value;
    map.setLayerVisibility({
      layerId: model.layer.id as string,
      visible: value,
    });
  }
}
</script>

<style scoped>
.pop-enter-active {
  animation: pop-in 0.25s;
}
.pop-leave-active {
  animation: pop-in 0.25s reverse;
}
@keyframes pop-in {
  0% {
    transform: scale(0.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
