<template>
  <Box
    as="section"
    :color="color"
    :variant="variant"
    class="border-current rounded-md shadow"
  >
    <Box
      as="header"
      :color="color"
      :variant="variant"
      class="w-full border-current border rounded-t-md"
      :class="{
        'border-b-0': open,
        'rounded-b-md': !open,
      }"
    >
      <button
        type="button"
        class="p-2 w-full flex items-center justify-between rounded-t-md focus:outline-none focus:ring-4"
        :class="{
          'rounded-b-md': !open,
        }"
        @click="toggle()"
      >
        <slot name="header">
          <h2 class="flex items-center space-x-2">
            <Icon v-if="icon" type="outline" :name="icon" class="w-6 h-6" />
            <span>{{ name }}</span>
          </h2>
        </slot>
        <Icon
          type="solid"
          name="chevron-down"
          class="w-5 h-5 transition ease-in-out duration-100"
          :class="{ transform: open, 'rotate-180': open }"
        />
      </button>
    </Box>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform scale-y-95"
      enter-to-class="transform scale-y-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform scale-y-100"
      leave-to-class="transform scale-y-95"
    >
      <main
        v-show="open"
        :aria-expanded="open"
        class="border border-current rounded-b-md"
      >
        <slot></slot>
      </main>
    </transition>
  </Box>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

import Box, { BoxColor, BoxColorVariant } from '@/elements/box/Box';
import Icon from '@/elements/icon/Icon.vue';

export default defineComponent({
  name: 'Panel',
  components: {
    Box,
    Icon,
  },
  props: {
    as: {
      type: String,
      default: 'fieldset',
    },
    open: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      default: 'Settings',
    },
    color: {
      type: String as () => BoxColor,
      default: 'gray',
    },
    variant: {
      type: String as () => BoxColorVariant,
      default: 'light',
    },
  },
  setup(props, { emit }) {
    return {
      toggle() {
        emit('toggle', !open);
      },
    };
  },
});
</script>
