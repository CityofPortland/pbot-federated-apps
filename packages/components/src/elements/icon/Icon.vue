<template>
  <svg
    v-if="type == 'outline'"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    class="inline-flex"
  >
    <path
      v-for="(path, index) in paths"
      :key="index"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      :d="path"
    />
  </svg>
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      v-for="(path, index) in paths"
      :key="index"
      fill-rule="evenodd"
      clip-rule="evenodd"
      :d="path"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

import icons from './icons';

export default defineComponent({
  name: 'Icon',
  props: {
    title: {
      type: String,
    },
    type: {
      type: String as () => 'outline' | 'solid',
      default: 'outline',
    },
    name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return {
      paths: computed(() => {
        const p = new Array<string>();
        const i = icons[props.type][props.name];

        if (Array.isArray(i)) {
          p.push(...i);
        } else {
          p.push(i);
        }

        return p;
      }),
    };
  },
});
</script>
