<script setup lang="ts">
import Color from 'color';
import { computed } from 'vue';
import { colors, step, ColorKey } from '../../src/colors';

const props = defineProps({
  color: {
    type: String as () => ColorKey,
    required: true,
  },
});

const color = computed(() => colors[props.color]);

const stops = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

const getStep = (color: Color, stop: number) => {
  let s = 0;

  if (stop < 0) {
    const space = color.lightness();
    s = space / 5;
  } else if (stop > 0) {
    const space = 100 - color.lightness();
    s = space / 5;
  }

  return step(color, s, stop);
};
</script>

<template>
  <div
    style="width: 100%; padding: 1rem"
    :style="{ 'background-color': color }"
  >
    <span style="padding: 0.25rem; background-color: white; color: black">{{
      color.hex()
    }}</span>
    <ul style="display: flex; flex-wrap: wrap; padding: 0">
      <li
        v-for="stop in stops"
        :key="stop"
        style="
          list-style: none;
          padding: 0.5rem;
          width: 50%;
          display: flex;
          gap: 0.5rem;
        "
        :style="{ 'background-color': getStep(color, stop) }"
      >
        <span
          v-if="getStep(color, stop).contrast(getStep(color, stop)) < 4.5"
          style="padding: 0.25rem; background-color: red; color: white"
          >Fail</span
        >
        <span
          v-else
          style="padding: 0.25rem; background-color: green; color: white"
          >{{
            getStep(color, stop).contrast(getStep(color, stop)) > 7
              ? 'AAA'
              : 'AA'
          }}
        </span>
        <span style="padding: 0.25rem; background-color: white; color: black"
          >{{ getStep(color, stop).hex() }}
        </span>
      </li>
    </ul>
  </div>
</template>
